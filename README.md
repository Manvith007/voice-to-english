# VoiceToEnglish 🎙️

Speak in **any language** → Get it in **English letters** instantly.

A mobile-first web app that uses your browser's speech recognition to capture your voice in your native language, then transliterates it to English script — perfect for messaging in WhatsApp, Telegram, and more.

![VoiceToEnglish](https://voice-to-english-app.netlify.app/)

## ✨ Features

- 🎙️ **Voice input** — tap the mic and speak naturally, no typing
- 🌍 **50+ languages** — Telugu, Hindi, Tamil, Kannada, Malayalam, Chinese, Japanese, Arabic, and more
- 🔤 **Transliteration (not translation)** — converts native script to English letters: `చెప్పు మావ ఏంటి సంగతి` → `cheppu maava enti sangathi`
- 📋 **One-tap copy** — ready to paste into any chat app
- 🕘 **Recent messages** — auto-saves your last 50 conversions locally
- 🔒 **100% private** — everything runs in your browser, nothing is uploaded

## 🚀 Try it live

| Platform | URL |
|---|---|
| **GitHub Pages** | https://manvith007.github.io/voice-to-english/ |
| **Netlify** | https://voice-to-english-app.netlify.app |
| **Vercel** | https://voice-to-english.vercel.app |
| **Local** | `python -m http.server 8080` |

Works best in **Google Chrome** or **Microsoft Edge** (browser speech recognition).

## 🛠️ How it works

1. Select your language
2. Tap the mic & speak
3. Get English text instantly
4. Copy & paste anywhere

The transliteration pipeline tries, in order:

1. **Google Translate API** romanization (`dt=rm`)
2. **Aksharamukha API** (dedicated Indic transliteration service)
3. **Built-in offline character mapping** (Telugu, Hindi, Kannada, Tamil, Malayalam fallback)

## 🎙️ Microphone not working?

Check the full device-by-device permissions guide → [**MIC-PERMISSIONS.md**](MIC-PERMISSIONS.md)

## 📁 Project structure

```
├── index.html   # UI
├── styles.css   # Dark theme styling
└── app.js       # Speech recognition + transliteration logic
```

## 📝 License

Free to use. Built with ❤️ by Manvith Chowdary.