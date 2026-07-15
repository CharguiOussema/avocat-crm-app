# PWA Setup Guide for Avocat CRM

This guide will help you complete the PWA (Progressive Web App) setup for Avocat CRM.

## ✅ Already Implemented

The following PWA features have been fully implemented:

1. **Service Worker** - Auto-updates and caching strategies
2. **Offline Detection** - Shows status when user goes offline
3. **Install Prompt** - Prompts users to install the app
4. **Update Notifications** - Notifies users when new version is available
5. **Push Notifications** - Infrastructure for push notifications
6. **PWA Manifest** - Complete app manifest with metadata
7. **Meta Tags** - All necessary HTML meta tags for PWA

## 🎨 Generate App Icons (Required)

You need to generate app icons in various sizes. Here are your options:

### Option 1: Using Online Tools (Easiest)

1. **PWA Asset Generator** (Recommended)
   - Visit: https://www.pwabuilder.com/imageGenerator
   - Upload a 512x512 PNG logo
   - Download the generated icons
   - Extract to `public/icons/` folder

2. **RealFaviconGenerator**
   - Visit: https://realfavicongenerator.net/
   - Upload your logo
   - Configure settings
   - Download and extract to `public/icons/`

### Option 2: Using Command Line Tools

Install and use `pwa-asset-generator`:

```bash
# Install globally
npm install -g pwa-asset-generator

# Generate icons (replace 'logo.png' with your logo file)
pwa-asset-generator logo.png public/icons --icon-only --padding "10%" --background "#ffffff"
```

### Option 4: Using Included Script

We've included a helper script:

```bash
# Generate placeholder icons (already done)
node generate-icons.cjs

# Or with your own logo:
# 1. Place logo.png (512x512) in project root
# 2. Run: node generate-icons.cjs
```

### Option 3: Manual Creation with ImageMagick

If you have ImageMagick installed:

```bash
# Create a base 512x512 icon first (logo.png)
# Then run these commands:

convert logo.png -resize 72x72 public/icons/icon-72x72.png
convert logo.png -resize 96x96 public/icons/icon-96x96.png
convert logo.png -resize 128x128 public/icons/icon-128x128.png
convert logo.png -resize 144x144 public/icons/icon-144x144.png
convert logo.png -resize 152x152 public/icons/icon-152x152.png
convert logo.png -resize 192x192 public/icons/icon-192x192.png
convert logo.png -resize 384x384 public/icons/icon-384x384.png
convert logo.png -resize 512x512 public/icons/icon-512x512.png
```

### Required Icon Sizes

Place these icons in `public/icons/` folder:

- ✅ icon-72x72.png
- ✅ icon-96x96.png
- ✅ icon-128x128.png
- ✅ icon-144x144.png
- ✅ icon-152x152.png
- ✅ icon-192x192.png
- ✅ icon-384x384.png
- ✅ icon-512x512.png

### Icon Design Guidelines

- **Format**: PNG with transparency
- **Size**: Square (1:1 ratio)
- **Content**: Should look good when scaled down
- **Padding**: Leave 10-20% padding around edges
- **Background**: Transparent or solid color
- **Safe Zone**: Keep important content in center 80%

## 📱 Optional: Screenshots

For better app store presentation, add screenshots:

1. Desktop screenshot (1280x720): `public/screenshots/desktop-screenshot.png`
2. Mobile screenshot (750x1334): `public/screenshots/mobile-screenshot.png`

## 🔔 Push Notifications Setup (Backend)

To enable push notifications, you need to set up the backend:

### 1. Generate VAPID Keys

In your backend project (`avocat-server`), run:

```bash
# Install web-push library
npm install web-push

# Generate VAPID keys
npx web-push generate-vapid-keys
```

This will output:
```
Public Key: BG...
Private Key: 5K...
```

### 2. Add VAPID Keys to Backend .env

```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

### 3. Add VAPID Public Key to Frontend .env

Create `.env` in `avocat-crm-app`:

```env
VITE_VAPID_PUBLIC_KEY=your_public_key_here
```

### 4. Backend API Endpoints Needed

Create these endpoints in your backend:

```typescript
// POST /api/notifications/subscribe
// Body: { endpoint, keys: { p256dh, auth } }
// Save subscription to database

// POST /api/notifications/send
// Body: { userId, title, body, data }
// Send push notification to user's devices

// DELETE /api/notifications/unsubscribe
// Body: { endpoint }
// Remove subscription from database
```

### 5. Example: Subscribing in Frontend

```typescript
import { notificationService } from './services/notificationService';

// When user grants permission
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const subscription = await notificationService.subscribe(vapidPublicKey);

// Send subscription to your backend
await fetch('/api/notifications/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(subscription)
});
```

## 🧪 Testing Your PWA

### 1. Development Testing

```bash
npm run dev
```

The PWA features work in development mode because `devOptions.enabled: true` is set.

### 2. Production Build Testing

```bash
npm run build
npm run preview
```

### 3. Testing on Different Devices

- **Desktop**: Chrome, Edge, Safari (Mac)
- **Android**: Chrome, Samsung Internet
- **iOS**: Safari 16.4+ (limited features)

### 4. PWA Audit with Lighthouse

1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Fix any issues reported

## 🔍 Troubleshooting

### Icons Not Showing

- Clear browser cache
- Check icon paths in `manifest.json`
- Verify icons exist in `public/icons/`
- Check browser console for 404 errors

### Install Prompt Not Showing

- PWA must be served over HTTPS (or localhost)
- Must have valid manifest.json
- Must have service worker registered
- Icons must be available
- User hasn't dismissed it before

### Service Worker Not Updating

- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear application storage in DevTools
- Check "Update on reload" in DevTools > Application > Service Workers

### Notifications Not Working

- Check notification permission in browser settings
- VAPID keys must be configured
- Backend must be set up to send notifications
- iOS requires Safari 16.4+ and limited support

## 📊 PWA Features by Platform

| Feature | Chrome/Edge | Firefox | Safari (Mac) | Safari (iOS) |
|---------|-------------|---------|--------------|--------------|
| Install | ✅ | ✅ | ✅ | ✅ (Add to Home Screen) |
| Offline | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ✅ | ⚠️ (16.4+ limited) |
| Background Sync | ✅ | ❌ | ❌ | ❌ |
| Shortcuts | ✅ | ❌ | ❌ | ❌ |

## 🎯 Next Steps

1. ✅ Generate app icons (see above)
2. ✅ Test the PWA on different devices
3. ✅ Set up push notifications backend (optional)
4. ✅ Add app screenshots (optional)
5. ✅ Run Lighthouse audit
6. ✅ Deploy to HTTPS server

## 📚 Additional Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google: PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

## 🔐 Security Considerations

- ✅ Always serve PWA over HTTPS in production
- ✅ Validate push notification subscriptions server-side
- ✅ Encrypt sensitive data in IndexedDB
- ✅ Implement proper CORS headers
- ✅ Rate-limit push notification endpoints
- ✅ Clear cache on logout (security-sensitive data)

## 💡 Tips for Legal/CRM PWA

1. **Offline-First Strategy**: Cache client lists and case summaries
2. **Smart Caching**: Don't cache sensitive documents offline
3. **Push Notifications**: Use for court date reminders, urgent updates
4. **Background Sync**: Queue form submissions when offline
5. **Data Privacy**: Clear cache when user logs out
6. **File Size**: Optimize images and documents for faster loading

---

**Need Help?** Check the browser console for errors or open an issue in the project repository.
