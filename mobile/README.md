# TaskManager - Mobile Surface

The mobile surface for TaskManager is a cross-platform application built with Flutter. It provides on-the-go access to task management with native performance.

## 🚀 Tech Stack
- **Framework**: Flutter
- **Language**: Dart
- **Authentication**: Firebase Auth & Google Sign-In
- **State Management**: Scalable architecture ready for Provider/Riverpod

## 🏗 Architecture
- **Shared Data Models**: Dart models in `lib/models/` are manually mapped to the TypeScript interfaces in the root `/shared` directory to maintain consistency across the 3-tier stack.
- **Service Layer**: Decoupled authentication and API services for better testability.

## 🛠 Features Implemented
- **Firebase Core**: Initialized with support for Auth and Cloud Messaging.
- **Synchronized Models**: `User`, `DependencyData`, and `APIResponse` models implemented in Dart.
- **Auth Configuration**: Dependencies for Google Sign-In and Firebase Auth are pre-configured in `pubspec.yaml`.

## 🚦 Getting Started

### Prerequisites
- Flutter SDK (latest stable)
- CocoaPods (for iOS)
- Android Studio / VS Code

### Setup
1. Fetch dependencies:
   ```bash
   flutter pub get
   ```
2. Place `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) in their respective directories (see `next_steps.txt`).
3. Run the application:
   ```bash
   flutter run
   ```

## 📄 Documentation
- [Decisions Log](decisions.log): Architectural decisions and rationale.
- [Next Steps](next_steps.txt): Detailed guide for the next phase of development.
