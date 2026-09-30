import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import FBSDKCoreKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
  var launchOptions: [UIApplication.LaunchOptionsKey: Any]?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    // 🔥 Firebase
    FirebaseApp.configure()

    // 🔵 Facebook SDK (OBLIGATORIO para Meta)
    ApplicationDelegate.shared.application(
      application,
      didFinishLaunchingWithOptions: launchOptions
    )

    // ⚛️ React Native: se prepara aqui; la ventana la crea SceneDelegate.
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    self.launchOptions = launchOptions

    return true
  }

  // iOS 27+: las apps compiladas con el SDK nuevo DEBEN usar el ciclo de vida
  // de escenas (UIScene). Sin esto iOS cierra la app al abrirla
  // (_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption).
  func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    let config = UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    config.delegateClass = SceneDelegate.self
    return config
  }
}

// 🪟 Crea la ventana y arranca React Native dentro de la escena.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          let factory = appDelegate.reactNativeFactory else { return }

    let window = UIWindow(windowScene: windowScene)
    self.window = window
    appDelegate.window = window // algunas librerias leen AppDelegate.window

    factory.startReactNative(
      withModuleName: "MyReactNativeApp",
      in: window,
      launchOptions: appDelegate.launchOptions
    )

    // Enlace con el que se abrio la app (p. ej. regreso del login de Facebook)
    if let context = connectionOptions.urlContexts.first {
      openURL(context)
    }
  }

  // 🔗 Necesario para Login / Deep Links de Facebook (con escenas llega aqui)
  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    if let context = URLContexts.first {
      openURL(context)
    }
  }

  private func openURL(_ context: UIOpenURLContext) {
    ApplicationDelegate.shared.application(
      UIApplication.shared,
      open: context.url,
      sourceApplication: context.options.sourceApplication,
      annotation: context.options.annotation
    )
  }
}

// 🔹 Clase para React Native
class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    return self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings()
      .jsBundleURL(forBundleRoot: "index")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
