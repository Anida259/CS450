# Technical Requirements

🛠️ System Requirements
To run this React Native application locally, ensure your system meets the following requirements:

1. Operating System
macOS, Windows, or Linux (for development)
Android or iOS device/emulator (for testing)

3. Development Environment
Node.js >= 14.x
npm or Yarn for package management
Expo CLI (recommended) or React Native CLI
Git (for version control)

5. Mobile Runtime
Android 8.0 (API 26) or higher
iOS 12.0 or higher

📦 Dependencies
Library	Version	Purpose
react-native	^0.72+ (or compatible)	Core mobile framework
@react-native-async-storage/async-storage	^1.19+	Persistent storage for favorites
react	^18.0+	Component rendering
expo (optional)	^49+	Simplifies build and testing (if used)

⚠️ If not using Expo, make sure to configure native modules (like AsyncStorage) accordingly.

🌐 External APIs
Art Institute of Chicago API
Used to fetch artwork data.
Endpoint: https://api.artic.edu/api/v1/artworks


✅ Features Implemented
Paginated listing of artworks from the API
Artwork search by keyword
Artwork detail modal view
Add/remove favorites with local storage using AsyncStorage
Image display with fallback for missing images
Share artwork details via device sharing interface
Persistent favorite artworks across sessions


📱 Platform Support
✅ Android
✅ iOS
✅ Emulators and Physical Devices
