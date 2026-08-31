package com.solvers.app.mapbox

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.mapbox.api.directions.v5.models.RouteOptions
import com.mapbox.geojson.Feature
import com.mapbox.geojson.LineString
import com.mapbox.geojson.Point
import com.mapbox.maps.MapView
import com.mapbox.maps.MapboxMap
import com.mapbox.maps.Style
import com.mapbox.maps.plugin.animation.camera
import com.mapbox.maps.extension.style.layers.addLayer
import com.mapbox.maps.extension.style.layers.generated.circleLayer
import com.mapbox.maps.extension.style.layers.generated.lineLayer
import com.mapbox.maps.extension.style.layers.properties.generated.LineCap
import com.mapbox.maps.extension.style.layers.properties.generated.LineJoin
import com.mapbox.maps.extension.style.sources.addSource
import com.mapbox.maps.extension.style.sources.generated.geoJsonSource
import com.mapbox.maps.plugin.locationcomponent.location
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
import com.mapbox.navigation.core.trip.session.BannerInstructionsObserver
import com.mapbox.navigation.core.trip.session.LocationMatcherResult
import com.mapbox.navigation.core.trip.session.LocationObserver
import com.mapbox.navigation.core.trip.session.RouteProgressObserver
import com.mapbox.navigation.ui.maps.camera.NavigationCamera
import com.mapbox.navigation.ui.maps.camera.data.MapboxNavigationViewportDataSource
import com.mapbox.navigation.ui.maps.location.NavigationLocationProvider
import com.mapbox.navigation.ui.voice.api.MapboxSpeechApi
import com.mapbox.navigation.ui.voice.api.MapboxVoiceInstructionsPlayer
import com.mapbox.navigation.ui.voice.model.SpeechAnnouncement
import com.mapbox.navigation.ui.voice.model.SpeechError
import com.solvers.app.R
import java.util.Locale

class NavigationActivity : AppCompatActivity() {

    companion object {
        private const val LOCATION_PERMISSION_REQUEST = 1001
        private const val TAG = "NavigationActivity"
        private const val GPS_TIMEOUT_MS = 15000L
        private const val FOLLOWING_ZOOM = 17.5
    }

    private lateinit var mapView: MapView
    private lateinit var btnClose: FloatingActionButton
    private lateinit var btnMyLocation: FloatingActionButton
    private lateinit var cardInstructions: LinearLayout
    private lateinit var tvManeuverArrow: TextView
    private lateinit var tvDistance: TextView
    private lateinit var tvStreetName: TextView
    private lateinit var mapboxNavigation: MapboxNavigation
    private lateinit var navigationCamera: NavigationCamera
    private lateinit var viewportDataSource: MapboxNavigationViewportDataSource
    private lateinit var speechApi: MapboxSpeechApi
    private lateinit var voiceInstructionsPlayer: MapboxVoiceInstructionsPlayer

    private val mapboxMap: MapboxMap get() = mapView.getMapboxMap()
    private val navigationLocationProvider = NavigationLocationProvider()

    private var destPoint: Point? = null
    @Volatile private var routeRequested = false
    private var destMarkerDrawn = false

    private val gpsTimeoutHandler  = android.os.Handler(android.os.Looper.getMainLooper())
    private val gpsTimeoutRunnable = Runnable {
        if (!routeRequested) {
            Log.w(TAG, "GPS timeout → sin ubicación real disponible")
            Toast.makeText(this, "No se pudo obtener tu ubicación.", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_navigation)

        mapView          = findViewById(R.id.mapView)
        btnClose         = findViewById(R.id.btnClose)
        btnMyLocation    = findViewById(R.id.btnMyLocation)
        cardInstructions = findViewById(R.id.cardInstructions)
        tvManeuverArrow  = findViewById(R.id.tvManeuverArrow)
        tvDistance       = findViewById(R.id.tvDistance)
        tvStreetName     = findViewById(R.id.tvStreetName)

        val destLat = intent.getDoubleExtra("destLat", 0.0)
        val destLng = intent.getDoubleExtra("destLng", 0.0)
        destPoint   = Point.fromLngLat(destLng, destLat)

        Log.d(TAG, "Destino: lat=$destLat lng=$destLng")

        val accessToken = getString(R.string.mapbox_access_token)

        mapboxMap.loadStyleUri("mapbox://styles/mapbox/navigation-night-v1")

        mapView.location.apply {
            setLocationProvider(navigationLocationProvider)
            updateSettings {
                enabled        = true
                pulsingEnabled = true
            }
        }

        mapboxNavigation = MapboxNavigation(
            NavigationOptions.Builder(this)
                .accessToken(accessToken)
                .distanceFormatterOptions(
                    DistanceFormatterOptions.Builder(this)
                        .unitType(UnitType.METRIC)
                        .build()
                )
                .build()
        )

        viewportDataSource = MapboxNavigationViewportDataSource(mapboxMap)
        viewportDataSource.followingZoomPropertyOverride(FOLLOWING_ZOOM)
        navigationCamera = NavigationCamera(mapboxMap, mapView.camera, viewportDataSource)

        speechApi               = MapboxSpeechApi(this, accessToken, "es-419")
        voiceInstructionsPlayer = MapboxVoiceInstructionsPlayer(this, accessToken, "es-419")

        mapboxNavigation.registerLocationObserver(locationObserver)
        mapboxNavigation.registerRoutesObserver(routesObserver)
        mapboxNavigation.registerRouteProgressObserver(routeProgressObserver)
        mapboxNavigation.registerBannerInstructionsObserver(bannerInstructionsObserver)
        mapboxNavigation.registerVoiceInstructionsObserver { voiceInstructions ->
            Log.d(TAG, "Instrucción de voz: ${voiceInstructions.announcement()}")
            speechApi.generate(voiceInstructions) { expected ->
                expected.onValue { value ->
                    val announcement = value.announcement
                    if (announcement is SpeechAnnouncement) {
                        voiceInstructionsPlayer.play(announcement) {}
                    }
                }
                expected.onError { error ->
                    val speechError = error as? SpeechError
                    if (speechError != null) {
                        Log.w(TAG, "SpeechApi fallback TTS: ${speechError.errorMessage}")
                        voiceInstructionsPlayer.play(speechError.fallback) {}
                    }
                }
            }
        }

        btnClose.setOnClickListener { finish() }
        btnMyLocation.setOnClickListener {
            navigationCamera.requestNavigationCameraToFollowing()
        }

        val rootView = window.decorView as ViewGroup
        val blackOverlay = View(this).apply {
            setBackgroundColor(Color.BLACK)
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            elevation = Float.MAX_VALUE
        }
        rootView.addView(blackOverlay)
        blackOverlay.animate()
            .alpha(0f)
            .setDuration(550)
            .setStartDelay(120)
            .setInterpolator(android.view.animation.DecelerateInterpolator())
            .withEndAction { rootView.removeView(blackOverlay) }
            .start()

        checkLocationPermissionsAndStart()
    }

    private fun checkLocationPermissionsAndStart() {
        val fine   = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
        if (fine == PackageManager.PERMISSION_GRANTED && coarse == PackageManager.PERMISSION_GRANTED) {
            startTripSession()
        } else {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION),
                LOCATION_PERMISSION_REQUEST
            )
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == LOCATION_PERMISSION_REQUEST) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startTripSession()
            } else {
                Toast.makeText(this, "Se necesitan permisos de ubicación para navegar.", Toast.LENGTH_LONG).show()
                finish()
            }
        }
    }

    private fun startTripSession() {
        mapboxNavigation.startTripSession()
        gpsTimeoutHandler.postDelayed(gpsTimeoutRunnable, GPS_TIMEOUT_MS)
        Log.d(TAG, "Trip session iniciada, esperando primera ubicación GPS...")
    }

    private fun fetchRoute(origin: Point, destination: Point) {
        Log.d(TAG, "Solicitando ruta: origin=${origin.latitude()},${origin.longitude()}")
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
                    Log.d(TAG, "Ruta recibida: ${routes.size} opciones")
                    runOnUiThread {
                        mapboxNavigation.setNavigationRoutes(routes)
                        navigationCamera.requestNavigationCameraToFollowing()
                    }
                }
                override fun onFailure(reasons: List<RouterFailure>, routeOptions: RouteOptions) {
                    Log.e(TAG, "Error de ruta: ${reasons.joinToString { "code=${it.code}" }}")
                    runOnUiThread {
                        Toast.makeText(this@NavigationActivity,
                            "Sin ruta disponible. Verifica tu conexión.", Toast.LENGTH_LONG).show()
                    }
                }
                override fun onCanceled(routeOptions: RouteOptions, routerOrigin: RouterOrigin) {}
            }
        )
    }

    private fun drawRouteOnMap(route: NavigationRoute) {
        val geometry = route.directionsRoute.geometry() ?: return
        val lineString = LineString.fromPolyline(geometry, 6)
        val feature   = Feature.fromGeometry(lineString)

        mapboxMap.getStyle { style ->
            try {
                if (style.styleLayerExists("route-layer"))        style.removeStyleLayer("route-layer")
                if (style.styleLayerExists("route-casing-layer")) style.removeStyleLayer("route-casing-layer")
                if (style.styleSourceExists("route-source"))      style.removeStyleSource("route-source")

                style.addSource(geoJsonSource("route-source") {
                    data(feature.toJson())
                })

                style.addLayer(lineLayer("route-casing-layer", "route-source") {
                    lineColor("#1A3D6B")
                    lineWidth(12.0)
                    lineCap(LineCap.ROUND)
                    lineJoin(LineJoin.ROUND)
                })

                style.addLayer(lineLayer("route-layer", "route-source") {
                    lineColor("#4A90E2")
                    lineWidth(8.0)
                    lineCap(LineCap.ROUND)
                    lineJoin(LineJoin.ROUND)
                })

                if (!destMarkerDrawn) {
                    drawDestinationMarker(style)
                    destMarkerDrawn = true
                }

                Log.d(TAG, "Ruta dibujada en el mapa")
            } catch (e: Exception) {
                Log.e(TAG, "drawRouteOnMap error: ${e.message}")
            }
        }
    }

    private fun drawDestinationMarker(style: Style) {
        val dest = destPoint ?: return
        try {
            if (style.styleLayerExists("dest-aura-layer"))   style.removeStyleLayer("dest-aura-layer")
            if (style.styleLayerExists("dest-border-layer")) style.removeStyleLayer("dest-border-layer")
            if (style.styleLayerExists("dest-dot-layer"))    style.removeStyleLayer("dest-dot-layer")
            if (style.styleSourceExists("dest-source"))      style.removeStyleSource("dest-source")

            style.addSource(geoJsonSource("dest-source") {
                data(Feature.fromGeometry(dest).toJson())
            })
            style.addLayer(circleLayer("dest-aura-layer", "dest-source") {
                circleColor("#E84D4D"); circleRadius(22.0); circleOpacity(0.25)
            })
            style.addLayer(circleLayer("dest-border-layer", "dest-source") {
                circleColor("#FFFFFF"); circleRadius(14.0)
            })
            style.addLayer(circleLayer("dest-dot-layer", "dest-source") {
                circleColor("#E84D4D"); circleRadius(9.0)
            })
        } catch (e: Exception) {
            Log.e(TAG, "drawDestinationMarker error: ${e.message}")
        }
    }

    private val locationObserver = object : LocationObserver {
        override fun onNewRawLocation(rawLocation: android.location.Location) {}
        override fun onNewLocationMatcherResult(locationMatcherResult: LocationMatcherResult) {
            val enhanced = locationMatcherResult.enhancedLocation
            navigationLocationProvider.changePosition(enhanced, locationMatcherResult.keyPoints)
            viewportDataSource.onLocationChanged(enhanced)
            viewportDataSource.evaluate()

            if (!routeRequested) {
                val dest = destPoint ?: return
                routeRequested = true
                gpsTimeoutHandler.removeCallbacks(gpsTimeoutRunnable)
                val origin = Point.fromLngLat(enhanced.longitude, enhanced.latitude)
                Log.d(TAG, "Primera ubicación GPS: lat=${enhanced.latitude} lng=${enhanced.longitude}")
                fetchRoute(origin, dest)
            }
        }
    }

    private val routesObserver = RoutesObserver { routeUpdateResult ->
        val route = routeUpdateResult.navigationRoutes.firstOrNull() ?: return@RoutesObserver
        runOnUiThread { drawRouteOnMap(route) }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private fun modifierToArrow(modifier: String?): String = when (modifier?.lowercase(Locale.ROOT)) {
        "left"         -> "←"
        "right"        -> "→"
        "slight left"  -> "↖"
        "slight right" -> "↗"
        "sharp left"   -> "↙"
        "sharp right"  -> "↘"
        "uturn"        -> "↩"
        else           -> "↑"
    }

    private fun formatDistance(meters: Float): String = when {
        meters < 1000f -> "${meters.toInt()} m"
        else           -> String.format(Locale.ROOT, "%.1f km", meters / 1000f)
    }

    // Solo actualiza texto — no toca el mapa
    private val routeProgressObserver = RouteProgressObserver { routeProgress ->
        val dist = routeProgress.currentLegProgress
            ?.currentStepProgress?.distanceRemaining ?: return@RouteProgressObserver
        runOnUiThread { tvDistance.text = formatDistance(dist) }
    }

    // Muestra el card y actualiza flecha + calle
    private val bannerInstructionsObserver = BannerInstructionsObserver { bannerInstructions ->
        val primary = bannerInstructions.primary()
        runOnUiThread {
            cardInstructions.visibility = View.VISIBLE
            tvManeuverArrow.text = modifierToArrow(primary.modifier())
            tvStreetName.text    = primary.text() ?: ""
        }
    }

    override fun onStart()     { super.onStart();     mapView.onStart() }
    override fun onStop()      { super.onStop();      mapView.onStop() }
    override fun onLowMemory() { super.onLowMemory(); mapView.onLowMemory() }

    override fun finish() {
        super.finish()
        overridePendingTransition(0, 0)
    }

    override fun onDestroy() {
        super.onDestroy()
        gpsTimeoutHandler.removeCallbacks(gpsTimeoutRunnable)
        mapboxNavigation.unregisterLocationObserver(locationObserver)
        mapboxNavigation.unregisterRoutesObserver(routesObserver)
        mapboxNavigation.unregisterRouteProgressObserver(routeProgressObserver)
        mapboxNavigation.unregisterBannerInstructionsObserver(bannerInstructionsObserver)
        mapboxNavigation.stopTripSession()
        mapboxNavigation.onDestroy()
        speechApi.cancel()
        voiceInstructionsPlayer.shutdown()
        mapView.onDestroy()
    }
}
