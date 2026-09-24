# TestPilot Todo App (React Native)

A modern, production-grade React Native Todo mobile application built for automated end-to-end testing, cloud test labs (Firebase Test Lab, Maestro Cloud), and CI/CD pipelines.

---

## 📱 Features

- **Dynamic Task Management**: Add, toggle complete/active status, and delete tasks.
- **Filter Tabs**: Filter tasks by All, Active, and Completed.
- **Public API Synchronization**: Asynchronously fetches initial and suggested tasks from JSONPlaceholder REST API (`https://jsonplaceholder.typicode.com/todos`).
- **Native Push Notifications**: Custom native Android module (`PushNotificationModule`) providing high-priority system alerts and vibration for task creations and state updates.
- **Accessibility & Test IDs**: Complete suite of test IDs and accessibility labels (`testID`, `accessibilityLabel`, `accessibilityRole`) optimized for Maestro, Appium, Detox, and UIAutomator.
- **Safe Area Support**: Fully responsive across modern Android devices and iOS notches/Dynamic Islands using `react-native-safe-area-context`.

---

## 🛠 Tech Stack

- **Framework**: React Native 0.86.2 (React 19.2.3)
- **Language**: TypeScript 5.8.3
- **Native Android**: Kotlin, Gradle 9.3, Android SDK 35
- **Unit Testing**: Jest & React Test Renderer
- **Code Quality**: ESLint, TypeScript Strict Typing
- **E2E Automation**: Maestro UI Flows

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 22.11.0
- **npm** or **yarn**
- **Java Development Kit (JDK)**: JDK 17 or JDK 21
- **Android SDK**: Build tools, Platform SDK 35 (for Android builds)
- **Xcode & CocoaPods**: (for iOS macOS builds)

### Installation

```bash
# Clone the repository
git clone https://github.com/amitraj619/testpilot-todo-app.git
cd testpilot-todo-app

# Install JavaScript dependencies
npm install
```

---

## 🧪 Testing & Verification

### 1. Run Unit Tests (Jest)
```bash
npm test -- --watchAll=false
```

### 2. Run Linter (ESLint)
```bash
npm run lint
```

### 3. Run TypeScript Type Check
```bash
npx tsc --noEmit
```

---

## 🏗 Building the App

### Android Debug Build
```bash
cd android
./gradlew assembleDebug
```
Output APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Android Release Build
```bash
cd android
./gradlew assembleRelease
```
Output APK: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🤖 Maestro End-to-End Test Automation

The repository includes pre-configured Maestro flows in `.maestro/`:

- `01_add_todo_flow.yaml`: Tests adding a new task and verifies the banner/list entry.
- `02_toggle_complete_flow.yaml`: Tests toggling item completed checkbox and status banner.
- `03_completed_filter_isolation_flow.yaml`: Tests filtering between All, Active, and Completed views.
- `04_delete_todo_flow.yaml`: Tests removing a task and validates list update.
- `05_suggest_public_task_flow.yaml`: Tests fetching a suggested task from the REST endpoint.
- `06_push_notification_drawer_flow.yaml`: Tests opening notification tray and verifying native system notification.

### Run Locally on Emulator:
```bash
maestro test -e APP_ID=com.testpilot_demo .maestro/01_add_todo_flow.yaml
```

### Run All Flows:
```bash
maestro test -e APP_ID=com.testpilot_demo .maestro/
```

---

## ☁️ CI/CD

This repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically:
1. Installs dependencies and runs TypeScript verification, ESLint, and Jest unit tests.
2. Builds the Android Release APK (`app-release.apk`).
3. Uploads the build artifact for automated cloud platform testing.
