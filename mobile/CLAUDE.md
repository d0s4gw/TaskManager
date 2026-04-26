# Mobile Tier (Flutter) Instructions

## 🛠 Mobile Commands
- **Get Deps**: `flutter pub get`
- **Run App**: `flutter run`
- **Run Tests**: `flutter test`
- **Analyze**: `flutter analyze`

## 🏗 Architecture & Parity
- **Manual Parity**: Dart models in `lib/models/` MUST be manually synchronized with the TypeScript interfaces in `/shared`. 
- **State Management**: Use **Riverpod** for all new features and state management logic.
- **Services**: All API calls must go through the `Service` layer (e.g., `lib/services/`).

## ⚠️ Agent Pitfalls
- **No Drift**: If you modify `shared/*.ts`, you MUST immediately update the corresponding `.dart` model in this directory.
- **iOS/Android Config**: Do not modify `ios/` or `android/` build files without explicit user approval.
