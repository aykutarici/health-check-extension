document.addEventListener("DOMContentLoaded", async () => {
    const urlInput = document.getElementById("urlInput");
    const addUrlBtn = document.getElementById("addUrlBtn");
    const webhookSwitch = document.getElementById("webhookSwitch");
    const webhookSection = document.getElementById("webhookSection");
    const webhookInput = document.getElementById("webhookInput");
    const saveWebhookBtn = document.getElementById("saveWebhookBtn");
    const urlList = document.getElementById("urlList");
    const languageSelector = document.getElementById("languageSelector");

    let { urls } = await chrome.storage.sync.get({ urls: [] });
    let { statusMap } = await chrome.storage.sync.get({ statusMap: {} });
    let { lastSuccessTimes } = await chrome.storage.sync.get({ lastSuccessTimes: {} });
    let { webhookUrl } = await chrome.storage.sync.get({ webhookUrl: "" });
    let { webhookEnabled } = await chrome.storage.sync.get({ webhookEnabled: false });
    let { language } = await chrome.storage.sync.get({ language: "tr" });

    webhookSwitch.checked = webhookEnabled;
    webhookSection.style.display = webhookEnabled ? "block" : "none";
    webhookInput.value = webhookUrl;
    languageSelector.value = language;

    const translations = {
        tr: {
            title: "Sağlık Kontrolü",
            addUrl: "URL giriniz",
            webhookPlaceholder: "Webhook URL giriniz",
            alertSwitchLabel: "Window Alert Kullan",
            webhookSwitchLabel: "Webhook ile bildirim al",
            githubLink: "GitHub",
            lastSuccessful: " önce başarılı",
            neverSuccessful: "Hiç başarılı olmadı",
        },
        en: {
            title: "Health Check",
            addUrl: "Enter URL",
            webhookPlaceholder: "Enter Webhook URL",
            alertSwitchLabel: "Use Window Alert",
            webhookSwitchLabel: "Receive notification via webhook",
            githubLink: "GitHub",
            lastSuccessful: " ago",
            neverSuccessful: "Never successful",
        },
    };

    function translateUI() {
        const t = translations[language];
        urlInput.placeholder = t.addUrl;
        webhookInput.placeholder = t.webhookPlaceholder;
        // Translate elements with data-translate attribute
        document.querySelectorAll("[data-translate]").forEach((element) => {
            const key = element.getAttribute("data-translate");
            if (t[key]) {
                element.textContent = t[key];
            }
        });

        renderUrlList();
    }

    function timeSince(date) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - date) / 1000);
        if (elapsedSeconds < 60) return `${elapsedSeconds} sn${translations[language].lastSuccessful}`;
        const elapsedMinutes = Math.floor(elapsedSeconds / 60);
        if (elapsedMinutes < 60) return `${elapsedMinutes} dk${translations[language].lastSuccessful}`;
        const elapsedHours = Math.floor(elapsedMinutes / 60);
        if (elapsedHours < 24) return `${elapsedHours} saat${translations[language].lastSuccessful}`;
        const elapsedDays = Math.floor(elapsedHours / 24);
        return `${elapsedDays} gün${translations[language].lastSuccessful}`;
    }

    function renderUrlList() {
        urlList.innerHTML = "";
        const t = translations[language];

        urls.forEach((url, index) => {
            const li = document.createElement("li");

            const statusDotDiv = document.createElement("div");
            statusDotDiv.style.alignSelf = "center";

            const statusDot = document.createElement("div");
            statusDot.className = "status-dot " + (statusMap[url] ? "green" : "red");
            statusDotDiv.appendChild(statusDot);

            const urlTextDiv = document.createElement("div");
            urlTextDiv.style.display = "flex";
            urlTextDiv.style.width = "100%";

            const urlTextDivInside = document.createElement("div");
            urlTextDivInside.style.display = "flex";
            urlTextDivInside.style.flexDirection = "column";
            urlTextDivInside.style.alignItems = "flex-start";
            urlTextDivInside.style.textAlign = "left";
            urlTextDiv.appendChild(urlTextDivInside);

            const urlText = document.createElement("div");
            urlText.textContent = url;
            urlText.style.display = "flex";

            const timeText = document.createElement("div");
            const lastTime = lastSuccessTimes[url];
            if (lastTime) {
                timeText.textContent = timeSince(lastTime);
            } else {
                timeText.textContent = t.neverSuccessful;
            }
            timeText.style.fontSize = "0.8em";
            timeText.style.color = "#555";

            urlTextDivInside.appendChild(urlText);
            urlTextDivInside.appendChild(timeText);

            const linkBtnDiv = document.createElement("div");
            const linkBtn = document.createElement("button");
            const linkBtnImg = document.createElement("img");
            linkBtnImg.src = "./assets/images/link.png";
            linkBtn.appendChild(linkBtnImg);
            linkBtn.className = "btn-link";
            linkBtn.addEventListener("click", () => {
                window.open(url, "_blank");
            });
            linkBtnDiv.appendChild(linkBtn);

            const removeBtnDiv = document.createElement("div");
            const removeBtn = document.createElement("button");
            const removeBtnImg = document.createElement("img");
            removeBtnImg.src = "./assets/images/delete.png";
            removeBtn.appendChild(removeBtnImg);
            removeBtn.className = "btn-delete";
            removeBtn.addEventListener("click", async () => {
                urls.splice(index, 1);
                delete statusMap[url];
                delete lastSuccessTimes[url];
                await chrome.storage.sync.set({ urls, statusMap, lastSuccessTimes });
                renderUrlList();
            });
            removeBtnDiv.appendChild(removeBtn);

            li.appendChild(statusDotDiv);
            li.appendChild(urlTextDiv);
            li.appendChild(linkBtnDiv);
            li.appendChild(removeBtnDiv);
            urlList.appendChild(li);
        });
    }

    languageSelector.addEventListener("change", async () => {
        language = languageSelector.value;
        await chrome.storage.sync.set({ language });
        translateUI();
    });

    webhookSwitch.addEventListener("change", async () => {
        webhookEnabled = webhookSwitch.checked;
        webhookSection.style.display = webhookEnabled ? "block" : "none";
        await chrome.storage.sync.set({ webhookEnabled });
    });

    saveWebhookBtn.addEventListener("click", async () => {
        const newWebhookUrl = webhookInput.value.trim();
        webhookUrl = newWebhookUrl;
        await chrome.storage.sync.set({ webhookUrl });
        alert(translations[language].saveWebhook + "!");
    });

    async function addUrl(newUrl) {
        if (!/^https?:\/\//i.test(newUrl)) {
            newUrl = "https://" + newUrl;
        }

        if (!urls.includes(newUrl)) {
            urls.unshift(newUrl);
            lastSuccessTimes[newUrl] = Date.now();
            statusMap[newUrl] = false;

            await chrome.storage.sync.set({ urls, lastSuccessTimes, statusMap });
            renderUrlList();

            chrome.runtime.sendMessage({ action: "checkUrl", url: newUrl }, (response) => {
                if (response && response.isHealthy) {
                    statusMap[newUrl] = true;
                    lastSuccessTimes[newUrl] = Date.now();
                }
                chrome.storage.sync.set({ statusMap, lastSuccessTimes }).then(renderUrlList);
            });
        }
    }

    urlInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const newUrl = urlInput.value.trim();
            if (newUrl) addUrl(newUrl);
            urlInput.value = "";
        }
    });

    addUrlBtn.addEventListener("click", () => {
        const newUrl = urlInput.value.trim();
        if (newUrl) addUrl(newUrl);
        urlInput.value = "";
    });

    translateUI();
});

document.addEventListener("DOMContentLoaded", async () => {
    const intervalInput = document.getElementById("intervalInput");
    const progressBar = document.getElementById("progressBar");
    const refreshButton = document.getElementById("refreshButton");

    let currentInterval = parseInt(intervalInput.value, 10) || 60;
    let progress = 0;
    let timer;

    function startTimer() {
        clearInterval(timer);
        progress = 0;
        progressBar.style.width = "0%";

        timer = setInterval(() => {
            progress += 100 / currentInterval;
            progressBar.style.width = `${progress}%`;

            if (progress >= 100) {
                progress = 0;
                progressBar.style.width = "0%";
                checkAllUrls();
            }
        }, 1000);
    }

    async function checkAllUrls() {
        const { urls } = await chrome.storage.sync.get({ urls: [] });
        urls.forEach((url) => {
            chrome.runtime.sendMessage({ action: "checkUrl", url });
        });
    }

    refreshButton.addEventListener("click", () => {
        progress = 0;
        progressBar.style.width = "0%";
        checkAllUrls();
    });

    intervalInput.addEventListener("change", () => {
        currentInterval = parseInt(intervalInput.value, 10) || 60;
        if (currentInterval < 10) currentInterval = 10;
        if (currentInterval > 300) currentInterval = 300;
        intervalInput.value = currentInterval;
        startTimer();
    });

    startTimer();
});
