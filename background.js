'use strict';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({enabled: true});
  chrome.storage.local.set({savedTab: 'actions-tab'});
  chrome.storage.local.set({prevWindowId: -1});
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  chrome.storage.local.get('prevWindowId', (data) => {
    let prevWindowId = data.prevWindowId;
    if (prevWindowId === -1) prevWindowId = windowId;
    if (windowId !== -1 && windowId != prevWindowId) {
      prevWindowId = windowId;
      chrome.storage.local.set({savedTab: 'actions-tab'});
    }
    chrome.storage.local.set({prevWindowId: prevWindowId});
  });
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
            }
          }
        });
      }
    });
  }
});
