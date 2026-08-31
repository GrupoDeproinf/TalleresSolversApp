package com.solvers.app.mapbox

/** Objeto singleton para pasar datos entre el módulo RN y la NavigationActivity */
object RNMapboxNavigationData {
    var pendingOriginLat: Double = 0.0
    var pendingOriginLng: Double = 0.0
    var pendingDestLat:   Double = 0.0
    var pendingDestLng:   Double = 0.0
    var pendingDestName:  String = ""
}
