# Centralized API Configuration

This document explains how the application uses centralized configuration from `src/constants.ts` for all API calls.

## Configuration Structure

The configuration is environment-aware and automatically selects the appropriate settings:

```typescript
// Development Configuration (Default)
const DEV_CONFIG: ConfigType = {
  API_URL: "http://localhost:3000",  // Backend server
  CRM_URL: "http://localhost:5174",  // Frontend dev server
};

// Production Configuration
const PRODUCTION_CONFIG: ConfigType = {
  API_URL: "http://localhost:3005",
  CRM_URL: "http://localhost:5173",
};
```

## How It Works

1. **Environment Detection**: The app automatically detects the environment using `import.meta.env.MODE`
2. **Configuration Selection**: Based on the environment, the appropriate config is selected
3. **Global Usage**: All API calls throughout the app use `API_URL` from this central source

## Files Updated

### ✅ Core API Configuration
- **`src/hooks/useFetch.ts`**: Updated to use `API_URL` from constants
- **`src/contexts/AuthContext.tsx`**: Updated to use `API_URL` from constants
- **`src/services/api.ts`**: Already using centralized configuration

### ✅ Environment Exports
- **`API_URL`**: The main API endpoint URL
- **`CRM_URL`**: The frontend application URL
- **`CONFIG`**: Complete configuration object
- **`isDevelopment`**, **`isProduction`**, **`isTest`**: Environment flags

## Usage Examples

### In API Hooks
```typescript
import { API_URL } from '../constants';

const response = await axios.get(`${API_URL}/api/auth/me`);
```

### In Services
```typescript
import { API_URL } from '../constants';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});
```

### Environment Checks
```typescript
import { isDevelopment } from '../constants';

if (isDevelopment) {
  console.log('Development mode enabled');
}
```

## Benefits

1. **Single Source of Truth**: All API URLs managed in one place
2. **Environment Aware**: Automatic configuration based on build environment
3. **Easy Maintenance**: Change URLs in one file, affects entire app
4. **Type Safety**: Full TypeScript support with proper types
5. **Consistency**: No more scattered hardcoded URLs throughout the codebase

## Port Mapping

- **Backend (avocat-server)**: `http://localhost:3000` (default SERVER_PORT)
- **Frontend (avocat-crm-app)**: `http://localhost:5174` (Vite dev server)

## Notes

- The configuration automatically handles different environments (development, production, test)
- All hardcoded API URLs have been replaced with centralized configuration
- The backend port has been verified to match the default SERVER_PORT (3000)
- Frontend CRM_URL updated to match the actual Vite dev server port (5174)