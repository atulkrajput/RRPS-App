# ============================================================
# RRPS App ProGuard Rules
# ============================================================

# Keep line numbers for readable crash stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep annotations used by Capacitor / Ionic
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions

# ---- Capacitor ----
# Capacitor's PluginManager loads every plugin class via Class.forName() using the
# literal classpath string in capacitor.plugins.json, and throws a fatal
# PluginLoadException on the first class it can't find — so every plugin package
# must be kept, not just the core com.getcapacitor.* bridge classes.
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugin.** { *; }
-keep class com.capacitorjs.plugins.** { *; }
-dontwarn com.getcapacitor.**
-dontwarn com.capacitorjs.plugins.**

# ---- Cordova plugins ----
# Cordova's plugin manager instantiates plugins the same way, by the literal
# android-package class name declared in config.xml — not every Cordova plugin
# lives under org.apache.cordova, so each actual package must be kept explicitly.
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**
-keep class uk.co.whiteoctober.cordova.** { *; }
-dontwarn uk.co.whiteoctober.cordova.**
-keep class org.pushandplay.cordova.** { *; }
-dontwarn org.pushandplay.cordova.**
-keep class NativeStorage { *; }

# ---- App package ----
-keep class com.rrps.app.** { *; }

# ---- Firebase / Google services ----
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# ---- WebView JavaScript interface ----
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ---- Prevent stripping enums ----
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ---- Prevent stripping Parcelable ----
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# ---- OkHttp / Okio (used by networking) ----
-dontwarn okhttp3.**
-dontwarn okio.**

# ---- Suppress misc warnings ----
-dontwarn javax.annotation.**
-dontwarn sun.misc.Unsafe
