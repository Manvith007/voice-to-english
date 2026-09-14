// =====================================================
// VoiceToText — Transliteration (NOT Translation)
// Speak Telugu → Get "cheppu mawa enti sangathi"
// Speak Hindi  → Get "kya haal hai bhai"
// =====================================================

// ── Language code → human name map ──
const LANGUAGE_NAMES = {
    'te': 'Telugu', 'hi': 'Hindi', 'ta': 'Tamil', 'kn': 'Kannada',
    'ml': 'Malayalam', 'bn': 'Bengali', 'gu': 'Gujarati', 'mr': 'Marathi',
    'pa': 'Punjabi', 'ur': 'Urdu', 'or': 'Odia', 'as': 'Assamese',
    'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean', 'th': 'Thai',
    'vi': 'Vietnamese', 'id': 'Indonesian', 'ms': 'Malay', 'fil': 'Filipino',
    'my': 'Burmese', 'km': 'Khmer', 'ne': 'Nepali', 'si': 'Sinhala',
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
    'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'nl': 'Dutch',
    'pl': 'Polish', 'uk': 'Ukrainian', 'el': 'Greek', 'sv': 'Swedish',
    'da': 'Danish', 'fi': 'Finnish', 'no': 'Norwegian', 'cs': 'Czech',
    'ro': 'Romanian', 'hu': 'Hungarian', 'tr': 'Turkish',
    'ar': 'Arabic', 'he': 'Hebrew', 'fa': 'Persian',
    'sw': 'Swahili', 'am': 'Amharic', 'zu': 'Zulu', 'af': 'Afrikaans',
};

// ── Aksharamukha script name mapping ──
const AKSHARAMUKHA_SCRIPTS = {
    'te': 'Telugu', 'hi': 'Devanagari', 'ta': 'Tamil', 'kn': 'Kannada',
    'ml': 'Malayalam', 'bn': 'Bengali', 'gu': 'Gujarati', 'mr': 'Devanagari',
    'pa': 'Gurmukhi', 'ur': 'Urdu', 'or': 'Oriya', 'as': 'Bengali',
    'ne': 'Devanagari', 'si': 'Sinhala', 'my': 'Burmese', 'km': 'Khmer',
    'th': 'Thai', 'ja': 'Katakana', 'ko': 'Hangul',
    'ar': 'Arab', 'fa': 'Arab', 'he': 'Hebrew',
    'ru': 'Cyrillic', 'uk': 'Cyrillic', 'el': 'Greek',
    'am': 'Ethiopic',
};

// ── DOM Elements ──
const micBtn = document.getElementById('micBtn');
const micStatus = document.getElementById('micStatus');
const englishText = document.getElementById('englishText');
const originalText = document.getElementById('originalText');
const detectedLang = document.getElementById('detectedLang');
const languageSelect = document.getElementById('languageSelect');
const copyEnglishBtn = document.getElementById('copyEnglishBtn');
const bigCopyBtn = document.getElementById('bigCopyBtn');
const processingSpinner = document.getElementById('processingSpinner');
const englishPanel = document.getElementById('englishPanel');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const unsupportedOverlay = document.getElementById('unsupportedOverlay');

// ── State ──
let recognition = null;
let isRecording = false;
let fullTranscript = '';
let interimTranscript = '';
let translitTimeout = null;
let history = JSON.parse(localStorage.getItem('vtt_history') || '[]');

// =====================================================
// 1. Check browser support
// =====================================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    unsupportedOverlay.classList.remove('hidden');
} else {
    init();
}

// =====================================================
// 2. Initialise
// =====================================================
function init() {
    renderHistory();
    micBtn.addEventListener('click', toggleRecording);
    copyEnglishBtn.addEventListener('click', () => copyToClipboard(getEnglishContent(), copyEnglishBtn));
    bigCopyBtn.addEventListener('click', () => copyToClipboard(getEnglishContent(), bigCopyBtn, true));
    clearHistoryBtn.addEventListener('click', clearHistory);
}

// =====================================================
// 3. Speech Recognition
// =====================================================
function createRecognition() {
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = languageSelect.value;

    rec.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        micStatus.textContent = '🔴 Listening… Speak now!';
        micStatus.classList.add('recording');
        englishPanel.classList.add('active');
    };

    rec.onresult = (event) => {
        interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                fullTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        // Show original script text
        const nativeText = (fullTranscript + interimTranscript).trim();
        setOriginalText(nativeText);

        // Debounce transliteration — 600ms after user pauses
        clearTimeout(translitTimeout);
        translitTimeout = setTimeout(() => {
            if (nativeText) {
                transliterateToRoman(nativeText);
            }
        }, 600);
    };

    rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
            micStatus.textContent = 'No speech detected. Try again.';
        } else if (event.error === 'audio-capture') {
            micStatus.textContent = 'Microphone not found. Check permissions.';
        } else if (event.error === 'not-allowed') {
            micStatus.textContent = 'Mic access denied. Allow in browser settings.';
        } else {
            micStatus.textContent = `Error: ${event.error}. Try again.`;
        }
        stopRecording();
    };

    rec.onend = () => {
        if (isRecording) {
            try { rec.start(); } catch (e) { stopRecording(); }
        }
    };

    return rec;
}

function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    fullTranscript = '';
    interimTranscript = '';
    setOriginalText('');
    setEnglishText('');
    detectedLang.classList.remove('show');
    bigCopyBtn.classList.add('hidden');
    englishPanel.classList.remove('active');

    recognition = createRecognition();
    try {
        recognition.start();
    } catch (e) {
        micStatus.textContent = 'Could not start microphone. Refresh and try.';
        console.error(e);
    }
}

function stopRecording() {
    isRecording = false;
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
    micBtn.classList.remove('recording');
    micStatus.textContent = 'Tap to start speaking';
    micStatus.classList.remove('recording');

    const finalText = (fullTranscript + interimTranscript).trim();
    if (finalText) {
        transliterateToRoman(finalText);
    }
}

// =====================================================
// 4. Transliteration (the core — NOT translation!)
// =====================================================
async function transliterateToRoman(text) {
    if (!text) return;

    const langCode = languageSelect.value.split('-')[0];
    const langName = LANGUAGE_NAMES[langCode] || langCode;

    // If already English/Latin, just show it as-is
    if (langCode === 'en' || isLatinScript(text)) {
        setEnglishText(text);
        showDetectedLang(langName);
        showBigCopyBtn();
        addToHistory(langName, text, text);
        return;
    }

    // Show spinner
    processingSpinner.classList.remove('hidden');
    englishPanel.classList.add('active');

    try {
        const romanized = await getTransliteration(text, langCode);
        setEnglishText(romanized);
        showDetectedLang(langName);
        showBigCopyBtn();
        addToHistory(langName, text, romanized);
    } catch (err) {
        console.error('Transliteration error:', err);
        setEnglishText('⚠ Could not convert. Please try again.');
    } finally {
        processingSpinner.classList.add('hidden');
    }
}

/**
 * Main transliteration pipeline — tries multiple services:
 * 1. Google Translate API (romanization via dt=rm)
 * 2. Aksharamukha API (dedicated transliteration service)
 * 3. Built-in character mapping (offline fallback)
 */
async function getTransliteration(text, langCode) {

    // ── Attempt 1: Google Translate Romanization ──
    try {
        const romanized = await googleTransliterate(text, langCode);
        if (romanized && romanized.length > 0 && !isAllSameScript(text, romanized)) {
            return cleanRomanized(romanized);
        }
    } catch (e) {
        console.warn('[Google] Transliteration failed:', e.message);
    }

    // ── Attempt 2: Aksharamukha API ──
    try {
        const scriptName = AKSHARAMUKHA_SCRIPTS[langCode];
        if (scriptName) {
            const romanized = await aksharamukhaTransliterate(text, scriptName);
            if (romanized && romanized.length > 0) {
                return cleanRomanized(romanized);
            }
        }
    } catch (e) {
        console.warn('[Aksharamukha] Transliteration failed:', e.message);
    }

    // ── Attempt 3: Built-in mapping (offline) ──
    const mapped = builtinTransliterate(text, langCode);
    if (mapped !== text) {
        return mapped;
    }

    // Last resort — return original
    return text;
}

// ── Google Translate Romanization ──
async function googleTransliterate(text, langCode) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${langCode}&tl=en&dt=rm&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    // The romanization (transliteration) of the SOURCE text is what we need.
    // In the Google response, it's typically at data[0][i][3] for each segment,
    // representing the phonetic reading of the source text.
    let romanized = '';

    if (data && data[0] && Array.isArray(data[0])) {
        for (const chunk of data[0]) {
            if (Array.isArray(chunk) && chunk.length > 3 && typeof chunk[3] === 'string') {
                romanized += chunk[3] + ' ';
            }
        }
    }

    // Sometimes the romanization is in a different position in the response
    // Check data[0] last element if it has romanization
    if (!romanized.trim() && data && data[0] && Array.isArray(data[0])) {
        const lastChunk = data[0][data[0].length - 1];
        if (Array.isArray(lastChunk)) {
            for (const item of lastChunk) {
                if (typeof item === 'string' && isLatinScript(item)) {
                    romanized = item;
                    break;
                }
            }
        }
    }

    return romanized.trim();
}

// ── Aksharamukha API (dedicated transliteration service) ──
async function aksharamukhaTransliterate(text, scriptName) {
    const url = `https://aksharamukha.appspot.com/api/public?source=${encodeURIComponent(scriptName)}&target=RomanColloquial&text=${encodeURIComponent(text)}&nativize=false`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.text();
    return result.trim();
}

// ── Built-in transliteration (basic offline fallback) ──
// Covers Telugu, Hindi (Devanagari), Kannada, Tamil, Malayalam
function builtinTransliterate(text, langCode) {
    // Common Indic transliteration maps
    const maps = {
        // Telugu vowels & consonants → Roman
        'te': {
            'అ':'a','ఆ':'aa','ఇ':'i','ఈ':'ee','ఉ':'u','ఊ':'oo','ఎ':'e','ఏ':'ae',
            'ఐ':'ai','ఒ':'o','ఓ':'oe','ఔ':'au','అం':'am','అః':'aha',
            'క':'ka','ఖ':'kha','గ':'ga','ఘ':'gha','ఙ':'nga',
            'చ':'cha','ఛ':'chha','జ':'ja','ఝ':'jha','ఞ':'nya',
            'ట':'ta','ఠ':'tha','డ':'da','ఢ':'dha','ణ':'na',
            'త':'tha','థ':'thha','ద':'da','ధ':'dha','న':'na',
            'ప':'pa','ఫ':'pha','బ':'ba','భ':'bha','మ':'ma',
            'య':'ya','ర':'ra','ల':'la','వ':'va','శ':'sha','ష':'sha','స':'sa','హ':'ha',
            'ళ':'la','క్ష':'ksha','ఱ':'rra',
            // Matras (vowel signs)
            'ా':'aa','ి':'i','ీ':'ee','ు':'u','ూ':'oo',
            'ె':'e','ే':'ae','ై':'ai','ొ':'o','ో':'oe','ౌ':'au',
            'ం':'m','ః':'h','్':'',
            // Digits
            '౦':'0','౧':'1','౨':'2','౩':'3','౪':'4','౫':'5','౬':'6','౭':'7','౮':'8','౯':'9',
        },
        // Hindi / Devanagari
        'hi': {
            'अ':'a','आ':'aa','इ':'i','ई':'ee','उ':'u','ऊ':'oo','ए':'e','ऐ':'ai',
            'ओ':'o','औ':'au','अं':'am','अः':'aha','ऋ':'ri',
            'क':'ka','ख':'kha','ग':'ga','घ':'gha','ङ':'nga',
            'च':'cha','छ':'chha','ज':'ja','झ':'jha','ञ':'nya',
            'ट':'ta','ठ':'tha','ड':'da','ढ':'dha','ण':'na',
            'त':'ta','थ':'tha','द':'da','ध':'dha','न':'na',
            'प':'pa','फ':'pha','ब':'ba','भ':'bha','म':'ma',
            'य':'ya','र':'ra','ल':'la','व':'va','श':'sha','ष':'sha','स':'sa','ह':'ha',
            'क्ष':'ksha','त्र':'tra','ज्ञ':'gya',
            'ा':'aa','ि':'i','ी':'ee','ु':'u','ू':'oo',
            'े':'e','ै':'ai','ो':'o','ौ':'au',
            'ं':'n','ः':'h','्':'','ँ':'n',
            '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9',
        },
        // Kannada
        'kn': {
            'ಅ':'a','ಆ':'aa','ಇ':'i','ಈ':'ee','ಉ':'u','ಊ':'oo','ಎ':'e','ಏ':'ae',
            'ಐ':'ai','ಒ':'o','ಓ':'oe','ಔ':'au',
            'ಕ':'ka','ಖ':'kha','ಗ':'ga','ಘ':'gha','ಙ':'nga',
            'ಚ':'cha','ಛ':'chha','ಜ':'ja','ಝ':'jha','ಞ':'nya',
            'ಟ':'ta','ಠ':'tha','ಡ':'da','ಢ':'dha','ಣ':'na',
            'ತ':'tha','ಥ':'thha','ದ':'da','ಧ':'dha','ನ':'na',
            'ಪ':'pa','ಫ':'pha','ಬ':'ba','ಭ':'bha','ಮ':'ma',
            'ಯ':'ya','ರ':'ra','ಲ':'la','ವ':'va','ಶ':'sha','ಷ':'sha','ಸ':'sa','ಹ':'ha',
            'ಳ':'la',
            'ಾ':'aa','ಿ':'i','ೀ':'ee','ು':'u','ೂ':'oo',
            'ೆ':'e','ೇ':'ae','ೈ':'ai','ೊ':'o','ೋ':'oe','ೌ':'au',
            'ಂ':'m','ಃ':'h','್':'',
        },
        // Tamil
        'ta': {
            'அ':'a','ஆ':'aa','இ':'i','ஈ':'ee','உ':'u','ஊ':'oo','எ':'e','ஏ':'ae',
            'ஐ':'ai','ஒ':'o','ஓ':'oe','ஔ':'au',
            'க':'ka','ங':'nga','ச':'cha','ஞ':'nya','ட':'ta','ண':'na',
            'த':'tha','ந':'na','ப':'pa','ம':'ma',
            'ய':'ya','ர':'ra','ல':'la','வ':'va','ழ':'zha','ள':'la','ற':'ra','ன':'na',
            'ஜ':'ja','ஷ':'sha','ஸ':'sa','ஹ':'ha',
            'ா':'aa','ி':'i','ீ':'ee','ு':'u','ூ':'oo',
            'ெ':'e','ே':'ae','ை':'ai','ொ':'o','ோ':'oe','ௌ':'au',
            'ஂ':'m','ஃ':'h','்':'',
        },
        // Malayalam
        'ml': {
            'അ':'a','ആ':'aa','ഇ':'i','ഈ':'ee','ഉ':'u','ഊ':'oo','എ':'e','ഏ':'ae',
            'ഐ':'ai','ഒ':'o','ഓ':'oe','ഔ':'au',
            'ക':'ka','ഖ':'kha','ഗ':'ga','ഘ':'gha','ങ':'nga',
            'ച':'cha','ഛ':'chha','ജ':'ja','ഝ':'jha','ഞ':'nya',
            'ട':'ta','ഠ':'tha','ഡ':'da','ഢ':'dha','ണ':'na',
            'ത':'tha','ഥ':'thha','ദ':'da','ധ':'dha','ന':'na',
            'പ':'pa','ഫ':'pha','ബ':'ba','ഭ':'bha','മ':'ma',
            'യ':'ya','ര':'ra','ല':'la','വ':'va','ശ':'sha','ഷ':'sha','സ':'sa','ഹ':'ha',
            'ള':'la','ഴ':'zha','റ':'ra',
            'ാ':'aa','ി':'i','ീ':'ee','ു':'u','ൂ':'oo',
            'െ':'e','േ':'ae','ൈ':'ai','ൊ':'o','ോ':'oe','ൌ':'au',
            'ം':'m','ഃ':'h','്':'',
        },
    };

    // Also map Marathi/Nepali to Hindi map (same Devanagari script)
    maps['mr'] = maps['hi'];
    maps['ne'] = maps['hi'];

    const charMap = maps[langCode];
    if (!charMap) return text;

    let result = '';
    let i = 0;

    while (i < text.length) {
        // Try 3-char, 2-char, then 1-char match
        let matched = false;
        for (let len = 3; len >= 1; len--) {
            const substr = text.substring(i, i + len);
            if (charMap[substr] !== undefined) {
                result += charMap[substr];
                i += len;
                matched = true;
                break;
            }
        }
        if (!matched) {
            result += text[i]; // keep original (spaces, punctuation, etc.)
            i++;
        }
    }

    return result;
}

// =====================================================
// 5. Utility Functions
// =====================================================

/** Check if text is primarily Latin script */
function isLatinScript(text) {
    const latinChars = text.replace(/[\s\d\p{P}]/gu, '').match(/[\u0000-\u007F\u00C0-\u024F]/g);
    const total = text.replace(/[\s\d\p{P}]/gu, '').length;
    return total > 0 && latinChars && (latinChars.length / total) > 0.7;
}

/** Check if two texts are in the same script family */
function isAllSameScript(original, romanized) {
    return !isLatinScript(original) && !isLatinScript(romanized);
}

/** Clean up romanized output */
function cleanRomanized(text) {
    return text
        .replace(/\s+/g, ' ')           // collapse whitespace
        .replace(/\s([.,!?;:])/g, '$1')  // remove space before punctuation
        .trim()
        .toLowerCase();                  // natural messaging style
}

// =====================================================
// 6. UI Helpers
// =====================================================
function setOriginalText(text) {
    if (text) {
        originalText.textContent = text;
        originalText.classList.add('has-content');
        originalText.classList.remove('placeholder-text');
    } else {
        originalText.textContent = 'Native script text will appear here…';
        originalText.classList.remove('has-content');
        originalText.classList.add('placeholder-text');
    }
}

function setEnglishText(text) {
    if (text) {
        englishText.textContent = text;
        englishText.classList.add('has-content');
        englishText.classList.remove('placeholder-text');
    } else {
        englishText.textContent = 'Your words in English letters will appear here…';
        englishText.classList.remove('has-content');
        englishText.classList.add('placeholder-text');
    }
}

function getEnglishContent() {
    return englishText.classList.contains('has-content') ? englishText.textContent : '';
}

function showDetectedLang(langName) {
    if (langName) {
        detectedLang.textContent = langName;
        detectedLang.classList.add('show');
    }
}

function showBigCopyBtn() {
    bigCopyBtn.classList.remove('hidden');
}

async function copyToClipboard(text, btn, isBigBtn = false) {
    if (!text) {
        showToast('Nothing to copy yet!', false);
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied! Paste it in WhatsApp / Telegram 📋');

        if (isBigBtn) {
            const origHTML = btn.innerHTML;
            btn.innerHTML = '<span class="material-icons-round">check</span><span>Copied! Now paste it 🎉</span>';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.innerHTML = origHTML;
                btn.classList.remove('copied');
            }, 2000);
        } else {
            btn.classList.add('copied');
            const icon = btn.querySelector('.material-icons-round');
            const origIcon = icon.textContent;
            icon.textContent = 'check';
            setTimeout(() => {
                btn.classList.remove('copied');
                icon.textContent = origIcon;
            }, 1500);
        }
    } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Copied! 📋');
    }
}

function showToast(message, success = true) {
    toastMsg.textContent = message;
    toast.querySelector('.material-icons-round').textContent = success ? 'check_circle' : 'info';
    toast.style.color = success ? 'var(--success)' : 'var(--warning)';
    toast.style.borderColor = success
        ? 'rgba(0, 200, 151, 0.3)'
        : 'rgba(255, 165, 2, 0.3)';
    toast.classList.remove('hidden');
    toast.offsetHeight; // force reflow
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2500);
}

// =====================================================
// 7. History
// =====================================================
function addToHistory(lang, original, englishVersion) {
    const entry = {
        id: Date.now(),
        lang,
        original,
        english: englishVersion,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Skip duplicate consecutive entries
    if (history.length > 0 && history[0].english === englishVersion) return;

    history.unshift(entry);
    if (history.length > 50) history.pop();

    localStorage.setItem('vtt_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No messages yet. Start speaking!</p>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="history-meta">
                <span class="history-lang">${item.lang}</span>
                <span class="history-time">${item.time}</span>
            </div>
            <div class="history-original">${escapeHtml(item.original)}</div>
            <div class="history-english">
                <span>${escapeHtml(item.english)}</span>
                <button class="icon-btn history-copy-btn" title="Copy" onclick="copyHistoryItem(this)">
                    <span class="material-icons-round">content_copy</span>
                </button>
            </div>
        </div>
    `).join('');
}

window.copyHistoryItem = function (btn) {
    const item = btn.closest('.history-item');
    const id = parseInt(item.dataset.id);
    const entry = history.find(h => h.id === id);
    if (entry) {
        copyToClipboard(entry.english, btn);
    }
};

function clearHistory() {
    history = [];
    localStorage.removeItem('vtt_history');
    renderHistory();
    showToast('History cleared');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
