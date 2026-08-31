package com.solvers.app.mapbox

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.widget.FrameLayout
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.mapbox.api.directions.v5.models.RouteOptions
import com.mapbox.geojson.Point
import com.mapbox.maps.MapView
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.plugin.animation.camera
import com.mapbox.navigation.base.extensions.applyDefaultNavigationOptions
import com.mapbox.navigation.base.formatter.DistanceFormatterOptions
import com.mapbox.navigation.base.formatter.UnitType
import com.mapbox.navigation.base.options.NavigationOptions
import com.mapbox.navigation.base.route.NavigationRoute
import com.mapbox.navigation.base.route.NavigationRouterCallback
import com.mapbox.navigation.base.route.RouterFailure
import com.mapbox.navigation.base.route.RouterOrigin
import com.mapbox.navigation.core.MapboxNavigation
import com.mapbox.navigation.core.directions.session.RoutesObserver
import com.mapbox.navigation.core.trip.session.LocationMatcherResult
import com.mapbox.navigation.core.trip.session.LocationObserver
import com.mapbox.navigation.ui.maps.NavigationStyles
import com.mapbox.navigation.ui.maps.camera.NavigationCamera
import com.mapbox.navigation.ui.maps.camera.data.MapboxNavigationViewportDataSource
import com.mapbox.navigation.ui.maps.route.line.api.MapboxRouteLineApi
import com.mapbox.navigation.ui.maps.route.line.api.MapboxRouteLineView
import com.mapbox.navigation.ui.maps.route.line.model.MapboxRouteLineOptions
import com.mapbox.navigation.ui.maps.route.line.model.RouteLineColorResources
import com.mapbox.navigation.ui.maps.route.line.model.RouteLineResources
import com.mapbox.navigation.ui.voice.api.MapboxSpeechApi
import com.mapbox.navigation.ui.voice.api.MapboxVoiceInstructionsPlayer
import com.mapbox.navigation.ui.voice.model.SpeechAnnouncement
import com.mapbox.navigation.ui.voice.model.SpeechError
import com.solvers.app.R
import java.lang.ref.WeakReference

/**
 * NavigationEmbeddedView
 *
 * Encapsula toda la lógica de NavigationActivity como un View embebible.
 * Se añade al decorView de la Activity de RN con alpha=0 (pre-renderizado
 * en segundo plano), y se revela cuando el usuario confirma la navegación.
 *
 * La voz se activa sólo al llamar enableVoice() para evitar
 * anuncios inesperados durante el pre-cargado.
 */
class NavigationEmbeddedView(
    context: Context,
    lifecycleOwner: LifecycleOwner,
    private val destLat: Double,
    private val destLng: Double,
) : FrameLayout(context), DefaultLifecycleObserver {

    companion object {
        private const val TAG = "NavigationEmbeddedView"
        // Coordenadas mock para emulador (sin GPS real).
        // En dispositivo físico el GPS llega antes del timeout y este valor no se usa.
        private const val MOCK_LAT = 10.479083
        private const val MOCK_LNG = -66.811774
        private const val GPS_TIMEOUT_MS = 15000L
    }

    // ── Propiedades ────────────────────────────────────────────────────────────
    // IMPORTANTE: los observers se declaran ANTES de init{} para que Kotlin
    // pueda referenciarlos dentro del bloque de inicialización.

    private val mapView: MapView = run {
        LayoutInflater.from(context).inflate(R.layout.activity_navigation, this, true)
        findViewById(R.id.mapView)
    }
    private val mapboxMap: MapboxMap get() = mapView.getMapboxMap()

    private lateinit var mapboxNavigation: MapboxNavigation
    private lateinit var navigationCamera: NavigationCamera
    private lateinit var viewportDataSource: MapboxNavigationViewportDataSource
    private lateinit var routeLineApi: MapboxRouteLineApi
    private lateinit var routeLineView: MapboxRouteLineView
    private lateinit var speechApi: MapboxSpeechApi
    private lateinit var voiceInstructionsPlayer: MapboxVoiceInstructionsPlayer

    private var voiceEnabled              = false
    @Volatile private var routeRequested  = false
    /** Contador de updates de ubicación tras revelar la vista; se usa para re-fijar la cámara */
    @Volatile private var followLockCount = 0
    private var onNavigationEnd: ((String) -> Unit)? = null
    private val lifecycleRef              = WeakReference(lifecycleOwner)
    @Volatile var isDestroyed             = false

    // Fallback GPS para emulador: si en GPS_TIMEOUT_MS no llega señal, usar mock
    private val gpsTimeoutHandler  = android.os.Handler(android.os.Looper.getMainLooper())
    private val gpsTimeoutRunnable = Runnable {
        if (!routeRequested && !isDestroyed) {
            routeRequested = true
            Log.d(TAG, "GPS timeout → usando ubicación mock (emulador)")
            fetchRoute(
                Point.fromLngLat(MOCK_LNG, MOCK_LAT),
                Point.fromLngLat(destLng, destLat)
            )
        }
    }

    // Observers declarados aquí (antes de init) para poder pasarlos a
    // mapboxNavigation.register*() dentro del bloque init{}.
    private val locationObserver = object : LocationObserver {
        override fun onNewRawLocation(rawLocation: android.location.Location) {}
        override fun onNewLocationMatcherResult(result: LocationMatcherResult) {
            if (isDestroyed) return
            val enhanced = result.enhancedLocation
            viewportDataSource.onLocationChanged(enhanced)
            viewportDataSource.evaluate()

            // Re-asegurar modo seguimiento durante los primeros 10 updates tras el reveal.
            // Esto corrige el estado de la cámara cuando la vista pasa de alpha=0 a visible.
            if (followLockCount in 1..10) {
                followLockCount++
                post {
                    if (!isDestroyed) navigationCamera.requestNavigationCameraToFollowing()
                }
            }

            if (!routeRequested) {
                routeRequested = true
                gpsTimeoutHandler.removeCallbacks(gpsTimeoutRunnable) // cancelar mock
                val origin = Point.fromLngLat(enhanced.longitude, enhanced.latitude)
                Log.d(TAG, "GPS real: ${enhanced.latitude}, ${enhanced.longitude}")
                fetchRoute(origin, Point.fromLngLat(destLng, destLat))
            }
        }
    }

    private val routesObserver = RoutesObserver { routeUpdateResult ->
        if (isDestroyed) return@RoutesObserver
        routeLineApi.setNavigationRoutes(routeUpdateResult.navigationRoutes) { value ->
            post {
                if (isDestroyed) return@post
                try {
                    mapboxMap.getStyle()?.apply { routeLineView.renderRouteDrawData(this, value) }
                } catch (e: Exception) {
                    Log.e(TAG, "renderRouteDrawData error: ${e.message}")
                }
            }
        }
    }

    // ── Inicialización ─────────────────────────────────────────────────────────
    init {
        // Botón cerrar → notifica al módulo que el usuario salió
        findViewById<FloatingActionButton>(R.id.btnClose)?.setOnClickListener {
            notifyEnd("cancelled")
        }

        val accessToken = context.getString(R.string.mapbox_access_token)

        mapboxNavigation = MapboxNavigation(
            NavigationOptions.Builder(context)
                .accessToken(accessToken)
                .distanceFormatterOptions(
                    DistanceFormatterOptions.Builder(context)
                        .unitType(UnitType.METRIC)
                        .build()
                )
                .build()
        )

        val routeLineOptions = MapboxRouteLineOptions.Builder(context)
            .withRouteLineResources(
                RouteLineResources.Builder()
                    .routeLineColorResources(RouteLineColorResources.Builder().build())
                    .build()
            )
            // NO withRouteLineBelowLayerId: causa SIGSEGV en libmapbox-maps.so
            // cuando el layer aún no existe en el estilo al momento de renderizar.
            .displaySoftGradientForTraffic(true)
            .build()
        routeLineApi  = MapboxRouteLineApi(routeLineOptions)
        routeLineView = MapboxRouteLineView(routeLineOptions)

        viewportDataSource = MapboxNavigationViewportDataSource(mapboxMap)
        navigationCamera   = NavigationCamera(mapboxMap, mapView.camera, viewportDataSource)

        speechApi               = MapboxSpeechApi(context, accessToken, "es-419")
        voiceInstructionsPlayer = MapboxVoiceInstructionsPlayer(context, accessToken, "es-419")

        mapboxMap.loadStyleUri(NavigationStyles.NAVIGATION_NIGHT_STYLE)

        mapboxNavigation.registerLocationObserver(locationObserver)
        mapboxNavigation.registerRoutesObserver(routesObserver)
        // ⚠ La voz NO se registra aquí — se activa en enableVoice()

        mapboxNavigation.startTripSession()

        // Arrancar timer de fallback GPS (para emulador sin señal real)
        gpsTimeoutHandler.postDelayed(gpsTimeoutRunnable, GPS_TIMEOUT_MS)

        lifecycleOwner.lifecycle.addObserver(this)
    }

    // onAttachedToWindow → la Activity ya está en onResume, arrancar MapView
    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (!isDestroyed) mapView.onStart()
    }

    // ── API pública ────────────────────────────────────────────────────────────

    fun setNavigationEndCallback(callback: (String) -> Unit) {
        onNavigationEnd = callback
    }

    /** Llamar desde MainActivity.onBackPressed(). Devuelve true si lo consumió. */
    fun handleBackPress(): Boolean {
        if (isDestroyed || alpha == 0f) return false
        notifyEnd("cancelled")
        return true
    }

    /**
     * Llamar justo después de traer la vista al frente y comenzar el fade-in.
     * Re-fija la cámara en modo seguimiento para corregir cualquier estado residual
     * del período de pre-carga (cuando la vista estaba a alpha=0).
     */
    fun onReveal() {
        if (isDestroyed) return
        followLockCount = 1   // activa el re-lock en los próximos updates de ubicación
        // Solicitar following inmediatamente y luego otra vez tras el layout
        post {
            if (!isDestroyed) {
                viewportDataSource.evaluate()
                navigationCamera.requestNavigationCameraToFollowing()
            }
        }
        postDelayed({
            if (!isDestroyed) {
                viewportDataSource.evaluate()
                navigationCamera.requestNavigationCameraToFollowing()
            }
        }, 400)
    }

    /** Activa las instrucciones de voz. Llamar justo antes de revelar la vista. */
    fun enableVoice() {
        if (voiceEnabled || isDestroyed) return
        voiceEnabled = true
        mapboxNavigation.registerVoiceInstructionsObserver { voiceInstructions ->
            speechApi.generate(voiceInstructions) { expected ->
                expected.onValue { value ->
                    (value.announcement as? SpeechAnnouncement)?.let {
                        voiceInstructionsPlayer.play(it) {}
                    }
                }
                expected.onError { error ->
                    (error as? SpeechError)?.let {
                        voiceInstructionsPlayer.play(it.fallback) {}
                    }
                }
            }
        }
    }

    /** Libera todos los recursos. Llamar desde el módulo tras remover la vista. */
    fun cleanup() {
        if (isDestroyed) return
        isDestroyed = true
        onNavigationEnd = null
        gpsTimeoutHandler.removeCallbacks(gpsTimeoutRunnable)
        lifecycleRef.get()?.lifecycle?.removeObserver(this)
        try {
            mapboxNavigation.unregisterLocationObserver(locationObserver)
            mapboxNavigation.unregisterRoutesObserver(routesObserver)
            mapboxNavigation.stopTripSession()
            mapboxNavigation.onDestroy()
            routeLineApi.cancel()
            speechApi.cancel()
            voiceInstructionsPlayer.shutdown()
            mapView.onStop()
            mapView.onDestroy()
        } catch (e: Exception) {
            Log.e(TAG, "cleanup error: ${e.message}")
        }
    }

    // ── Lifecycle de MapView vía LifecycleOwner ────────────────────────────────
    // DefaultLifecycleObserver sólo tiene: onCreate/onStart/onResume/onPause/onStop/onDestroy

    override fun onStart(owner: LifecycleOwner)   { if (!isDestroyed) mapView.onStart() }
    override fun onStop(owner: LifecycleOwner)    { if (!isDestroyed) mapView.onStop() }
    override fun onDestroy(owner: LifecycleOwner) { cleanup() }

    // ── Privado ────────────────────────────────────────────────────────────────

    private fun fetchRoute(origin: Point, destination: Point) {
        Log.d(TAG, "Solicitando ruta pre-cargada…")
        mapboxNavigation.requestRoutes(
            RouteOptions.builder()
                .applyDefaultNavigationOptions()
                .language("es")
                .voiceUnits("metric")
                .coordinatesList(listOf(origin, destination))
                .alternatives(true)
                .build(),
            object : NavigationRouterCallback {
                override fun onRoutesReady(routes: List<NavigationRoute>, routerOrigin: RouterOrigin) {
                    post {
                        if (isDestroyed) return@post
                        try {
                            Log.d(TAG, "Ruta lista: ${routes.size} opciones")
                            mapboxNavigation.setNavigationRoutes(routes)
                            // Solicitar following inmediatamente; onReveal() lo reforzará
                            // cuando el usuario vea la vista.
                            navigationCamera.requestNavigationCameraToFollowing()
                        } catch (e: Exception) {
                            Log.e(TAG, "setNavigationRoutes error: ${e.message}")
                        }
                    }
                }
                override fun onFailure(reasons: List<RouterFailure>, routeOptions: RouteOptions) {
                    Log.e(TAG, "Error de ruta: ${reasons.joinToString { "code=${it.code}" }}")
                }
                override fun onCanceled(routeOptions: RouteOptions, routerOrigin: RouterOrigin) {}
            }
        )
    }

    private fun notifyEnd(status: String) {
        val cb = onNavigationEnd ?: return
        onNavigationEnd = null
        cb(status)
    }
}
