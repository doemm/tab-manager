'use strict';

const btnColors = {
  active: '#0377fb',
  inactive: '#929292'
};

let toggleBtn = document.getElementById('toggleBtn');
chrome.storage.local.get('enabled', (data) => {
  let enabled = data.enabled;
  if (enabled) {
    toggleBtn.style.backgroundColor = btnColors.active;
  } else {
    toggleBtn.style.backgroundColor = btnColors.inactive;
  }
});

toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get('enabled', (data) => {
    let enabled = !data.enabled;
    if (enabled) {
      toggleBtn.style.backgroundColor = btnColors.active;
      chrome.browserAction.setIcon({
        path: {
          '16': "images/tab_active16.png",
          '32': "images/tab_active32.png",
          '48': "images/tab_active48.png",
          '128': "images/tab_active128.png"
        }
      });
    } else {
      toggleBtn.style.backgroundColor = btnColors.inactive;
      chrome.browserAction.setIcon({
        path: {
          '16': "images/tab_inactive16.png",
          '32': "images/tab_inactive32.png",
          '48': "images/tab_inactive48.png",
          '128': "images/tab_inactive128.png",
        }
      });
    }
    chrome.storage.local.set({enabled: enabled});
  });
});
