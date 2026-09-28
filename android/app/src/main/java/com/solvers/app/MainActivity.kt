package com.solvers.app

import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.graphics.Color
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.solvers.app.mapbox.NavigationEmbeddedView

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "MyReactNativeApp"

  /**
   * Fix para react-native-screens: pasar null en lugar del savedInstanceState
   * evita que Android restaure fragmentos que react-native-screens no soporta.
   * https://github.com/software-mansion/react-native-screens/issues/17
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    ajustarContenidoAlTeclado()
  }

  /**
   * Márgenes del sistema y teclado (1.4.0).
   *
   * Con targetSdk 35+ Android obliga el modo "edge-to-edge": la app se dibuja
   * debajo de la barra de estado (hora, batería) y de la barra de gestos, e
   * ignora android:windowSoftInputMode="adjustResize", así que el teclado
   * tapaba los campos y los encabezados quedaban debajo de la hora.
   *
   * Se devuelve el comportamiento anterior para TODA la app:
   * - arriba, el alto de la barra de estado (con el azul marino de la marca
   *   detrás e íconos claros);
   * - abajo, el alto del teclado cuando está abierto o, si no, el de la barra
   *   de gestos.
   * Las pantallas no tienen que sumar estos márgenes (en iOS ya los aplica el
   * SafeAreaView de App.tsx).
   */
  private fun ajustarContenidoAlTeclado() {
    window.decorView.setBackgroundColor(Color.parseColor("#1F2344"))
    WindowCompat.getInsetsController(window, window.decorView).isAppearanceLightStatusBars = false
    val content = findViewById<View>(android.R.id.content) ?: return
    ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
      val barras = insets.getInsets(WindowInsetsCompat.Type.systemBars())
      val teclado = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
      val abajo = maxOf(teclado, barras.bottom)
      if (view.paddingTop != barras.top || view.paddingBottom != abajo ||
          view.paddingLeft != barras.left || view.paddingRight != barras.right) {
        view.setPadding(barras.left, barras.top, barras.right, abajo)
      }
      insets
    }
  }

  /**
   * Si hay un NavigationEmbeddedView visible en pantalla, el back lo cierra
   * correctamente (llama done() en JS). Si no hay ninguno, comportamiento normal.
   */
  override fun onBackPressed() {
    val decorView = window.decorView as? ViewGroup
    if (decorView != null) {
      for (i in 0 until decorView.childCount) {
        val child = decorView.getChildAt(i)
        if (child is NavigationEmbeddedView && child.handleBackPress()) return
      }
    }
    super.onBackPressed()
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
