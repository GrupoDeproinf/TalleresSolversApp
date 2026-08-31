package com.solvers.app.mapbox

import android.app.Activity
import android.content.Intent
import android.view.ViewGroup
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.*
import java.lang.ref.WeakReference

class RNMapboxNavigationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        private const val NAV_REQUEST_CODE = 1002
        private const val TAG = "RNMapboxNavigationMod"
    }

    private var pendingPromise: Promise? = null

    // Referencia débil al view pre-cargado (puede ser null si no se pre-cargó)
    private var preloadedView: WeakReference<NavigationEmbeddedView>? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName() = "RNMapboxNavigation"

    // ── ActivityEventListener ──────────────────────────────────────────────────
    // Se llama cuando NavigationActivity (fallback) termina
    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == NAV_REQUEST_CODE) {
            pendingPromise?.resolve(null)
            pendingPromise = null
        }
    }

    override fun onNewIntent(intent: Intent?) {}

    // ── cancelPreview ──────────────────────────────────────────────────────────
    // Limpia el view pre-cargado si el usuario cerró el preview sin navegar
    @ReactMethod
    fun cancelPreview() {
        val view = preloadedView?.get()
        preloadedView = null
        if (view != null) {
            reactContext.currentActivity?.runOnUiThread {
                try {
                    (reactContext.currentActivity?.window?.decorView as? ViewGroup)?.removeView(view)
                    view.cleanup()
                } catch (e: Exception) {
                    android.util.Log.e(TAG, "cancelPreview error: ${e.message}")
                }
            }
        }
    }

    // ── prepareNavigation ──────────────────────────────────────────────────────
    // En Android el pre-cálculo de ruta se hace directamente en NavigationEmbeddedView
    @ReactMethod
    fun prepareNavigation(
        originLat: Double, originLng: Double,
        destLat: Double, destLng: Double,
        destName: String
    ) { /* no-op */ }

    // ── preloadNavigationUI ────────────────────────────────────────────────────
    // Crea el mapa de navegación en segundo plano (alpha=0, detrás de RN).
    // Se llama al presionar ¡Vamos! mientras ocurre el zoom del WebView.
    @ReactMethod
    fun preloadNavigationUI(
        originLat: Double, originLng: Double,
        destLat: Double, destLng: Double,
        destName: String
    ) {
        if (preloadedView?.get() != null) return   // Ya hay uno en proceso

        val activity = currentActivity ?: return

        activity.runOnUiThread {
            try {
                val lifecycleOwner = activity as? LifecycleOwner ?: return@runOnUiThread

                val view = NavigationEmbeddedView(
                    activity, lifecycleOwner, destLat, destLng
                )
                view.alpha = 0f   // invisible — se renderiza en segundo plano

                val decorView = activity.window.decorView as ViewGroup
                // Insertar por debajo de todo para no tapar la UI de RN
                decorView.addView(view, 0, ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                ))
                preloadedView = WeakReference(view)
                android.util.Log.d(TAG, "NavigationEmbeddedView creado y añadido al decorView")
            } catch (e: Exception) {
                android.util.Log.e(TAG, "preloadNavigationUI error: ${e.message}")
            }
        }
    }

    // ── navigate ───────────────────────────────────────────────────────────────
    @ReactMethod
    fun navigate(
        originLat: Double, originLng: Double,
        destLat: Double, destLng: Double,
        destName: String,
        promise: Promise
    ) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No hay actividad activa")
            return
        }
        if (pendingPromise != null) {
            promise.reject("BUSY", "Navegación ya en curso")
            return
        }

        val view = preloadedView?.get()
        preloadedView = null

        if (view != null) {
            // ── Ruta feliz: revelar el mapa ya renderizado ─────────────────────
            pendingPromise = promise
            activity.runOnUiThread {
                try {
                    // Traer al frente dentro del decorView
                    val decorView = activity.window.decorView as ViewGroup
                    decorView.bringChildToFront(view)

                    // Re-fijar cámara en modo seguimiento (corrige estado del pre-cargado)
                    view.onReveal()

                    // Fade-in rápido (mapa ya está renderizado → sin destello)
                    view.animate()
                        .alpha(1f)
                        .setDuration(180)
                        .start()

                    // Activar voz ahora que el usuario está en navegación
                    view.enableVoice()

                    // Callback cuando el usuario cierra la navegación
                    view.setNavigationEndCallback { status ->
                        reactContext.currentActivity?.runOnUiThread {
                            try {
                                (reactContext.currentActivity?.window?.decorView as? ViewGroup)
                                    ?.removeView(view)
                                view.cleanup()
                            } catch (e: Exception) {
                                android.util.Log.e(TAG, "removeView error: ${e.message}")
                            }
                        }
                        pendingPromise?.resolve(null)
                        pendingPromise = null
                    }
                } catch (e: Exception) {
                    android.util.Log.e(TAG, "reveal error: ${e.message}")
                    pendingPromise = null
                    promise.reject("NAV_ERROR", e.message ?: "Error al revelar navegación")
                }
            }
        } else {
            // ── Fallback: lanzar NavigationActivity normal ─────────────────────
            android.util.Log.d(TAG, "Sin pre-carga → lanzando NavigationActivity")
            try {
                val intent = Intent(activity, NavigationActivity::class.java).apply {
                    putExtra("originLat", originLat)
                    putExtra("originLng", originLng)
                    putExtra("destLat",   destLat)
                    putExtra("destLng",   destLng)
                    putExtra("destName",  destName)
                }
                pendingPromise = promise
                activity.startActivityForResult(intent, NAV_REQUEST_CODE)
                activity.overridePendingTransition(0, 0)
            } catch (e: Exception) {
                pendingPromise = null
                promise.reject("NAV_ERROR", e.message ?: "Error al iniciar navegación")
            }
        }
    }
}
