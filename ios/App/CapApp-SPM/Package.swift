// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.5.3"),
        .package(name: "CapacitorApp", path: "../../../node_modules/.pnpm/@capacitor+app@8.1.2_@capacitor+core@8.5.3/node_modules/@capacitor/app"),
        .package(name: "CapacitorHaptics", path: "../../../node_modules/.pnpm/@capacitor+haptics@8.0.2_@capacitor+core@8.5.3/node_modules/@capacitor/haptics"),
        .package(name: "CapacitorPushNotifications", path: "../../../node_modules/.pnpm/@capacitor+push-notifications@8.1.3_@capacitor+core@8.5.3/node_modules/@capacitor/push-notifications"),
        .package(name: "CapacitorScreenReader", path: "../../../node_modules/.pnpm/@capacitor+screen-reader@8.0.1_@capacitor+core@8.5.3/node_modules/@capacitor/screen-reader"),
        .package(name: "CapgoCapacitorSpeechRecognition", path: "../../../node_modules/.pnpm/@capgo+capacitor-speech-recognition@8.4.1_patch_hash=db6a4890cd00fd12170d5130dfbe03216d_029258950d35c7843e7aa7f901e59d7c/node_modules/@capgo/capacitor-speech-recognition"),
        .package(name: "CapgoCapacitorSpeechSynthesis", path: "../../../node_modules/.pnpm/@capgo+capacitor-speech-synthesis@8.0.25_@capacitor+core@8.5.3/node_modules/@capgo/capacitor-speech-synthesis"),
        .package(name: "RdlaboIonicThemeIos27", path: "../../../node_modules/@rdlabo/ionic-theme-ios27")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorHaptics", package: "CapacitorHaptics"),
                .product(name: "CapacitorPushNotifications", package: "CapacitorPushNotifications"),
                .product(name: "CapacitorScreenReader", package: "CapacitorScreenReader"),
                .product(name: "CapgoCapacitorSpeechRecognition", package: "CapgoCapacitorSpeechRecognition"),
                .product(name: "CapgoCapacitorSpeechSynthesis", package: "CapgoCapacitorSpeechSynthesis"),
                .product(name: "RdlaboIonicThemeIos27", package: "RdlaboIonicThemeIos27")
            ]
        )
    ]
)
