export function timeSince(date, translations, language) {
    const t = translations[language] || {};
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - date) / 1000);
    if (elapsedSeconds < 60) return `${elapsedSeconds} sn${t.lastSuccessful || ""}`;
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    if (elapsedMinutes < 60) return `${elapsedMinutes} dk${t.lastSuccessful || ""}`;
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return `${elapsedHours} saat${t.lastSuccessful || ""}`;
    const elapsedDays = Math.floor(elapsedHours / 24);
    return `${elapsedDays} gün${t.lastSuccessful || ""}`;
}

export function translateUI(language, translations) {
    const t = translations[language] || {};
    document.querySelectorAll("[data-translate]").forEach((element) => {
        const key = element.getAttribute("data-translate");
        if (t[key]) {
            element.textContent = t[key];
        } else {
            console.warn(`Translation missing for key: "${key}" in language: "${language}"`);
        }
    });
}
