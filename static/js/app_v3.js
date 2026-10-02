/* =========================================================
CREEPY²⁷ INTERNET HUB
Main JavaScript
========================================================= */

/* ---------------- HELPERS ---------------- */

async function postJSON(url, data) {

const response = await fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
});

const result = await response.json();

if (!response.ok) {
    throw new Error(result.error || "Request failed.");
}

return result;

}

function showNotice(message) {
alert(message);
}

function escapeHTML(value) {

return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

function escapeAttribute(value) {

return escapeHTML(value)
    .replaceAll("`", "&#096;");

}

/* ---------------- MOBILE MENU ---------------- */

const menuBtn =
document.getElementById("menuBtn");

const mainNav =
document.getElementById("mainNav");

if (menuBtn && mainNav) {

menuBtn.addEventListener(
    "click",
    () => {
        mainNav.classList.toggle("open");
    }
);

}

/* ---------------- SEARCH ---------------- */

const heroSearch =
document.getElementById("heroSearch");

const heroSearchBtn =
document.getElementById("heroSearchBtn");

const searchInput =
document.getElementById("searchInput");

const searchBtn =
document.getElementById("searchBtn");

const searchResult =
document.getElementById("searchResult");

async function performSearch(query) {

if (!searchResult) {
    return;
}

query = query.trim();

if (!query) {

    searchResult.textContent =
        "Enter something to search.";

    return;
}

searchResult.textContent =
    "Opening search...";

try {

    const data = await postJSON(
        "/api/search",
        {
            query: query
        }
    );

    if (data.ok) {

        searchResult.innerHTML = `
            <strong>Search:</strong>
            ${escapeHTML(data.query)}
            <br><br>

            <button
                class="primary-btn"
                id="openSearchBtn"
            >
                🔎 Open Search Results
            </button>
        `;

        const openSearchBtn =
            document.getElementById(
                "openSearchBtn"
            );

        if (openSearchBtn) {

            openSearchBtn.addEventListener(
                "click",
                () => {

                    window.open(
                        data.search_url,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }
            );

        }

    } else {

        searchResult.textContent =
            data.error || "Search failed.";

    }

} catch (error) {

    console.error("Search error:", error);

    searchResult.textContent =
        error.message ||
        "Could not connect to the server.";

}

}

if (heroSearchBtn && heroSearch) {

heroSearchBtn.addEventListener(
    "click",
    () => {

        const query =
            heroSearch.value.trim();

        if (searchInput) {
            searchInput.value = query;
        }

        const searchSection =
            document.getElementById("search");

        if (searchSection) {

            searchSection.scrollIntoView({
                behavior: "smooth"
            });

        }

        performSearch(query);

    }
);

}

if (searchBtn && searchInput) {

searchBtn.addEventListener(
    "click",
    () => {

        performSearch(
            searchInput.value
        );

    }
);

}

if (searchInput) {

searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            performSearch(
                searchInput.value
            );

        }

    }
);

}

/* =========================================================
AI ASSISTANT
========================================================= */

const chatInput =
document.getElementById("chatInput");

const chatBtn =
document.getElementById("chatBtn");

const chatMessages =
document.getElementById("chatMessages");

let chatHistory = [];

function addMessage(type, title, text) {

if (!chatMessages) {
    return;
}

const message =
    document.createElement("div");

message.className =
    `message ${type}`;

message.innerHTML = `
    <strong>${escapeHTML(title)}</strong>
    <p>${escapeHTML(text)}</p>
`;

chatMessages.appendChild(message);

chatMessages.scrollTop =
    chatMessages.scrollHeight;

}

async function sendChat() {

if (!chatInput) {
    return;
}

const message =
    chatInput.value.trim();

if (!message) {
    return;
}

addMessage(
    "user",
    "YOU",
    message
);

chatInput.value = "";

try {

    const data = await postJSON(
    "/api/chat",
    {
        message: message,
        history: chatHistory
    }
);

    /*
     * IMPORTANT:
     * Flask returns the Gemini response
     * using the "reply" property.
     */

    addMessage(
        "bot",
        "CREEPY²⁷ AI",
        data.reply ||
        data.error ||
        "No response."
    );

chatHistory.push({
    role: "user",
    text: message
});

chatHistory.push({
    role: "model",
    text: data.reply
});

} catch (error) {

    console.error(
        "AI chat error:",
        error
    );

    addMessage(
        "bot",
        "CREEPY²⁷ AI",
        error.message ||
        "Server connection failed."
    );

}

}

if (chatBtn) {

chatBtn.addEventListener(
    "click",
    sendChat
);

}

if (chatInput) {

chatInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            sendChat();

        }

    }
);

}

/* ---------------- URL SECURITY ---------------- */

const urlInput =
document.getElementById("urlInput");

const checkUrlBtn =
document.getElementById("checkUrlBtn");

const urlResult =
document.getElementById("urlResult");

async function checkURL() {

if (!urlInput || !urlResult) {
    return;
}

const url =
    urlInput.value.trim();

if (!url) {

    urlResult.textContent =
        "Enter a URL.";

    return;
}

urlResult.textContent =
    "Inspecting URL...";

try {

    const data = await postJSON(
        "/api/check-url",
        {
            url: url
        }
    );

    if (!data.ok) {

        urlResult.textContent =
            data.error ||
            "Unable to inspect URL.";

        return;
    }

    urlResult.innerHTML = `
    <strong>Security Assessment</strong>
    <br><br>
    <strong>Risk:</strong> ${data.risk || "Unknown"}
    <br>
    <strong>Hostname:</strong> ${data.hostname || "Unknown"}
    <br>
    <strong>Protocol:</strong> ${data.scheme || "Unknown"}
    <br>
    <strong>HTTPS:</strong> ${data.https ? "Yes" : "No"}
    <br>
    <strong>Port:</strong> ${data.port || "Default"}
    <br>
    <strong>Path:</strong> ${data.path || "/"}
    <br><br>
    <strong>Warnings:</strong>
    ${
        data.warnings && data.warnings.length
            ? data.warnings.join("<br>")
            : "None detected by the basic checks."
    }
    <br><br>
    <small>${data.note || ""}</small>
`;

} catch (error) {

    console.error(
        "URL check error:",
        error
    );

    urlResult.textContent =
        error.message ||
        "Could not connect to server.";

}

}

if (checkUrlBtn) {

checkUrlBtn.addEventListener(
    "click",
    checkURL
);

}

/* ---------------- JSON FORMATTER ---------------- */

const jsonInput =
document.getElementById("jsonInput");

const jsonOutput =
document.getElementById("jsonOutput");

const formatJsonBtn =
document.getElementById("formatJsonBtn");

const minifyJsonBtn =
document.getElementById("minifyJsonBtn");

const clearJsonBtn =
document.getElementById("clearJsonBtn");

function processJSON(minify = false) {

    if (!jsonInput || !jsonOutput) {
        return;
    }

    const input =
        jsonInput.value.trim();

    if (!input) {

        jsonOutput.textContent =
            "Enter JSON to process.";

        return;
    }

    try {

        const parsed =
            JSON.parse(input);

        jsonOutput.value =
            minify
                ? JSON.stringify(parsed)
                : JSON.stringify(
                    parsed,
                    null,
                    2
                );

    } catch (error) {

        jsonOutput.value =
            "Invalid JSON.\n\n" +
            error.message;

    }
}

if (formatJsonBtn) {

    formatJsonBtn.addEventListener(
        "click",
        () => processJSON(false)
    );

}

if (minifyJsonBtn) {

    minifyJsonBtn.addEventListener(
        "click",
        () => processJSON(true)
    );

}

if (clearJsonBtn) {

    clearJsonBtn.addEventListener(
        "click",
        () => {

            if (jsonInput) {
                jsonOutput.textContent = "";
            }

            if (jsonOutput) {
                jsonOutput.textContent = "";
            }

        }
    );

}

/* ---------------- TEXT ENCODER ---------------- */

const textInput =
document.getElementById("textInput");

const textOutput =
document.getElementById("textOutput");

const encodeTextBtn =
document.getElementById("encodeTextBtn");

const decodeTextBtn =
document.getElementById("decodeTextBtn");

const urlEncodeBtn =
document.getElementById("urlEncodeBtn");

const urlDecodeBtn =
document.getElementById("urlDecodeBtn");

const clearTextBtn =
document.getElementById("clearTextBtn");

function setTextOutput(text) {

    if (textOutput) {
        textOutput.value = text;
    }

}

/* BASE64 ENCODE */

if (encodeTextBtn) {

    encodeTextBtn.addEventListener(
        "click",
        () => {

            if (!textInput || !textInput.value) {
                setTextOutput(
                    "Enter text to encode."
                );
                return;
            }

            try {

                const encoded =
                    btoa(
                        unescape(
                            encodeURIComponent(
                                textInput.value
                            )
                        )
                    );

                setTextOutput(encoded);

            } catch {

                setTextOutput(
                    "Unable to encode text."
                );

            }

        }
    );

}

/* BASE64 DECODE */

if (decodeTextBtn) {

    decodeTextBtn.addEventListener(
        "click",
        () => {

            if (!textInput || !textInput.value) {
                setTextOutput(
                    "Enter Base64 text to decode."
                );
                return;
            }

            try {

                const decoded =
                    decodeURIComponent(
                        escape(
                            atob(
                                textInput.value
                            )
                        )
                    );

                setTextOutput(decoded);

            } catch {

                setTextOutput(
                    "Invalid Base64 text."
                );

            }

        }
    );

}

/* URL ENCODE */

if (urlEncodeBtn) {

    urlEncodeBtn.addEventListener(
        "click",
        () => {

            if (!textInput || !textInput.value) {
                setTextOutput(
                    "Enter text to URL encode."
                );
                return;
            }

            try {

                setTextOutput(
                    encodeURIComponent(
                        textInput.value
                    )
                );

            } catch {

                setTextOutput(
                    "Unable to URL encode text."
                );

            }

        }
    );

}

/* URL DECODE */

if (urlDecodeBtn) {

    urlDecodeBtn.addEventListener(
        "click",
        () => {

            if (!textInput || !textInput.value) {
                setTextOutput(
                    "Enter URL-encoded text to decode."
                );
                return;
            }

            try {

                setTextOutput(
                    decodeURIComponent(
                        textInput.value
                    )
                );

            } catch {

                setTextOutput(
                    "Invalid URL-encoded text."
                );

            }

        }
    );

}

/* CLEAR */

if (clearTextBtn) {

    clearTextBtn.addEventListener(
        "click",
        () => {

            if (textInput) {
                textInput.value = "";
            }

            if (textOutput) {
                textOutput.value = "";
            }

        }
    );

}

/* ---------------- PASSWORD STRENGTH ---------------- */

const passwordInput =
    document.getElementById("passwordInput");

const strengthFill =
    document.getElementById("strengthFill");

const strengthText =
    document.getElementById("strengthText");

const passwordTips =
    document.getElementById("passwordTips");

const hashPasswordBtn =
    document.getElementById("hashPasswordBtn");

const clearPasswordBtn =
    document.getElementById("clearPasswordBtn");

const passwordHash =
    document.getElementById("passwordHash");


/* CHECK PASSWORD STRENGTH */

if (
    passwordInput &&
    strengthFill &&
    strengthText
) {

    passwordInput.addEventListener(
        "input",
        () => {

            const password =
                passwordInput.value;

            let score = 0;
            const tips = [];

            if (password.length >= 12) {
                score++;
            } else {
                tips.push(
                    "Use at least 12 characters."
                );
            }

            if (/[A-Z]/.test(password)) {
                score++;
            } else {
                tips.push(
                    "Add uppercase letters."
                );
            }

            if (/[a-z]/.test(password)) {
                score++;
            } else {
                tips.push(
                    "Add lowercase letters."
                );
            }

            if (/[0-9]/.test(password)) {
                score++;
            } else {
                tips.push(
                    "Add numbers."
                );
            }

            if (/[^A-Za-z0-9]/.test(password)) {
                score++;
            } else {
                tips.push(
                    "Add special characters."
                );
            }

            if (password.length === 0) {

                strengthFill.style.width =
                    "0%";

                strengthText.textContent =
                    "Strength: —";

                if (passwordTips) {
                    passwordTips.textContent =
                        "Enter a password to see improvement tips.";
                }

                return;
            }

            const width =
                score * 20;

            strengthFill.style.width =
                `${width}%`;

            const labels = [
                "Very weak",
                "Weak",
                "Fair",
                "Good",
                "Strong",
                "Very strong"
            ];

            strengthText.textContent =
                `Strength: ${labels[score]}`;

            if (passwordTips) {

                if (tips.length === 0) {

                    passwordTips.textContent =
                        "Excellent! Your password meets all the basic checks.";

                } else {

                    passwordTips.textContent =
                        "Improve it: " + tips.join(" ");
                }

            }

        }
    );

}


/* SHA-256 HASH */

if (hashPasswordBtn) {

    hashPasswordBtn.addEventListener(
        "click",
        async () => {

            if (
                !passwordInput ||
                !passwordInput.value
            ) {

                if (passwordHash) {
                    passwordHash.value =
                        "Enter a password first.";
                }

                return;
            }

            try {

                const encoder =
                    new TextEncoder();

                const data =
                    encoder.encode(
                        passwordInput.value
                    );

                const hashBuffer =
                    await crypto.subtle.digest(
                        "SHA-256",
                        data
                    );

                const hashArray =
                    Array.from(
                        new Uint8Array(
                            hashBuffer
                        )
                    );

                const hash =
                    hashArray
                        .map(
                            byte =>
                                byte
                                    .toString(16)
                                    .padStart(2, "0")
                        )
                        .join("");

                if (passwordHash) {
                    passwordHash.value =
                        hash;
                }

            } catch (error) {

                console.error(
                    "Hash error:",
                    error
                );

                if (passwordHash) {
                    passwordHash.value =
                        "Unable to create hash.";
                }

            }

        }
    );

}


/* CLEAR PASSWORD TOOL */

if (clearPasswordBtn) {

    clearPasswordBtn.addEventListener(
        "click",
        () => {

            if (passwordInput) {
                passwordInput.value = "";
            }

            if (strengthFill) {
                strengthFill.style.width =
                    "0%";
            }

            if (strengthText) {
                strengthText.textContent =
                    "Strength: —";
            }

            if (passwordTips) {
                passwordTips.textContent =
                    "Enter a password to see improvement tips.";
            }

            if (passwordHash) {
                passwordHash.value = "";
            }

        }
    );

}

/* ---------------- TIMESTAMP TOOL ---------------- */

const timestampInput =
    document.getElementById("timestampInput");

const timestampOutput =
    document.getElementById("timestampOutput");

const timestampNowBtn =
    document.getElementById("timestampNowBtn");

const timestampConvertBtn =
    document.getElementById("timestampConvertBtn");

const timestampClearBtn =
    document.getElementById("timestampClearBtn");


function showTimestamp(text) {

    if (timestampOutput) {
        timestampOutput.value = text;
    }

}


/* CURRENT TIMESTAMP */

if (timestampNowBtn) {

    timestampNowBtn.addEventListener(
        "click",
        () => {

            const now =
                Math.floor(
                    Date.now() / 1000
                );

            const date =
                new Date();

            showTimestamp(
                `Unix: ${now}\n` +
                `Date: ${date.toLocaleString()}`
            );

        }
    );

}


/* CONVERT TIMESTAMP */

if (timestampConvertBtn) {

    timestampConvertBtn.addEventListener(
        "click",
        () => {

            if (
                !timestampInput ||
                !timestampInput.value.trim()
            ) {

                showTimestamp(
                    "Enter a Unix timestamp."
                );

                return;
            }

            const value =
                timestampInput.value.trim();

            const timestamp =
                Number(value);

            if (
                !Number.isFinite(timestamp) ||
                !/^-?\d+$/.test(value)
            ) {

                showTimestamp(
                    "Invalid Unix timestamp."
                );

                return;
            }

            const date =
                new Date(
                    timestamp * 1000
                );

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                showTimestamp(
                    "Invalid timestamp."
                );

                return;
            }

            showTimestamp(
                `Unix: ${timestamp}\n` +
                `Date: ${date.toLocaleString()}`
            );

        }
    );

}


/* CLEAR */

if (timestampClearBtn) {

    timestampClearBtn.addEventListener(
        "click",
        () => {

            if (timestampInput) {
                timestampInput.value = "";
            }

            if (timestampOutput) {
                timestampOutput.value = "";
            }

        }
    );

}

/* =========================================================
WORKSPACE - NOTES
========================================================= */

const noteInput =
document.getElementById("noteInput");

const addNoteBtn =
document.getElementById("addNoteBtn");

const notesList =
document.getElementById("notesList");

async function loadNotes() {

if (!notesList) {
    return;
}

try {

    const response =
        await fetch("/api/notes");

    if (!response.ok) {
        throw new Error(
            "Unable to load notes."
        );
    }

    const notes =
        await response.json();

    notesList.innerHTML = "";

    notes.forEach(note => {

        const item =
            document.createElement("div");

        item.className =
            "workspace-item";

        item.innerHTML = `
            <p>
                ${escapeHTML(note.content)}
            </p>

            <button
                type="button"
                class="delete-note-btn"
                data-id="${note.id}"
            >
                DELETE
            </button>
        `;

        const deleteBtn =
            item.querySelector(
                ".delete-note-btn"
            );

        deleteBtn.addEventListener(
            "click",
            () => deleteNote(note.id)
        );

        notesList.appendChild(item);

    });

} catch (error) {

    console.error(
        "Notes error:",
        error
    );

    notesList.textContent =
        "Unable to load notes.";

}

}

async function addNote() {

if (!noteInput) {
    return;
}

const content =
    noteInput.value.trim();

if (!content) {
    return;
}

try {

    await postJSON(
        "/api/notes",
        {
            content: content
        }
    );

    noteInput.value = "";

    await loadNotes();

} catch (error) {

    showNotice(
        error.message ||
        "Unable to save note."
    );

}

}

async function deleteNote(id) {

try {

    await fetch(
        `/api/notes/${id}`,
        {
            method: "DELETE"
        }
    );

    await loadNotes();

} catch {

    showNotice(
        "Unable to delete note."
    );

}

}

if (addNoteBtn) {

addNoteBtn.addEventListener(
    "click",
    addNote
);

}

/* =========================================================
WORKSPACE - LINKS
========================================================= */

const linkTitle =
document.getElementById("linkTitle");

const linkUrl =
document.getElementById("linkUrl");

const addLinkBtn =
document.getElementById("addLinkBtn");

const linksList =
document.getElementById("linksList");

async function loadLinks() {

if (!linksList) {
    return;
}

try {

    const response =
        await fetch("/api/links");

    if (!response.ok) {
        throw new Error(
            "Unable to load links."
        );
    }

    const links =
        await response.json();

    linksList.innerHTML = "";

    links.forEach(link => {

        const item =
            document.createElement("div");

        item.className =
            "workspace-item";

        item.innerHTML = `
            <strong>
                ${escapeHTML(link.title)}
            </strong>

            <p>
                ${escapeHTML(link.url)}
            </p>

            <a
                href="${escapeAttribute(link.url)}"
                target="_blank"
                rel="noopener noreferrer"
                class="tool-link"
            >
                OPEN →
            </a>

            <br>

            <button
                type="button"
                class="delete-link-btn"
                data-id="${link.id}"
            >
                DELETE
            </button>
        `;

        const deleteBtn =
            item.querySelector(
                ".delete-link-btn"
            );

        deleteBtn.addEventListener(
            "click",
            () => deleteLink(link.id)
        );

        linksList.appendChild(item);

    });

} catch (error) {

    console.error(
        "Links error:",
        error
    );

    linksList.textContent =
        "Unable to load links.";

}

}

async function addLink() {

if (!linkTitle || !linkUrl) {
    return;
}

const title =
    linkTitle.value.trim();

const url =
    linkUrl.value.trim();

if (!title || !url) {
    return;
}

try {

    await postJSON(
        "/api/links",
        {
            title: title,
            url: url
        }
    );

    linkTitle.value = "";
    linkUrl.value = "";

    await loadLinks();

} catch (error) {

    showNotice(
        error.message ||
        "Unable to save link."
    );

}

}

async function deleteLink(id) {

try {

    await fetch(
        `/api/links/${id}`,
        {
            method: "DELETE"
        }
    );

    await loadLinks();

} catch {

    showNotice(
        "Unable to delete link."
    );

}

}

if (addLinkBtn) {

addLinkBtn.addEventListener(
    "click",
    addLink
);

}

/* =========================================================
SETTINGS
========================================================= */

const themeToggle =
document.getElementById(
"themeToggle"
);

const motionToggle =
document.getElementById(
"motionToggle"
);

const clearSettingsBtn =
document.getElementById(
"clearSettingsBtn"
);

const savedTheme =
localStorage.getItem(
"creepy27-theme"
);

if (
savedTheme === "light" &&
themeToggle
) {

document.body.classList.add(
    "light"
);

themeToggle.checked = true;

}

if (themeToggle) {

themeToggle.addEventListener(
    "change",
    () => {

        document.body.classList.toggle(
            "light",
            themeToggle.checked
        );

        localStorage.setItem(
            "creepy27-theme",
            themeToggle.checked
                ? "light"
                : "dark"
        );

    }
);

}

if (motionToggle) {

motionToggle.addEventListener(
    "change",
    () => {

        document.body.classList.toggle(
            "no-motion",
            !motionToggle.checked
        );

    }
);

}

if (clearSettingsBtn) {

clearSettingsBtn.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "creepy27-theme"
        );

        localStorage.removeItem(
            "creepy27-motion"
        );

        location.reload();

    }
);

}

/* ---------------- START ---------------- */

loadNotes();
loadLinks();



/* ---------------- LIFETIME CALCULATOR ---------------- */

const birthDateInput =
    document.getElementById("birthDateInput");

const calculateAgeBtn =
    document.getElementById("calculateAgeBtn");

const ageOutput =
    document.getElementById("ageOutput");

const clearAgeBtn =
    document.getElementById("clearAgeBtn");


if (calculateAgeBtn) {

    calculateAgeBtn.addEventListener(
        "click",
        () => {

            if (
                !birthDateInput ||
                !birthDateInput.value
            ) {

                ageOutput.value =
                    "Select your date of birth.";

                return;
            }

            const birthDate =
                new Date(
                    birthDateInput.value + "T00:00:00"
                );

            const now = new Date();

            if (birthDate > now) {

                ageOutput.value =
                    "Date of birth cannot be in the future.";

                return;
            }

            let years =
                now.getFullYear() -
                birthDate.getFullYear();

            let months =
                now.getMonth() -
                birthDate.getMonth();

            let days =
                now.getDate() -
                birthDate.getDate();


            if (days < 0) {

                months--;

                const previousMonth =
                    new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        0
                    );

                days +=
                    previousMonth.getDate();
            }


            if (months < 0) {

                years--;

                months += 12;
            }


            const milliseconds =
                now.getTime() -
                birthDate.getTime();

            const totalDays =
                Math.floor(
                    milliseconds /
                    (1000 * 60 * 60 * 24)
                );

            const totalHours =
                Math.floor(
                    milliseconds /
                    (1000 * 60 * 60)
                );

            const totalMinutes =
                Math.floor(
                    milliseconds /
                    (1000 * 60)
                );


            ageOutput.value =
                `Age: ${years} years, ${months} months, ${days} days\n\n` +
                `Total days: ${totalDays.toLocaleString()}\n` +
                `Total hours: ${totalHours.toLocaleString()}\n` +
                `Total minutes: ${totalMinutes.toLocaleString()}`;
        }
    );

}


if (clearAgeBtn) {

    clearAgeBtn.addEventListener(
        "click",
        () => {

            if (birthDateInput) {
                birthDateInput.value = "";
            }

            if (ageOutput) {
                ageOutput.value = "";
            }

        }
    );

}


/* ---------------- URL INFORMATION TOOL ---------------- */

const urlInfoInput =
    document.getElementById("urlInfoInput");

const inspectUrlBtn =
    document.getElementById("inspectUrlBtn");

const clearUrlInfoBtn =
    document.getElementById("clearUrlInfoBtn");

const urlInfoOutput =
    document.getElementById("urlInfoOutput");


if (inspectUrlBtn) {

    inspectUrlBtn.addEventListener(
        "click",
        () => {

            if (
                !urlInfoInput ||
                !urlInfoInput.value.trim()
            ) {

                urlInfoOutput.value =
                    "Enter a URL first.";

                return;
            }

            let raw =
                urlInfoInput.value.trim();

            if (!raw.includes("://")) {
                raw = "https://" + raw;
            }

            try {

                const url =
                    new URL(raw);

                urlInfoOutput.value =
                    `Full URL: ${url.href}\n\n` +
                    `Protocol: ${url.protocol.replace(":", "")}\n` +
                    `Hostname: ${url.hostname}\n` +
                    `Port: ${url.port || "Default"}\n` +
                    `Path: ${url.pathname || "/"}\n` +
                    `Query: ${url.search || "None"}\n` +
                    `Fragment: ${url.hash || "None"}`;

            } catch {

                urlInfoOutput.value =
                    "Invalid URL. Please check the address.";

            }

        }
    );

}


if (clearUrlInfoBtn) {

    clearUrlInfoBtn.addEventListener(
        "click",
        () => {

            if (urlInfoInput) {
                urlInfoInput.value = "";
            }

            if (urlInfoOutput) {
                urlInfoOutput.value = "";
            }

        }
    );

}


/* ---------------- IP INFORMATION TOOL ---------------- */

const ipInput =
document.getElementById("ipInput");

const checkIpBtn =
document.getElementById("checkIpBtn");

const myIpBtn =
document.getElementById("myIpBtn");

const clearIpBtn =
document.getElementById("clearIpBtn");

const ipOutput =
document.getElementById("ipOutput");

async function getIPInfo(ip = "") {

if (!ipOutput) return;

ipOutput.value =
    "Looking up IP information...";

try {

    const endpoint =
        ip
            ? `/api/ip-info?ip=${encodeURIComponent(ip)}`
            : "/api/ip-info";

    const response =
        await fetch(endpoint);

    const data =
        await response.json();

    if (!response.ok || !data.ok) {

        ipOutput.value =
            data.error ||
            "Unable to retrieve IP information.";

        return;
    }

    ipOutput.value =
        `IP Address: ${data.ip || "Unknown"}\n\n` +
        `Country: ${data.country || "Unknown"}\n` +
        `Region: ${data.region || "Unknown"}\n` +
        `City: ${data.city || "Unknown"}\n` +
        `ISP: ${data.isp || "Unknown"}\n` +
        `Organization: ${data.org || "Unknown"}\n` +
        `Timezone: ${data.timezone || "Unknown"}\n\n` +
        `Device Type: ${data.device_type || "Unknown"}\n` +
        `Detection: ${data.device_detection || "Estimated"}`;
    
} catch (error) {

    console.error(
        "IP information error:",
        error
    );

    ipOutput.value =
        "Could not connect to the IP information service.";
}

}

if (checkIpBtn) {

checkIpBtn.addEventListener(
    "click",
    () => {

        const ip =
            ipInput
                ? ipInput.value.trim()
                : "";

        if (!ip) {

            ipOutput.value =
                "Enter an IP address first.";

            return;
        }

        getIPInfo(ip);

    }
);

}

if (myIpBtn) {

myIpBtn.addEventListener(
    "click",
    () => {

        if (ipInput) {
            ipInput.value = "";
        }

        getIPInfo();

    }
);

}

if (clearIpBtn) {

clearIpBtn.addEventListener(
    "click",
    () => {

        if (ipInput) {
            ipInput.value = "";
        }

        if (ipOutput) {
            ipOutput.value = "";
        }

    }
);

}


/* =========================================================
   ACCOUNT SYSTEM
   ========================================================= */

const authLoggedOut =
    document.getElementById("authLoggedOut");

const authLoggedIn =
    document.getElementById("authLoggedIn");

const registerUsername =
    document.getElementById("registerUsername");

const registerEmail =
    document.getElementById("registerEmail");

const registerPassword =
    document.getElementById("registerPassword");

const registerBtn =
    document.getElementById("registerBtn");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginBtn =
    document.getElementById("loginBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const authMessage =
    document.getElementById("authMessage");

const accountInfo =
    document.getElementById("accountInfo");


function showAuthMessage(message, success = false) {

    if (!authMessage) return;

    authMessage.textContent = message;

    authMessage.dataset.status =
        success ? "success" : "error";
}


function showLoggedInAccount(user) {

    if (authLoggedOut) {
        authLoggedOut.hidden = true;
    }

    if (authLoggedIn) {
        authLoggedIn.hidden = false;
    }

    if (accountInfo) {

        accountInfo.innerHTML = `
            <strong>Username:</strong>
            ${escapeHTML(user.username)}
            <br><br>

            <strong>Email:</strong>
            ${escapeHTML(user.email)}
            <br><br>

            <strong>Theme:</strong>
            ${escapeHTML(user.theme || "dark")}
        `;
    }

}


function showLoggedOutAccount() {

    if (authLoggedOut) {
        authLoggedOut.hidden = false;
    }

    if (authLoggedIn) {
        authLoggedIn.hidden = true;
    }

}


async function checkCurrentUser() {

    try {

        const response =
            await fetch("/api/me");

        const data =
            await response.json();

        if (
            response.ok &&
            data.ok &&
            data.logged_in &&
            data.user
        ) {

            showLoggedInAccount(data.user);

        } else {

            showLoggedOutAccount();

        }

    } catch (error) {

        console.error(
            "Account check error:",
            error
        );

        showLoggedOutAccount();

    }

}


/* ---------------- REGISTER ---------------- */

if (registerBtn) {

    registerBtn.addEventListener(
        "click",
        async () => {

            const username =
                registerUsername
                    ? registerUsername.value.trim()
                    : "";

            const email =
                registerEmail
                    ? registerEmail.value.trim()
                    : "";

            const password =
                registerPassword
                    ? registerPassword.value
                    : "";

            if (!username || !email || !password) {

                showAuthMessage(
                    "Fill in username, email and password."
                );

                return;
            }

            registerBtn.disabled = true;
            registerBtn.textContent =
                "CREATING...";

            try {

                const data =
                    await postJSON(
                        "/api/register",
                        {
                            username,
                            email,
                            password
                        }
                    );

                if (data.ok && data.user) {

                    showLoggedInAccount(
                        data.user
                    );

                    showNotice(
                        "Account created successfully."
                    );

                }

            } catch (error) {

                showAuthMessage(
                    error.message ||
                    "Could not create account."
                );

            } finally {

                registerBtn.disabled = false;
                registerBtn.textContent =
                    "CREATE ACCOUNT";

            }

        }
    );

}


/* ---------------- LOGIN ---------------- */

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        async () => {

            const email =
                loginEmail
                    ? loginEmail.value.trim()
                    : "";

            const password =
                loginPassword
                    ? loginPassword.value
                    : "";

            if (!email || !password) {

                showAuthMessage(
                    "Enter your email and password."
                );

                return;
            }

            loginBtn.disabled = true;
            loginBtn.textContent =
                "LOGGING IN...";

            try {

                const data =
                    await postJSON(
                        "/api/login",
                        {
                            email,
                            password
                        }
                    );

                if (data.ok && data.user) {

                    showLoggedInAccount(
                        data.user
                    );

                    showNotice(
                        "Login successful."
                    );

                }

            } catch (error) {

                showAuthMessage(
                    error.message ||
                    "Login failed."
                );

            } finally {

                loginBtn.disabled = false;
                loginBtn.textContent =
                    "LOGIN";

            }

        }
    );

}


/* ---------------- LOGOUT ---------------- */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                const data =
                    await postJSON(
                        "/api/logout",
                        {}
                    );

                if (data.ok) {

                    showLoggedOutAccount();

                    showNotice(
                        "You have been logged out."
                    );

                }

            } catch (error) {

                showAuthMessage(
                    error.message ||
                    "Logout failed."
                );

            }

        }
    );

}


/* ---------------- INITIAL ACCOUNT CHECK ---------------- */

checkCurrentUser();

/* =========================================================
   ACCOUNT SETTINGS
   ========================================================= */

const settingsUsername =
    document.getElementById("settingsUsername");

const settingsEmail =
    document.getElementById("settingsEmail");

const settingsTheme =
    document.getElementById("settingsTheme");

const saveAccountBtn =
    document.getElementById("saveAccountBtn");

const settingsMessage =
    document.getElementById("settingsMessage");

const currentPassword =
    document.getElementById("currentPassword");

const newPassword =
    document.getElementById("newPassword");

const changePasswordBtn =
    document.getElementById("changePasswordBtn");

const deleteAccountBtn =
    document.getElementById("deleteAccountBtn");


function showSettingsMessage(message, success = false) {

    if (!settingsMessage) return;

    settingsMessage.textContent = message;

    settingsMessage.dataset.status =
        success ? "success" : "error";
}


/* ---------------- LOAD ACCOUNT SETTINGS ---------------- */

function loadAccountSettings(user) {

    if (!user) return;

    if (settingsUsername) {
        settingsUsername.value =
            user.username || "";
    }

    if (settingsEmail) {
        settingsEmail.value =
            user.email || "";
    }

    const accountTheme =
        user.theme === "light"
            ? "light"
            : "dark";

    if (settingsTheme) {
        settingsTheme.value =
            accountTheme;
    }

    /* Apply account theme using
       the existing CREEPY²⁷ theme system */

    document.body.classList.toggle(
        "light",
        accountTheme === "light"
    );

    if (themeToggle) {
        themeToggle.checked =
            accountTheme === "light";
    }

    localStorage.setItem(
        "creepy27-theme",
        accountTheme
    );

}


/* ---------------- SAVE ACCOUNT ---------------- */

if (saveAccountBtn) {

    saveAccountBtn.addEventListener(
        "click",
        async () => {

            const username =
                settingsUsername
                    ? settingsUsername.value.trim()
                    : "";

            const email =
                settingsEmail
                    ? settingsEmail.value.trim()
                    : "";

            const theme =
                settingsTheme
                    ? settingsTheme.value
                    : "dark";

            if (!username || !email) {

                showSettingsMessage(
                    "Username and email are required."
                );

                return;
            }

            saveAccountBtn.disabled = true;

            saveAccountBtn.textContent =
                "SAVING...";

            try {

                const data =
                    await postJSON(
                        "/api/account",
                        {
                            username,
                            email,
                            theme
                        }
                    );

                if (data.ok && data.user) {

                    loadAccountSettings(
                        data.user
                    );

                    showLoggedInAccount(
                        data.user
                    );

                    showSettingsMessage(
                        "Account updated successfully.",
                        true
                    );

                    showNotice(
                        "Account settings saved."
                    );

                }

            } catch (error) {

                showSettingsMessage(
                    error.message ||
                    "Could not update account."
                );

            } finally {

                saveAccountBtn.disabled = false;

                saveAccountBtn.textContent =
                    "SAVE ACCOUNT";

            }

        }
    );

}


/* ---------------- CHANGE PASSWORD ---------------- */

if (changePasswordBtn) {

    changePasswordBtn.addEventListener(
        "click",
        async () => {

            const current =
                currentPassword
                    ? currentPassword.value
                    : "";

            const newPass =
                newPassword
                    ? newPassword.value
                    : "";

            if (!current || !newPass) {

                showSettingsMessage(
                    "Enter your current and new password."
                );

                return;
            }

            if (newPass.length < 8) {

                showSettingsMessage(
                    "New password must be at least 8 characters."
                );

                return;
            }

            changePasswordBtn.disabled = true;

            changePasswordBtn.textContent =
                "CHANGING...";

            try {

                const data =
                    await postJSON(
                        "/api/account/password",
                        {
                            current_password: current,
                            new_password: newPass
                        }
                    );

                if (data.ok) {

                    if (currentPassword) {
                        currentPassword.value = "";
                    }

                    if (newPassword) {
                        newPassword.value = "";
                    }

                    showSettingsMessage(
                        "Password changed successfully.",
                        true
                    );

                    showNotice(
                        "Password changed successfully."
                    );

                }

            } catch (error) {

                showSettingsMessage(
                    error.message ||
                    "Could not change password."
                );

            } finally {

                changePasswordBtn.disabled = false;

                changePasswordBtn.textContent =
                    "CHANGE PASSWORD";

            }

        }
    );

}


/* ---------------- DELETE ACCOUNT ---------------- */

if (deleteAccountBtn) {

    deleteAccountBtn.addEventListener(
        "click",
        async () => {

            const confirmed =
                window.confirm(
                    "Delete your CREEPY²⁷ account and all saved notes and links? This cannot be undone."
                );

            if (!confirmed) {
                return;
            }

            deleteAccountBtn.disabled = true;

            deleteAccountBtn.textContent =
                "DELETING...";

            try {

                const data =
                    await postJSON(
                        "/api/account",
                        {}
                    );

                if (data.ok) {

                    showLoggedOutAccount();

                    showNotice(
                        "Account deleted successfully."
                    );

                }

            } catch (error) {

                showSettingsMessage(
                    error.message ||
                    "Could not delete account."
                );

            } finally {

                deleteAccountBtn.disabled = false;

                deleteAccountBtn.textContent =
                    "DELETE ACCOUNT";

            }

        }
    );

}


/* ---------------- UPDATE SETTINGS AFTER LOGIN ---------------- */

const originalShowLoggedInAccount =
    showLoggedInAccount;

showLoggedInAccount = function(user) {

    originalShowLoggedInAccount(user);

    loadAccountSettings(user);

};

