# Dynamic Trike - Setup Guide for New Laptop

This guide will help you set up the Dynamic Trike React Native app on a new laptop.

## Prerequisites

### 1. Install Required Software

#### Node.js and npm
- Download and install [Node.js](https://nodejs.org/) (LTS version recommended)
- npm comes bundled with Node.js
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

#### Expo CLI
- Install Expo CLI globally:
  ```bash
  npm install -g @expo/cli
  ```
- Verify installation:
  ```bash
  expo --version
  ```

#### Git (if not already installed)
- Download from [git-scm.com](https://git-scm.com/)
- Verify installation:
  ```bash
  git --version
  ```

### 2. Mobile Device Setup (for testing)

#### Option A: Expo Go App (Recommended for development)
- Install **Expo Go** on your phone:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

#### Option B: Android Studio (for Android emulator)
- Download [Android Studio](https://developer.android.com/studio)
- Install Android SDK and create a virtual device

#### Option C: Xcode (for iOS simulator - macOS only)
- Install Xcode from Mac App Store
- Install Xcode Command Line Tools

## Project Setup

### 1. Transfer the Code

#### Method A: Using Git (Recommended)
```bash
# Clone the repository
git clone <your-repository-url>
cd dynamic-trike

# Or if you have the code in a folder, copy it to the new laptop
```

#### Method B: Manual Transfer
1. Copy the entire `dynamic-trike` folder to the new laptop
2. Make sure all files are preserved (including hidden files like `.git`)

### 2. Install Dependencies

Navigate to the app directory and install dependencies:

```bash
cd dynamic-trike/app
npm install
```

### 3. Firebase Configuration

The app uses Firebase for authentication and database. The current configuration is already set up, but you may want to create your own Firebase project:

#### Option A: Use Existing Firebase Project (Current Setup)
- The app is already configured with a Firebase project
- No additional setup needed
- **Note**: This uses shared credentials - consider creating your own for production

#### Option B: Create Your Own Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create Firestore Database
5. Get your Firebase configuration
6. Update `app/lib/firebase.ts` with your configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 4. Start the Development Server

```bash
cd dynamic-trike/app
npm start
```

This will:
- Start the Expo development server
- Show a QR code in the terminal
- Open the Expo DevTools in your browser

### 5. Run the App

#### On Physical Device (Recommended)
1. Open Expo Go app on your phone
2. Scan the QR code from the terminal
3. The app will load on your device

#### On Emulator/Simulator
- **Android**: Press `a` in the terminal or run `npm run android`
- **iOS**: Press `i` in the terminal or run `npm run ios` (macOS only)
- **Web**: Press `w` in the terminal or run `npm run web`

## Project Structure

```
dynamic-trike/
├── app/                          # Main app directory
│   ├── assets/                   # Images, icons, etc.
│   │   └── images/
│   │       └── onboarding/       # Onboarding images
│   ├── contexts/                 # React contexts
│   ├── lib/                      # Firebase configuration
│   ├── screens/                  # App screens
│   │   └── onboarding/           # Onboarding screens
│   ├── services/                 # API services
│   ├── types/                    # TypeScript types
│   ├── App.tsx                   # Main app component
│   ├── app.json                  # Expo configuration
│   └── package.json              # Dependencies
└── server/                       # Backend server (PocketBase)
```

## Key Features

- **Authentication**: Firebase Auth with email/password
- **Database**: Firestore for user data and trips
- **Navigation**: React Navigation with stack navigator
- **Onboarding**: 3-screen onboarding flow with custom images
- **Theme**: Green color scheme (#58BC6B)
- **Platform**: React Native with Expo

## Troubleshooting

### Common Issues

#### 1. Metro bundler issues
```bash
# Clear Metro cache
npx expo start --clear
```

#### 2. Node modules issues
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### 3. Expo Go connection issues
- Make sure your phone and laptop are on the same WiFi network
- Try using the tunnel connection: `expo start --tunnel`

#### 4. Firebase connection issues
- Check your internet connection
- Verify Firebase configuration in `app/lib/firebase.ts`
- Check Firebase project status in Firebase Console

#### 5. Image loading issues
- Make sure all image files are in the correct directories
- Check file paths in the code
- Verify image file formats (PNG, JPG)

### Development Tips

1. **Hot Reload**: Changes to your code will automatically reload the app
2. **Debugging**: Use React Native Debugger or Chrome DevTools
3. **Logs**: Check terminal for error messages and logs
4. **Expo DevTools**: Use the web interface for additional debugging tools

## Production Deployment

When ready to deploy:

1. **Build for production**:
   ```bash
   expo build:android  # For Android
   expo build:ios      # For iOS
   ```

2. **Publish to Expo**:
   ```bash
   expo publish
   ```

3. **Create standalone app**:
   ```bash
   expo build:android --type apk
   ```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Expo documentation: [docs.expo.dev](https://docs.expo.dev/)
3. Check React Native documentation: [reactnative.dev](https://reactnative.dev/)
4. Review Firebase documentation: [firebase.google.com/docs](https://firebase.google.com/docs)

## Environment Variables (Optional)

If you want to use environment variables for configuration:

1. Create `.env` file in the `app` directory:
   ```
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   ```

2. Install expo-constants:
   ```bash
   npm install expo-constants
   ```

3. Update `app/lib/firebase.ts` to use environment variables

---

**Note**: This app is configured for development. For production deployment, make sure to:
- Create your own Firebase project
- Update security rules
- Configure proper authentication
- Test thoroughly on different devices



