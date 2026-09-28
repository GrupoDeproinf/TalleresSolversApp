package com.solvers.app

import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import androidx.core.view.ViewCompat
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
   * Teclado sobre los formularios (1.4.0).
   *
   * Con targetSdk 35+ Android obliga el modo "edge-to-edge" e ignora
   * android:windowSoftInputMode="adjustResize": la ventana ya no se achica al
   * abrir el teclado y este tapa los campos. Aquí se devuelve ese
   * comportamiento para TODA la app: el contenido recibe como margen inferior
   * la altura del teclado, así el ScrollView de cada formulario se achica y el
   * campo enfocado queda visible.
   */
  private fun ajustarContenidoAlTeclado() {
    val content = findViewById<View>(android.R.id.content) ?: return
    ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
      val teclado = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
      if (view.paddingBottom != teclado) {
        view.setPadding(view.paddingLeft, view.paddingTop, view.paddingRight, teclado)
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
