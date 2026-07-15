# PWA Testing Guide for Avocat CRM

Complete guide to test all PWA features in your application.

---

## 🚀 Quick Start Testing

### 1. Development Mode Testing

The PWA features are **enabled in development mode**, so you can test immediately:

```bash
# Start the development server
npm run dev
```

Then open: `http://localhost:5173` (or the port shown in terminal)

**What works in dev mode:**
- ✅ Service Worker registration
- ✅ Offline detection
- ✅ Install prompt (limited)
- ✅ Update notifications
- ✅ All PWA components

---

## 🏗️ Production Build Testing (Recommended)

For full PWA testing, use production build:

```bash
# 1. Build the application
npm run build

# 2. Preview the production build
npm run preview
```

Then open: `http://localhost:4173` (or the port shown)

**Why production build?**
- ✅ Full service worker functionality
- ✅ Actual caching behavior
- ✅ Real install prompt
- ✅ Complete PWA manifest
- ✅ Production-like performance

---

## 📋 Feature-by-Feature Testing

### ✅ Test 1: Offline Detection

**Steps:**
1. Start the app (dev or preview)
2. Open Chrome DevTools (F12)
3. Go to **Network** tab
4. Check **Offline** (throttling dropdown)
5. Reload the page or navigate

**Expected Result:**
- Yellow banner appears at top: "You're offline - Changes will sync when reconnected"
- Banner shows your selected language (EN/FR/AR)

**To test reconnection:**
1. Uncheck **Offline** in DevTools
2. Wait 3 seconds

**Expected Result:**
- Green banner appears: "You're back online!"
- Banner auto-hides after 3 seconds

---

### ✅ Test 2: Service Worker Registration

**Steps:**
1. Open the app
2. Open Chrome DevTools (F12)
3. Go to **Application** tab
4. Click **Service Workers** (left sidebar)

**Expected Result:**
- You should see a service worker registered
- Status: **activated and running**
- Source: `/sw.js` or similar
- Options to Unregister, Update, etc.

**Console verification:**
```javascript
// In browser console, type:
navigator.serviceWorker.controller
```

**Expected:** Should return a ServiceWorker object (not null)

---

### ✅ Test 3: Install Prompt (A2HS - Add to Home Screen)

**Desktop (Chrome/Edge):**

**Steps:**
1. Open app in Chrome/Edge
2. Wait 2-3 seconds

**Expected Result:**
- Install prompt appears (bottom-right corner)
- Shows: "Install Avocat CRM" with description
- Two buttons: "Install" and "Not now"

**To test installation:**
1. Click **Install**
2. Confirm in browser dialog

**Expected Result:**
- App installs as standalone app
- New app window opens
- App appears in OS applications
- Install prompt no longer shows

**Mobile (Android Chrome):**

**Steps:**
1. Open app on Android Chrome
2. Wait for bottom banner: "Add Avocat CRM to Home screen"
3. Or tap menu (⋮) → "Install app" or "Add to Home screen"

**Expected Result:**
- App icon added to home screen
- Opens in standalone mode (no browser UI)

**iOS (Safari):**
**Steps:**
1. Open app in Safari on iOS
2. Tap Share button
3. Tap "Add to Home Screen"
4. Name the app and tap "Add"

**Note:** iOS has limited PWA support, no automatic install prompt

---

### ✅ Test 4: Caching & Offline Functionality

**Test API Caching:**

**Steps:**
1. Open app and login
2. Navigate to Clients page (loads data)
3. Open DevTools → Network tab
4. Check **Offline**
5. Refresh the page

**Expected Result:**
- Page loads from cache
- Client data appears (from cache)
- Yellow "offline" banner shows

**Test Static Asset Caching:**

**Steps:**
1. Open DevTools → Application → Cache Storage
2. Expand cache entries (you should see multiple caches):
   - `workbox-precache-v2-...` (app shell)
   - `api-cache` (API responses)
   - `image-cache` (images)
   - `static-resources` (CSS, JS)

**Expected Result:**
- Multiple cache entries visible
- Cached files listed with URLs and sizes

**Clear and test:**
1. Right-click cache → Delete
2. Reload page
3. Cache rebuilds automatically

---

### ✅ Test 5: Update Notifications

**Steps:**
1. Open app in production preview mode
2. Keep the app open
3. Make a small change to code (e.g., edit a component)
4. Rebuild: `npm run build`
5. The build creates a new service worker

**Expected Result:**
- Blue notification appears (bottom-left)
- "Update Available" with description
- "Update Now" button

**To test update:**
1. Click **Update Now**

**Expected Result:**
- Page reloads automatically
- New version is active
- Notification disappears

**Alternative test:**
1. In DevTools → Application → Service Workers
2. Check "Update on reload"
3. Reload the page
4. New service worker activates

---

### ✅ Test 6: Notification Permissions

**Steps:**
1. Open app (first time, or after clearing site data)
2. Wait 2-3 seconds after install prompt

**Expected Result:**
- Notification permission prompt appears (top-right)
- Shows: "Stay Updated" with description
- Two buttons: "Enable" and "Later"

**To test permission request:**
1. Click **Enable**

**Expected Result:**
- Browser asks for notification permission
- After granting: prompt disappears
- Permission stored (won't show again)

**To test dismissal:**
1. Click **Later**

**Expected Result:**
- Prompt disappears
- Stored in sessionStorage
- Won't show again this session

**Check permission status:**
```javascript
// In browser console:
Notification.permission
// Should return: "granted", "denied", or "default"
```

---

### ✅ Test 7: PWA Manifest

**Steps:**
1. Open app
2. Open DevTools → Application tab
3. Click **Manifest** (left sidebar)

**Expected Result:**
- Manifest loaded and parsed
- App Name: "Avocat CRM - Legal Case Management"
- Short Name: "Avocat CRM"
- Start URL: "/"
- Theme Color: #1890ff (blue)
- Icons: 8 icons listed (72x72 to 512x512)
- Display: "standalone"

**Test identity:**
- All icons should show (if generated)
- No errors in manifest parsing

---

### ✅ Test 8: Internationalization (i18n)

**Test all 3 languages:**

**English:**
1. Change language to English
2. Go offline (Network tab)

**Expected:**
- Offline banner: "You're offline - Changes will sync when reconnected"

**French:**
1. Change language to French (Français)
2. Go offline

**Expected:**
- Banner: "Vous êtes hors ligne - Les modifications seront synchronisées lors de la reconnexion"

**Arabic:**
1. Change language to Arabic (العربية)
2. Go offline

**Expected:**
- Banner: "أنت غير متصل بالإنترنت - ستتم مزامنة التغييرات عند إعادة الاتصال"
- RTL layout respected

**Test install prompt:**
- Should show translated text for each language
- "Install" / "Installer" / "تثبيت"

---

## 🔍 Chrome DevTools PWA Inspector

### Application Tab Deep Dive

Open **DevTools → Application** to inspect:

**1. Manifest**
- View parsed manifest.json
- See all properties and values
- Check icon loading

**2. Service Workers**
- View active service worker
- Update/Unregister/Inspect
- See update cycle
- Test "Update on reload"
- Test "Bypass for network"

**3. Cache Storage**
- View all caches
- Inspect cached files
- See cache sizes
- Delete individual entries or entire caches

**4. Storage**
- LocalStorage: Check offline queue
- SessionStorage: Check dismissed prompts
- IndexedDB: (if you add offline data storage later)

**5. Background Services**
- Background Fetch
- Background Sync (if implemented)
- Notifications
- Periodic Background Sync

---

## 🎯 Lighthouse PWA Audit

**Most important test for PWA compliance!**

### Running Lighthouse

**Method 1: Chrome DevTools**
1. Open app
2. Open DevTools (F12)
3. Click **Lighthouse** tab (or "⋙" → Lighthouse)
4. Check **Progressive Web App** only (faster)
5. Click **Analyze page load**
6. Wait 10-30 seconds

**Method 2: Incognito Mode (Recommended)**
1. Open app in **Incognito/Private window**
2. Run Lighthouse (no extensions interfere)

### Expected Lighthouse Score

**PWA Category:**
- ✅ Target: **90-100%**
- ✅ All checks should be green

**Key PWA Audits:**
- ✅ Installable (manifest + service worker)
- ✅ Page load fast enough on mobile (< 3s)
- ✅ Works offline
- ✅ Configured for a custom splash screen
- ✅ Sets a theme color
- ✅ Content sized correctly for viewport
- ✅ Has a `<meta name="viewport">` tag
- ✅ Provides a valid apple-touch-icon

**Performance:**
- 🎯 Target: 90+
- Depends on your backend speed

**Accessibility:**
- ✅ Target: 100 (all components have ARIA labels)

**Best Practices:**
- ✅ Target: 90+

---

## 📱 Device Testing

### Desktop Browsers

**Chrome (Windows/Mac/Linux):**
✅ Full PWA support
- Install as standalone app
- All features work

**Edge (Windows/Mac):**
✅ Full PWA support (Chromium-based)
- Install as standalone app
- All features work

**Firefox (All platforms):**
⚠️ Partial support
- No install prompt (yet)
- Service worker works
- Offline works
- Add to home screen on Android

**Safari (Mac):**
✅ Good support (macOS 14+)
- Install via Dock
- Most features work
- Push notifications (limited)

### Mobile Testing

**Android (Chrome/Samsung Internet):**
✅ Best PWA support
- Full install experience
- All features work
- Push notifications work
- Background sync works

**Steps to test on Android:**
1. Build and deploy to a test server (or use ngrok)
2. Open on Android Chrome
3. Install when prompted
4. Test offline mode
5. Test notifications

**iOS (Safari 16.4+):**
⚠️ Limited support
- Manual "Add to Home Screen"
- Offline works
- Push notifications (iOS 16.4+, limited)
- No background sync

**Steps to test on iOS:**
1. Deploy to HTTPS server
2. Open in Safari
3. Tap Share → Add to Home Screen
4. Test offline mode

---

## 🧪 Testing Checklist

Use this checklist to verify all PWA features:

### Basic PWA
- [ ] Service worker registers successfully
- [ ] Manifest loads without errors
- [ ] App works in offline mode
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Installed app opens in standalone mode

### UI Components
- [ ] Offline indicator shows when offline
- [ ] Offline indicator shows when back online
- [ ] Install prompt is dismissible
- [ ] Update notification appears for new versions
- [ ] Update button reloads the app
- [ ] Notification permission prompt appears

### Internationalization
- [ ] All prompts show in English
- [ ] All prompts show in French
- [ ] All prompts show in Arabic (RTL respected)
- [ ] Language persists after reload

### Caching
- [ ] API responses are cached
- [ ] Images are cached
- [ ] Static files (CSS, JS) are cached
- [ ] Cache persists after closing browser
- [ ] Old caches are cleaned up

### Performance
- [ ] Lighthouse PWA score: 90+
- [ ] App loads in < 3 seconds
- [ ] Cached pages load instantly
- [ ] No console errors

### Cross-browser
- [ ] Works in Chrome Desktop
- [ ] Works in Edge Desktop
- [ ] Works in Firefox Desktop
- [ ] Works in Safari Desktop (Mac)
- [ ] Works in Chrome Mobile (Android)
- [ ] Works in Safari Mobile (iOS)

---

## 🐛 Troubleshooting

### Issue: Install prompt doesn't appear

**Solutions:**
1. Make sure you're using production build (`npm run preview`)
2. Clear browser data: DevTools → Application → Clear storage
3. Check manifest is valid: DevTools → Application → Manifest
4. Ensure icons exist in `public/icons/` folder
5. Must be HTTPS (or localhost)
6. Don't dismiss prompt too many times (browser blocks it)

### Issue: Service worker not registering

**Solutions:**
1. Check console for errors
2. Make sure you built the project (`npm run build`)
3. Service workers only work on HTTPS (or localhost)
4. Clear old service workers: DevTools → Application → Service Workers → Unregister
5. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue: Offline mode not working

**Solutions:**
1. Wait for service worker to activate (check Application tab)
2. Reload once after service worker activates
3. Check cache is populated: Application → Cache Storage
4. Network tab: Uncheck "Disable cache"
5. Try in incognito mode

### Issue: Updates not showing

**Solutions:**
1. Rebuild the project (`npm run build`)
2. Check "Update on reload" in Application → Service Workers
3. Force update: Unregister SW and reload
4. Wait 24 hours (some browsers cache SW for 24h)
5. Test in incognito mode

### Issue: Icons not showing

**Solutions:**
1. Run: `node generate-icons.cjs`
2. Verify icons exist: Check `public/icons/` folder
3. Must be PNG format (not SVG for manifest)
4. Clear browser cache and reload
5. Check manifest: DevTools → Application → Manifest

---

## 🎬 Quick Test Script

**5-Minute PWA Test:**

```bash
# 1. Build
npm run build

# 2. Preview
npm run preview
```

**In Browser:**
1. Open http://localhost:4173
2. Open DevTools (F12)
3. **Application tab:**
   - ✅ Check Service Worker is active
   - ✅ Check Manifest loads
4. **Network tab:**
   - ✅ Go offline → reload → page loads
5. **Lighthouse tab:**
   - ✅ Run PWA audit → Score 90+
6. **UI:**
   - ✅ Install prompt appears
   - ✅ Click Install → App installs
   - ✅ Open installed app → Works standalone

**Done! ✅**

---

## 📚 Additional Resources

**Chrome DevTools:**
- [Application Panel Guide](https://developer.chrome.com/docs/devtools/progressive-web-apps/)

**Testing Tools:**
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Checklist](https://web.dev/pwa-checklist/)

**Mobile Testing:**
- [ngrok](https://ngrok.com/) - Test locally on mobile
- [BrowserStack](https://www.browserstack.com/) - Test on real devices
- Chrome Remote Debugging for Android

---

## 🎯 Success Criteria

Your PWA is working correctly when:

✅ Lighthouse PWA score: **90-100**
✅ Install prompt appears automatically
✅ App works offline completely
✅ Updates notify users automatically
✅ All languages work correctly
✅ No console errors
✅ Service worker active
✅ Manifest valid
✅ Caches populated
✅ Icons display correctly

---

**Happy Testing! 🚀**

If you encounter issues, check the troubleshooting section or open an issue.
