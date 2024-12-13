chrome.runtime.onInstalled.addListener(() => {
    // Dakikada bir alarm kur
    chrome.alarms.create("healthCheckAlarm", { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "healthCheckAlarm") {
        const { urls } = await chrome.storage.sync.get({ urls: [] });
        if (!urls || urls.length === 0) return;

        urls.forEach((url) => {
            chrome.runtime.sendMessage({ action: "checkUrl", url });
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkUrl") {
        console.log("Kontrol edilen URL:", message.url);

        // Fetch işlemini bir Promise içinde ele alıyoruz
        (async () => {
            try {
                const response = await fetch(message.url, { mode: "cors" });
                console.log("HTTP Durumu:", response.status);

                // Yanıt durumu kodunu kontrol et
                if (response.status === 200) {
                    sendResponse({ isHealthy: true });
                } else {
                    sendResponse({
                        isHealthy: false,
                        error: `HTTP Status: ${response.status} ${response.statusText}`
                    });
                }
            } catch (e) {
                sendResponse({
                    isHealthy: false,
                    error: `Fetch Hatası: ${e.message}`
                });
            }
        })();

        return true; // Asenkron işlemler için gerekli
    }

    if (message.action === "showAlert") {
        chrome.storage.sync.get({ alertEnabled: true }, (data) => {
            if (data.alertEnabled) {
                alert(`Hata Detayı: ${message.error}`);
            }
        });

        chrome.windows.create({
            url: "data:text/html;charset=utf-8," + encodeURIComponent(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Health Check Uyarı</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    margin: 0;
                    background-color: #f8d7da;
                    color: #721c24;
                    text-align: center;
                  }
                  .content {
                    border: 1px solid #f5c6cb;
                    border-radius: 5px;
                    padding: 20px;
                    background-color: #f8d7da;
                  }
                </style>
              </head>
              <body>
                <div class="content">
                  <h1>Hata!</h1>
                  <p>${message.error}</p>
                </div>
              </body>
              </html>
            `),
            type: "popup",
            height: 400,
            width: 600
        });
        return true;
    }
});
