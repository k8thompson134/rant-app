// Dynamic Expo config - allows different package names per build variant
// This enables running dev/alpha/production as separate apps on the same device

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_ALPHA = process.env.APP_VARIANT === "alpha";

const getAppName = () => {
  if (IS_DEV) return "RantTrack Dev";
  if (IS_ALPHA) return "RantTrack Alpha";
  return "RantTrack";
};

const getAndroidPackage = () => {
  if (IS_DEV) return "com.k8thompson.rantapp.dev";
  if (IS_ALPHA) return "com.k8thompson.rantapp.alpha";
  return "com.k8thompson.rantapp";
};

const getIOSBundleId = () => {
  if (IS_DEV) return "com.k8thompson.rantapp.dev";
  if (IS_ALPHA) return "com.k8thompson.rantapp.alpha";
  return "com.k8thompson.rantapp";
};

module.exports = {
  expo: {
    name: getAppName(),
    slug: "rantapp",
    version: "0.9.0",
    description:
      "Privacy-first symptom tracker for chronically ill people. Voice or type how you're feeling—no forms, no tracking, all local.",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0A0A0B",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: getIOSBundleId(),
      buildNumber: "1",
      infoPlist: {
        NSSpeechRecognitionUsageDescription:
          "RantTrack needs speech recognition to convert your voice into text for symptom tracking.",
        NSMicrophoneUsageDescription:
          "RantTrack needs microphone access to record your voice for symptom tracking.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0A0A0B",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: getAndroidPackage(),
      versionCode: 1,
      permissions: ["android.permission.RECORD_AUDIO"],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "32ce3885-1bf7-4a84-a14e-13a54a64849d",
      },
    },
    owner: "k8thompson",
    plugins: [
      "expo-font",
      [
        "@jamsch/expo-speech-recognition",
        {
          microphonePermission:
            "RantTrack needs microphone access to record your voice for symptom tracking.",
          speechRecognitionPermission:
            "RantTrack needs speech recognition to convert your voice into text for symptom tracking.",
        },
      ],
    ],
    privacy: "public",
    githubUrl: "https://github.com/k8thompson134/rant-app",
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/32ce3885-1bf7-4a84-a14e-13a54a64849d",
    },
  },
};
