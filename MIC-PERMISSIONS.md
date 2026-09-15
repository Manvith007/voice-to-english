# 🎙️ Microphone Permissions Guide

How to enable the microphone for **VoiceToEnglish** on any device & browser.

> ⚠️ **Rule #1:** Voice apps require a **secure (HTTPS) page**. All our live URLs (`manvith007.github.io`, `*.netlify.app`, `*.vercel.app`) are HTTPS ✅ — `http://localhost` also works.

---

## 💻 Desktop — Windows / PC

### System level (do this once)
1. Open **Settings → Privacy & security → Microphone**
2. Turn **ON** "Microphone access"
3. Turn **ON** "Let apps access your microphone"
4. Make sure your browser app (Chrome/Edge/Firefox) has access **ON** in the same screen

### Browser level

| Browser | How to allow mic for the site |
|---|---|
| **Chrome** | Click the 🔒 icon in address bar → **Microphone: Allow** → Reload. Or go to `chrome://settings/content/microphone` |
| **Edge** | Same as Chrome (it's Chromium) — 🔒 icon → Allow. Or `edge://settings/content/microphone` |
| **Firefox** | Click the 🛡️ shield / 🔒 icon in address bar → Permissions → Microphone → Allow → Reload. Or `about:permissions` |
| **Brave / Opera / Vivaldi** | Address bar 🔒 icon → Microphone → Allow |

### 🛠 Tip: wrong microphone device
If you have multiple mics (headset + webcam + laptop mic):
- Chrome/Edge: mic icon in address bar → **Microphone** → pick the correct device, then reload
- Physical switch on headsets can also mute the mic — check it

---

## 🍏 Desktop — macOS

1. **System Settings → Privacy & Security → Microphone**
2. Toggle **ON** for your browser (Safari/Chrome/Edge/Firefox)
3. Open the app → browser asks "Allow microphone?" → **Allow**
4. Safari: if it doesn't ask again, go to **Safari → Settings → Websites → Microphone** and set the site to **Allow**

---

## 📱 iPhone / iPad (iOS)

### System level
1. **Settings → Privacy & Security → Microphone**
2. Turn **ON** for the browser you're using (Safari, Chrome, Edge, Firefox…)
3. If your browser isn't listed, tap **Reset broser settings** via Settings → browser name (rare fix)

### Browser level
1. Open VoiceToEnglish URL
2. Tap mic button → browser shows **"Allow microphone?"** popup → tap **Allow**
3. If the popup already disappeared without allowing:
   - **Safari:** Settings → Safari → (scroll) → **Microphone** → pick the site → **Allow**
   - **Chrome/Edge:** Settings → Apps → browser → tap the 🔒/mic icon near address bar → Microphone → Allow → Reload

### ⚠️ Important Telugu note on iPhone
Apple's built-in speech engine **does not support Telugu dictation** (English & Hindi are supported). This is an Apple-side limitation — no app can bypass it on iPhone.
- **English voice** on iPhone works ✅
- **Telugu voice** on iPhone ❌ — use the **"Type or paste"** box in the app instead, and you'll still get English letters instantly ✨
- On **Chrome (desktop/Android)** Telugu voice works perfectly ✅

---

## 🤖 Android

### System level
**Settings → Apps → [your browser] → Permissions → Microphone → Allow**

### Browser level
| Browser | How |
|---|---|
| **Chrome** | 🔒/mic icon in address bar → Microphone → Allow → Reload. Or `chrome://settings/content/microphone` |
| **Samsung Internet** | Tap the ⋯ menu → **Settings → Privacy and Security** → manage permissions, or the address-bar icon |
| **Firefox/Opera/Other** | Same concept — site permission in address bar always works |

### 🛠 Tip
If you dismissed the popup: tap the **padlock/mic icon** next to the URL → Microphone → **Allow** → then **Reload** the page.

---

## 🔍 Troubleshooting table

| Problem | Fix |
|---|---|
| Popup never appears | Check system-level mic access (above). Reload the page. |
| "Microphone not found" | Wrong/camera-blocked device — pick correct mic via address-bar icon |
| Mic allowed but silent | Website mic indicator should show 🔴 — reload, or restart browser |
| Not working after browser update | Reset the site's mic permission → re-Allow → reload |
| Incognito/private window | Allow mic permission again — private mode stores nothing |
| Ad-blocker / privacy extension blocking | Pause extension → reload → allow |
| Multiple microphones | Select the correct one in browser mic settings |
| iPhone + Telugu | Apple limitation — use Type box (see above) |

---

## ✅ VoiceToEnglish quick steps

1. Open any live link: `manvith007.github.io/voice-to-english` · `voice-to-english-app.netlify.app` · `voice-to-english.vercel.app`
2. First time → allow microphone (see your device above)
3. Select your language → tap 🎙️ → speak → get English text
4. No mic on your device? **Type/paste** your text → tap Convert

Made by **Manvith Chowdary** 🚀