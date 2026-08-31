package com.solvers.app

import android.os.Bundle
import android.view.ViewGroup
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
