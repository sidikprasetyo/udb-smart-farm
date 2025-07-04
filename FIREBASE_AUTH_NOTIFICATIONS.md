# Firebase Authentication with Toast Notifications

This project now includes Firebase Authentication with beautiful toast notifications for better user experience.

## Features Added

### 🔐 Authentication Features

- **Login with Email/Password** - Secure Firebase authentication
- **Registration** - Create new user accounts
- **Logout** - Secure session termination
- **Auto-redirect** - Automatic navigation after auth actions

### 🎉 Notification System

- **Toast Notifications** - Beautiful, non-intrusive notifications using `react-hot-toast`
- **Loading States** - Visual feedback during authentication processes
- **Success Messages** - Celebratory messages for successful actions
- **Error Handling** - User-friendly error messages with specific guidance
- **Custom Styling** - Branded colors and positioning

## Notification Types

### Login Notifications

- **Loading**: "Logging in..." with spinner
- **Success**: "Login successful! Welcome back! 🎉" (Green theme)
- **Error**: Specific error messages based on Firebase error codes

### Registration Notifications

- **Loading**: "Creating your account..." with spinner
- **Success**: "Account created successfully! Welcome! 🎉" (Green theme)
- **Error**: Specific error messages for registration issues

### Logout Notifications

- **Loading**: "Logging out..." with spinner
- **Success**: "Logged out successfully! See you soon! 👋" (Blue theme)
- **Error**: "Failed to logout. Please try again." (Red theme)

## Usage Examples

### Using the Login Page

```tsx
// The login page automatically handles notifications
// Users will see toast messages for all auth states
```

### Using the Logout Hook

```tsx
import useLogout from "@/hooks/useLogout";

const MyComponent = () => {
  const { handleLogout } = useLogout();

  return <button onClick={handleLogout}>Logout</button>;
};
```

### Using the Logout Button Component

```tsx
import LogoutButton from "@/components/elements/LogoutButton";

// Default button with icon and text
<LogoutButton />

// Icon only
<LogoutButton variant="icon-only" size="sm" />

// Text only
<LogoutButton variant="text-only" size="lg" />
```

## Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication with Email/Password
3. Get your config values from Project Settings
4. Add them to your `.env.local` file

## Toast Notification Customization

### Position Options

- `top-left`
- `top-center` (default)
- `top-right`
- `bottom-left`
- `bottom-center`
- `bottom-right`

### Custom Styling

```tsx
toast.success("Message", {
  duration: 4000,
  position: "top-center",
  style: {
    background: "#10B981",
    color: "#fff",
  },
});
```

## Error Handling

The system includes specific error messages for common Firebase auth errors:

- `auth/user-not-found` → "User not found. Please check your email address."
- `auth/wrong-password` → "Incorrect password. Please try again."
- `auth/invalid-email` → "Invalid email address."
- `auth/user-disabled` → "This account has been disabled."
- `auth/too-many-requests` → "Too many failed attempts. Please try again later."
- `auth/email-already-in-use` → "Email address is already in use."
- `auth/weak-password` → "Password is too weak. Please use a stronger password."
- `auth/network-request-failed` → "Network error. Please check your internet connection."

## Dependencies

- `firebase` - Firebase SDK
- `react-hot-toast` - Toast notification library
- `next/navigation` - Next.js navigation
- `react-icons` - Icon library

## File Structure

```
src/
├── lib/
│   └── firebaseAuth.ts          # Firebase auth functions with notifications
├── hooks/
│   ├── useAuth.ts               # Auth state management
│   └── useLogout.ts             # Logout functionality
├── components/
│   ├── elements/
│   │   └── LogoutButton/        # Reusable logout button
│   └── Header.tsx               # Updated with logout functionality
└── app/
    ├── layout.tsx               # Toast provider setup
    └── auth/
        └── login/
            └── page.tsx         # Login page with notifications
```
