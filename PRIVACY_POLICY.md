# Privacy Policy for Chrome Health Check Extension

**Effective Date:** December 13, 2024

This Privacy Policy describes how your information is collected, used, and shared when you use the Chrome Health Check Extension (the "Extension").

---

## **Information We Collect**

1. **Data You Provide**
    - **URLs for Monitoring:** URLs you add for monitoring are stored locally in your browser's `chrome.storage.sync`. This is necessary for the extension to function and sync data across your devices.
    - **Webhook Configuration:** If you set up a webhook, the URL is also stored in `chrome.storage.sync` to send notifications about the monitored URLs' status.

2. **No Automatic Data Collection**
    - The Extension does not collect or send any personal information, browsing history, or user activity logs to external servers.
    - All data processed by the Extension stays on your local device unless you explicitly configure a webhook to send status updates.

---

## **How We Use Your Information**

- **Monitoring URL Health:** The URLs you add are used to check their availability and display their status in the Extension.
- **Webhook Notifications:** The webhook settings you provide are used to notify you of changes in the monitored URLs' status (e.g., when a URL becomes unreachable).

---

## **How Your Data is Shared**

- The Extension **does not share your data with any third parties**.
- Webhook notifications are sent only to the endpoint you configure in the Extension.

---

## **Data Security**

We take the following measures to ensure your data is secure:
- All data is stored locally in your browser using `chrome.storage.sync`, a secure API provided by Chrome.
- The Extension does not transmit your data to any external servers unless explicitly configured by you through a webhook.

**Recommendations for Users:**
- Avoid entering sensitive information or credentials in monitored URLs or webhook configurations.
- Use secure webhook URLs to minimize the risk of unauthorized access.

---

## **Changes to this Privacy Policy**

We may update this Privacy Policy periodically to reflect changes in the Extension’s functionality, legal requirements, or other operational needs. All updates will be posted in the official GitHub repository: [GitHub Repository](https://github.com/aykutarici/health-check-extension).

---

## **Contact Us**

If you have any questions about this Privacy Policy or the Extension, please reach out to us:  
📧 **aykutarici@gmail.com**

---

This Privacy Policy is also available in the official GitHub repository: [Privacy Policy on GitHub](https://github.com/aykutarici/health-check-extension/blob/main/PRIVACY_POLICY.md).
