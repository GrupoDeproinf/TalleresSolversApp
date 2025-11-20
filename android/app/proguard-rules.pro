# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# ===== Reglas para react-native-maps =====
# Estas reglas previenen que R8 elimine código necesario de react-native-maps en builds de release

# Mantener todas las clases de react-native-maps
-keep class com.airbnb.android.react.maps.** { *; }
-keep class com.google.android.gms.maps.** { *; }
-keep class com.google.android.gms.location.** { *; }

# Mantener clases nativas de Google Maps
-keep class com.google.maps.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Mantener métodos nativos
-keepclasseswithmembernames class * {
    native <methods>;
}

# Mantener clases de ViewManager de react-native-maps
-keep class * extends com.facebook.react.uimanager.ViewManager {
    <init>(...);
}

# Mantener clases de ReactPackage
-keep class * implements com.facebook.react.ReactPackage {
    <init>(...);
}

# Mantener clases de Module
-keep class * extends com.facebook.react.bridge.ReactContextBaseJavaModule {
    <init>(...);
}

# Mantener clases de BasePackage
-keep class * extends com.facebook.react.BaseReactPackage {
    <init>(...);
}

# Mantener anotaciones
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# Mantener clases serializables
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Mantener clases de React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.react.**

# Mantener clases de Google Play Services
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**