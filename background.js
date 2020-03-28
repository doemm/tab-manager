'use strict';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({enabled: true});
});

chrome.tabs.onUpdated.addListener((currTabId, currChanges, currTab) => {
  if (currTab.status === 'complete') {
    chrome.storage.local.get('enabled', (data) => {
      let enabled = data.enabled;
      if (enabled) {
        chrome.tabs.query({}, (tabs) => {
          for (let tab of tabs) {
            if (tab.id !== currTab.id &&
                tab.url === currTab.url) {
              chrome.tabs.remove(parseInt(tab.id));
              break;
            }
          }
        });
      }
    });
  }
});
