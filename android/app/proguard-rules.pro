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
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.plugin.** { *; }
-dontwarn com.getcapacitor.**

# ---- Cordova plugins ----
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

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
