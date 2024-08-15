chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const url = new URL(tab.url);
        const domain = url.hostname;

        chrome.storage.sync.get(['extensions'], (items) => {
            const extensions = items.extensions || [];

            extensions.forEach(({ extensionId, domains }) => {
                if (domains.includes(domain)) {
                    // Disable extension only on blacklisted domains
                    chrome.management.get(extensionId, (extensionInfo) => {
                        if (chrome.runtime.lastError) {
                            console.error(`Error getting extension: ${chrome.runtime.lastError}`);
                            return;
                        }

                        if (extensionInfo.enabled) {
                            chrome.management.setEnabled(extensionId, false, () => {
                                if (chrome.runtime.lastError) {
                                    console.error(`Error disabling extension: ${chrome.runtime.lastError}`);
                                    return;
                                }
                                console.log(`Disabled extension ${extensionId} on ${domain}`);
                            });
                        }
                    });
                } else {
                    // Enable extension on non-blacklisted domains
                    chrome.management.get(extensionId, (extensionInfo) => {
                        if (chrome.runtime.lastError) {
                            console.error(`Error getting extension: ${chrome.runtime.lastError}`);
                            return;
                        }

                        if (!extensionInfo.enabled) {
                            chrome.management.setEnabled(extensionId, true, () => {
                                if (chrome.runtime.lastError) {
                                    console.error(`Error enabling extension: ${chrome.runtime.lastError}`);
                                    return;
                                }
                                console.log(`Enabled extension ${extensionId} on ${domain}`);
                            });
                        }
                    });
                }
            });
        });
    }
});
