// ==============================
// CONFIG
// ==============================
const CONFIG = {
    API_URL: "https://api.languagetool.org/v2/check",
    CACHE_TTL: 1000 * 60 * 10, // 10 minutes
    CHUNK_SIZE: 500,
};

// ==============================
// CACHE (TTL BASED)
// ==============================
const cache = new Map();

function setCache(key, value) {
    cache.set(key, {
        value,
        expiry: Date.now() + CONFIG.CACHE_TTL,
    });
}

function getCache(key) {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }

    return entry.value;
}

// ==============================
// MAIN FUNCTION
// ==============================
export async function fixGrammar(text, language = "en-US") {
    if (!text || !text.trim()) return text;

    // 1. CACHE CHECK
    const cached = getCache(text);
    if (cached) return cached;

    try {
        // 2. SPLIT LARGE TEXT
        const chunks = splitIntoChunks(text);

        let results = [];

        for (const chunk of chunks) {
            const corrected = await processChunk(chunk, language);
            results.push(corrected);
        }

        const finalText = results.join("");

        setCache(text, finalText);
        return finalText;

    } catch (err) {
        console.error("Grammar Pipeline Error:", err.message);
        return text; // fail-safe
    }
}

// ==============================
// PROCESS SINGLE CHUNK
// ==============================
async function processChunk(text, language) {
    const result = await callLanguageTool(text, language);

    if (!result.matches?.length) {
        return text;
    }

    return applyCorrections(text, result.matches);
}

// ==============================
// LANGUAGE TOOL API CALL
// ==============================
async function callLanguageTool(text, language) {
    const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ text, language }),
    });

    if (!response.ok) {
        throw new Error(`API failed: ${response.status}`);
    }

    return await response.json();
}

// ==============================
// APPLY CORRECTIONS
// ==============================
function applyCorrections(text, matches) {
    // Sort descending → prevents offset shifting bugs
    matches.sort((a, b) => b.offset - a.offset);

    let corrected = [...text];

    for (const match of matches) {
        if (!match.replacements?.length) continue;

        const replacement = chooseBestReplacement(match);

        corrected.splice(
            match.offset,
            match.length,
            ...replacement.split("")
        );
    }

    return corrected.join("");
}

// ==============================
// SMART REPLACEMENT SELECTION
// ==============================
function chooseBestReplacement(match) {
    const replacements = match.replacements;

    // Prefer shortest (usually safest correction)
    return replacements.sort((a, b) => {
        return a.value.length - b.value.length;
    })[0].value;
}

// ==============================
// SPLIT TEXT INTO CHUNKS
// ==============================
function splitIntoChunks(text, size = CONFIG.CHUNK_SIZE) {
    return text.match(new RegExp(`.{1,${size}}`, "g")) || [];
}

// ==============================
// FRONTEND DEBOUNCE (OPTIONAL)
// ==============================
export function debounceFix(callback, delay = 500) {
    let timeout;

    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback(...args), delay);
    };
}