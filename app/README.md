# Dynamic Trike - Ride Sharing App

A React Native/Expo app with PocketBase backend for ride-sharing services.

## 🚀 Features

### Authentication
- User registration and login
- Role-based access (Passenger, Driver, Admin)
- Persistent authentication with AsyncStorage

### User Roles
- **Passenger**: Request rides, track trips
- **Driver**: Accept trips, manage profile, complete rides
- **Admin**: Manage users, view all trips, set fuel prices

### Database Collections
- **Users**: Authentication and user profiles
- **Drivers**: Driver-specific information and verification
- **Trips**: Ride requests with location data and status tracking
- **Fuel Prices**: Dynamic pricing based on fuel costs

## 🏗️ Architecture

### Frontend (Expo/React Native)
```
app/
├── contexts/
│   └── AuthContext.tsx          # Authentication state management
├── lib/
│   └── pocketbase.ts            # PocketBase client configuration
├── screens/
│   ├── LoginScreen.tsx          # User login
│   ├── RegisterScreen.tsx       # User registration
│   └── HomeScreen.tsx           # Main dashboard
├── services/
│   └── api.ts                   # API service functions
├── types/
│   └── database.ts              # TypeScript type definitions
└── App.tsx                      # Main app component
```

### Backend (PocketBase)
```
server/
├── pb_data/                     # Database files
├── pb_migrations/               # Database schema migrations
└── pocketbase.exe               # PocketBase server
```

## 🔧 Setup Instructions

### 1. Start PocketBase Server
```bash
cd server
./pocketbase.exe serve --dev
```

### 2. Create Admin Account
- Go to `http://127.0.0.1:8090/_/`
- Create your first admin account

### 3. Start Expo App
```bash
cd app
npx expo start
```

### 4. Test the App
- Scan QR code with Expo Go app
- Register a new user account
- Test login/logout functionality

## 📱 App Flow

1. **Authentication**: Users register/login with email and password
2. **Role Selection**: Choose between Passenger or Driver during registration
3. **Dashboard**: Role-specific home screen with relevant actions
4. **Trip Management**: 
   - Passengers can request rides
   - Drivers can accept and complete trips
   - Admins can manage all aspects

## 🛠️ API Endpoints

### Authentication
- `POST /api/collections/users/auth-with-password` - Login
- `POST /api/collections/users` - Register

### Trips
- `GET /api/collections/trips` - Get user's trips
- `POST /api/collections/trips` - Create new trip
- `PATCH /api/collections/trips/:id` - Update trip status

### Drivers
- `GET /api/collections/drivers` - Get driver profile
- `POST /api/collections/drivers` - Create driver profile

### Fuel Prices
- `GET /api/collections/fuel_prices` - Get current fuel price

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Secure password handling
- API request validation
- CORS protection

## 🎨 UI/UX Features

- Modern, clean design with Tailwind-inspired styling
- Role-based navigation and actions
- Responsive forms with validation
- Loading states and error handling
- Intuitive user experience

## 📦 Dependencies

### Core
- `expo` - React Native framework
- `react-navigation` - Navigation
- `pocketbase` - Backend client
- `@react-native-async-storage/async-storage` - Local storage

### Development
- `typescript` - Type safety
- `@types/react` - React types

## 🚀 Next Steps

1. **Add Trip Request Screen**: Map integration for ride requests
2. **Driver Dashboard**: Real-time trip notifications
3. **Payment Integration**: Fare calculation and payment processing
4. **Push Notifications**: Trip updates and driver assignments
5. **Admin Panel**: User management and analytics
6. **Testing**: Unit and integration tests

## 🐛 Troubleshooting

### Common Issues
1. **PocketBase Connection**: Ensure server is running on `127.0.0.1:8090`
2. **Authentication Errors**: Check user credentials and role permissions
3. **TypeScript Errors**: Run `npx expo install --fix` to resolve dependency issues

### Development Tips
- Use Expo DevTools for debugging
- Check PocketBase admin panel for data validation
- Monitor network requests in browser dev tools
- Use React Native Debugger for state inspection
