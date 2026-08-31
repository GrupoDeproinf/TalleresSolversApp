import Foundation
import UIKit
import React
import MapboxNavigation
import MapboxDirections
import MapboxCoreNavigation

// MARK: - React Native Module

@objc(RNMapboxNavigation)
class RNMapboxNavigation: NSObject {

  // MARK: Private state
  private var resolve:     RCTPromiseResolveBlock?
  private var reject:      RCTPromiseRejectBlock?
  private var navVC:       NavigationViewController?
  private var isNavigating = false

  // Caché de ruta pre-calculada (usada por prepareNavigation)
  private var cachedResponse: RouteResponse?
  private var cachedOptions:  NavigationRouteOptions?
  private var isPreparing    = false

  // UI pre-cargada: NavigationVC añadido como child VC detrás de la RN UI,
  // con alpha=0 y voz silenciada.  Se revela instantáneamente en navigate().
  private var preloadedVC:          NavigationViewController?
  private var preloadedSpeechSynth: MapboxSpeechSynthesizer?
  private var isPreloadedMode       = false

  private let accessToken = "REEMPLAZAR_CON_MAPBOX_PUBLIC_TOKEN"

  @objc static func requiresMainQueueSetup() -> Bool { true }

  // MARK: cancelPreview()

  @objc func cancelPreview() {
    guard !isNavigating else { return }
    cachedResponse = nil
    cachedOptions  = nil
    isPreparing    = false
    removePreloadedVC()
  }

  // MARK: prepareNavigation()
  // Pre-calcula la ruta en segundo plano mientras el usuario ve el preview.
  // preloadNavigationUI() la usa para construir el NavigationVC sin delay.

  @objc(prepareNavigation:originLng:destLat:destLng:destName:)
  func prepareNavigation(
    _ originLat: Double, originLng: Double,
    destLat: Double,    destLng: Double,
    destName: String
  ) {
    guard !isPreparing && !isNavigating else { return }
    isPreparing    = true
    cachedResponse = nil
    cachedOptions  = nil

    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      let origin      = Waypoint(coordinate: CLLocationCoordinate2D(latitude: originLat, longitude: originLng))
      let destination = Waypoint(coordinate: CLLocationCoordinate2D(latitude: destLat, longitude: destLng),
                                 name: destName)
      let options = NavigationRouteOptions(
        waypoints: [origin, destination],
        profileIdentifier: .automobileAvoidingTraffic
      )
      options.locale = Locale(identifier: "es-419")
      options.includesAlternativeRoutes = true

      Directions.shared.calculate(options as RouteOptions) { [weak self] (_, result) in
        guard let self else { return }
        DispatchQueue.main.async {
          self.isPreparing = false
          if case .success(let response) = result, response.routes?.isEmpty == false {
            self.cachedResponse = response
            self.cachedOptions  = options
          }
        }
      }
    }
  }

  // MARK: preloadNavigationUI()
  // Construye el NavigationViewController y lo inserta detrás de la UI de RN
  // con alpha=0 y voz silenciada. El mapa se renderiza en segundo plano mientras
  // el WebView hace el zoom, de forma que navigate() lo revela al instante.

  @objc(preloadNavigationUI:originLng:destLat:destLng:destName:)
  func preloadNavigationUI(
    _ originLat: Double, originLng: Double,
    destLat: Double,    destLng: Double,
    destName: String
  ) {
    guard !isNavigating && preloadedVC == nil else { return }

    DispatchQueue.main.async { [weak self] in
      guard let self else { return }
      // Esperar a que prepareNavigation haya terminado (hasta 1.5 s)
      self.waitAndBuildPreloadedVC(retries: 10)
    }
  }

  private func waitAndBuildPreloadedVC(retries: Int) {
    if let response = cachedResponse, let options = cachedOptions {
      buildPreloadedVC(response: response, options: options)
    } else if retries > 0 && !isNavigating {
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
        guard let self, !self.isNavigating else { return }
        self.waitAndBuildPreloadedVC(retries: retries - 1)
      }
    }
    // Si no hay respuesta tras los reintentos, navigate() usa el flujo de respaldo
  }

  private func buildPreloadedVC(response: RouteResponse, options: NavigationRouteOptions) {
    guard preloadedVC == nil, let rootVC = Self.rootViewController() else { return }

    let navService = MapboxNavigationService(
      routeResponse: response, routeIndex: 0, routeOptions: options
    )

    // Sintetizador con voz silenciada — se activa en showPreloadedVC()
    let speechSynth = MapboxSpeechSynthesizer(accessToken: accessToken)
    speechSynth.locale = Locale(identifier: "es-419")
    speechSynth.muted  = true

    let voiceController = RouteVoiceController(
      navigationService: navService,
      speechSynthesizer: speechSynth,
      accessToken: accessToken
    )

    let navOptions = NavigationOptions(
      styles: [CustomNightStyle()],
      navigationService: navService,
      voiceController: voiceController
    )

    let vc = NavigationViewController(
      for: response, routeIndex: 0, routeOptions: options, navigationOptions: navOptions
    )
    vc.showsReportFeedback     = false
    vc.showsEndOfRouteFeedback = false
    vc.showsSpeedLimits        = true
    // delegate se asigna en showPreloadedVC()

    if let mapView = vc.navigationMapView {
      mapView.routeLineTracksTraversal = true
    }

    // Añadir como child VC en el índice 0 (detrás de toda la UI de RN)
    rootVC.addChild(vc)
    let vcView = vc.view!
    vcView.frame = rootVC.view.bounds
    vcView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    vcView.alpha = 0
    vcView.isUserInteractionEnabled = false
    rootVC.view.insertSubview(vcView, at: 0)
    vc.didMove(toParent: rootVC)

    preloadedVC          = vc
    preloadedSpeechSynth = speechSynth
  }

  private func removePreloadedVC() {
    guard let vc = preloadedVC else { return }
    preloadedVC          = nil
    preloadedSpeechSynth = nil
    vc.willMove(toParent: nil)
    vc.view.removeFromSuperview()
    vc.removeFromParent()
  }

  // MARK: navigate()

  @objc(navigate:originLng:destLat:destLng:destName:resolver:rejecter:)
  func navigate(
    _ originLat: Double, originLng: Double,
    destLat: Double,    destLng: Double,
    destName: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject:  @escaping RCTPromiseRejectBlock
  ) {
    guard !isNavigating else {
      reject("BUSY", "Navigation is already in progress", nil)
      return
    }
    isNavigating = true
    self.resolve = resolve
    self.reject  = reject

    DispatchQueue.main.async { [weak self] in
      guard let self else { return }

      // ── Opción 1: UI pre-renderizada lista → revelar al instante ─────────────
      if let preloaded = self.preloadedVC {
        self.showPreloadedVC(preloaded)
        return
      }

      // ── Opción 2: caché de ruta disponible ───────────────────────────────────
      if let response = self.cachedResponse, let options = self.cachedOptions {
        self.cachedResponse = nil
        self.cachedOptions  = nil
        self.buildAndPresent(response: response, options: options)
        return
      }

      // ── Opción 3: esperando que prepareNavigation calcule la ruta ─────────────
      if self.isPreparing {
        self.waitForPrepareAndPresent(retries: 15,
                                      originLat: originLat, originLng: originLng,
                                      destLat: destLat, destLng: destLng, destName: destName)
        return
      }

      // ── Opción 4: calcular ruta desde cero ───────────────────────────────────
      let origin      = Waypoint(coordinate: CLLocationCoordinate2D(latitude: originLat, longitude: originLng))
      let destination = Waypoint(coordinate: CLLocationCoordinate2D(latitude: destLat, longitude: destLng),
                                 name: destName)
      let options = NavigationRouteOptions(
        waypoints: [origin, destination],
        profileIdentifier: .automobileAvoidingTraffic
      )
      options.locale = Locale(identifier: "es-419")
      options.includesAlternativeRoutes = true

      Directions.shared.calculate(options as RouteOptions) { [weak self] (_, result) in
        guard let self else { return }
        DispatchQueue.main.async {
          switch result {
          case .failure(let error):
            self.reject?("ROUTE_ERROR", error.localizedDescription, error)
            self.cleanState()
          case .success(let response):
            guard response.routes?.isEmpty == false else {
              self.reject?("ROUTE_ERROR", "No se encontró ruta", nil)
              self.cleanState()
              return
            }
            self.buildAndPresent(response: response, options: options)
          }
        }
      }
    }
  }

  // MARK: - showPreloadedVC
  // Revela el NavigationVC ya renderizado: activa voz, trae al frente, alpha=1.

  private func showPreloadedVC(_ vc: NavigationViewController) {
    let synth        = preloadedSpeechSynth
    preloadedVC          = nil
    preloadedSpeechSynth = nil
    isPreloadedMode      = true
    navVC                = vc

    // Desactivar silencio → voz activa
    synth?.muted = false

    // Asignar delegate y habilitar interacción
    vc.delegate                  = self
    vc.view.isUserInteractionEnabled = true

    // Traer al frente de la jerarquía de vistas del parent (cubre la UI de RN)
    vc.parent?.view.bringSubviewToFront(vc.view)

    // El mapa ya está renderizado → aparecer sin animación
    vc.view.alpha = 1
  }

  // MARK: - buildAndPresent (flujo de respaldo — presentación modal)

  private func buildAndPresent(response: RouteResponse, options: NavigationRouteOptions) {
    isPreloadedMode = false

    let navService = MapboxNavigationService(
      routeResponse: response, routeIndex: 0, routeOptions: options
    )

    let speechSynth = MapboxSpeechSynthesizer(accessToken: self.accessToken)
    speechSynth.locale = Locale(identifier: "es-419")
    let voiceController = RouteVoiceController(
      navigationService: navService,
      speechSynthesizer: speechSynth,
      accessToken: self.accessToken
    )

    let navOptions = NavigationOptions(
      styles: [CustomNightStyle()],
      navigationService: navService,
      voiceController: voiceController
    )

    let vc = NavigationViewController(
      for: response, routeIndex: 0, routeOptions: options, navigationOptions: navOptions
    )
    vc.modalPresentationStyle  = .fullScreen
    vc.modalTransitionStyle    = .crossDissolve
    vc.showsReportFeedback     = false
    vc.showsEndOfRouteFeedback = false
    vc.showsSpeedLimits        = true
    vc.delegate = self
    self.navVC  = vc

    if let mapView = vc.navigationMapView {
      mapView.routeLineTracksTraversal = true
    }

    self.presentOnTopmost(vc)
  }

  // MARK: - Presentación robusta con fade-in desde negro (flujo de respaldo)

  private func presentOnTopmost(_ vc: UIViewController, retries: Int = 5) {
    guard let top = Self.topmostViewController() else {
      reject?("PRESENT_ERROR", "No se encontró rootViewController", nil)
      cleanState(); return
    }

    if top.isBeingPresented || top.isBeingDismissed || top.presentedViewController != nil {
      guard retries > 0 else {
        reject?("PRESENT_ERROR", "ViewController ocupado tras reintentos", nil)
        cleanState(); return
      }
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
        self?.presentOnTopmost(vc, retries: retries - 1)
      }
      return
    }

    top.present(vc, animated: false) {
      let overlay = UIView(frame: vc.view.bounds)
      overlay.backgroundColor = .black
      overlay.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      vc.view.addSubview(overlay)
      UIView.animate(withDuration: 0.55, delay: 0.1, options: .curveEaseOut) {
        overlay.alpha = 0
      } completion: { _ in
        overlay.removeFromSuperview()
      }
    }
  }

  private func waitForPrepareAndPresent(retries: Int,
                                        originLat: Double, originLng: Double,
                                        destLat: Double, destLng: Double, destName: String) {
    guard retries > 0 else {
      reject?("ROUTE_ERROR", "Tiempo de espera agotado", nil)
      cleanState(); return
    }
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
      guard let self else { return }
      if let response = self.cachedResponse, let options = self.cachedOptions {
        self.cachedResponse = nil; self.cachedOptions = nil
        self.buildAndPresent(response: response, options: options)
      } else if self.isPreparing {
        self.waitForPrepareAndPresent(retries: retries - 1,
                                      originLat: originLat, originLng: originLng,
                                      destLat: destLat, destLng: destLng, destName: destName)
      } else {
        self.reject?("ROUTE_ERROR", "No se pudo calcular la ruta", nil)
        self.cleanState()
      }
    }
  }

  // MARK: - finishNavigation

  private func finishNavigation(_ vc: NavigationViewController, status: String) {
    let res          = resolve
    let nav          = navVC
    let wasPreloaded = isPreloadedMode
    cleanState()
    // Resolver la promise ANTES de la animación de salida → JS inicia su transición
    res?(["status": status])

    if wasPreloaded {
      // Child VC → remover con fade rápido (la RN UI está debajo, lista)
      UIView.animate(withDuration: 0.22, animations: {
        nav?.view.alpha = 0
      }) { _ in
        nav?.willMove(toParent: nil)
        nav?.view.removeFromSuperview()
        nav?.removeFromParent()
      }
    } else {
      // Modal → dismiss normal
      nav?.dismiss(animated: true)
    }
  }

  // MARK: - Helpers

  private func cleanState() {
    navVC            = nil
    resolve          = nil
    reject           = nil
    isNavigating     = false
    cachedResponse   = nil
    cachedOptions    = nil
    isPreparing      = false
    isPreloadedMode  = false
    preloadedVC      = nil
    preloadedSpeechSynth = nil
  }

  /// Root ViewController (sin traversar presentedViewController)
  private static func rootViewController() -> UIViewController? {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
      .first(where: { $0.isKeyWindow })?
      .rootViewController
  }

  /// ViewController más al frente (traversando presentedViewController)
  private static func topmostViewController() -> UIViewController? {
    guard var top = rootViewController() else { return nil }
    while let presented = top.presentedViewController { top = presented }
    return top
  }
}

// MARK: - NavigationViewControllerDelegate

extension RNMapboxNavigation: NavigationViewControllerDelegate {

  func navigationViewControllerDidDismiss(
    _ navigationViewController: NavigationViewController,
    byCanceling canceled: Bool
  ) {
    finishNavigation(navigationViewController, status: canceled ? "cancelled" : "finished")
  }

  func navigationViewController(
    _ navigationViewController: NavigationViewController,
    didArriveAt waypoint: Waypoint
  ) -> Bool {
    // No cerramos automáticamente al detectar llegada.
    // El usuario cierra con la X; el timer de 30 s en JS decide si mostrar el modal.
    return true
  }
}

// MARK: - Estilo nocturno

final class CustomNightStyle: NightStyle {
  required init() {
    super.init()
    mapStyleURL = URL(string: "mapbox://styles/mapbox/navigation-night-v1")!
    styleType   = .night
  }
}
