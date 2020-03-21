'use strict';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({enabled: true});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.status === 'complete') {
    chrome.storage.local.get('enabled', (data) => {
      let enabled = data.enabled;
      if (enabled) {
        chrome.tabs.query({}, (tabs) => {
          for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].id !== tab.id && tabs[i].url === tab.url) {
              chrome.tabs.remove(parseInt(tabs[i].id));
              break;
            }
          }
        });
      }
    });
  }
});
