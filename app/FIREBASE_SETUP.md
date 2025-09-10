# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "dynamic-trike")
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Optionally enable other sign-in methods as needed

## 3. Create Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database (choose the closest to your users)

## 4. Get Firebase Configuration

1. In your Firebase project, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (</>)
4. Register your app with a nickname (e.g., "dynamic-trike-web")
5. Copy the Firebase configuration object

## 5. Update Firebase Configuration

Replace the placeholder values in `app/lib/firebase.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## 6. Set Up Firestore Security Rules

In the Firestore Database section, go to "Rules" tab and update the rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own trips
    match /trips/{tripId} {
      allow read, write: if request.auth != null && 
        (resource.data.passenger == request.auth.uid || 
         resource.data.driver == request.auth.uid);
      allow create: if request.auth != null && 
        request.resource.data.passenger == request.auth.uid;
    }
    
    // Users can read/write their own driver profile
    match /drivers/{driverId} {
      allow read, write: if request.auth != null && 
        resource.data.user == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.user == request.auth.uid;
    }
    
    // Everyone can read fuel prices
    match /fuel_prices/{priceId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 7. Test the Setup

1. Start your app: `npm start`
2. Try to register a new user
3. Check the Firebase Console to see if the user was created in Authentication
4. Check Firestore to see if the user document was created

## 8. Optional: Set Up Firebase Hosting

If you want to deploy your app:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build and deploy: `npm run build && firebase deploy`

## Troubleshooting

- **Authentication errors**: Make sure Email/Password is enabled in Firebase Auth
- **Firestore errors**: Check your security rules and make sure the database is in test mode
- **Configuration errors**: Double-check your Firebase config values
- **Network errors**: Make sure your app has internet access

## Migration Notes

- PocketBase collections are now Firestore collections
- PocketBase's `created` and `updated` fields are now `createdAt` and `updatedAt`
- PocketBase's `expand` functionality is replaced with separate queries
- Authentication is now handled by Firebase Auth instead of PocketBase Auth
