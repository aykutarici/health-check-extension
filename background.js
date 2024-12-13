chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkUrl") {
        (async () => {
            try {
                let url = message.url;
                if (!/^https?:\/\//i.test(url)) {
                    url = "https://" + url;
                }

                const response = await fetch(url, { mode: "cors" });
                if (response && response.ok) {
                    const { lastSuccessTimes } = await chrome.storage.sync.get({ lastSuccessTimes: {} });
                    lastSuccessTimes[message.url] = Date.now();
                    await chrome.storage.sync.set({ lastSuccessTimes });
                    sendResponse({ isHealthy: true });
                    chrome.runtime.sendMessage({
                        action: "updateUrlStatus",
                        url: message.url,
                        isHealthy: true,
                    });
                } else {
                    sendResponse({
                        isHealthy: false,
                        error: response ? `HTTP Status: ${response.status}` : "CORS veya ağ hatası"
                    });

                    chrome.runtime.sendMessage({
                        action: "updateUrlStatus",
                        url: message.url,
                        isHealthy: false,
                        error: `HTTP Status: ${response.status}`,
                    });

                }
            } catch (e) {
                sendResponse({
                    isHealthy: false,
                    error: `Fetch Hatası: ${e.message || "Bilinmeyen hata"}`
                });
                chrome.runtime.sendMessage({
                    action: "updateUrlStatus",
                    url: message.url,
                    isHealthy: false,
                    error: `Fetch Hatası: ${e.message || "Bilinmeyen hata"}`,
                });
            }
        })();

        return true;
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
