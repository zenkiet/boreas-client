// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "BoreasCapacitorVoice",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "BoreasCapacitorVoice", targets: ["VoicePlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.5.3"),
        .package(url: "https://github.com/k2-fsa/sherpa-onnx", exact: "1.13.8")
    ],
    targets: [
        .target(
            name: "VoicePlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "sherpa-onnx", package: "sherpa-onnx")
            ],
            path: "ios/Sources/VoicePlugin"
        )
    ]
)
