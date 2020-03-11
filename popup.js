'use strict';

const btnColors = {
  active: '#0377fb',
  inactive: '#929292'
};

chrome.storage.local.get('enabled', (data) => {
  let enabled = data;
  if (enabled) {
    toggleBtn.style.backgroundColor = btnColors.active;
  } else {
    toggleBtn.style.backgroundColor = btnColors.inactive;
  }
});

let toggleBtn = document.getElementById('toggleBtn');
toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get('enabled', (data) => {
    let enabled = !data.enabled;
    if (enabled) {
      toggleBtn.style.backgroundColor = btnColors.active;
    } else {
      toggleBtn.style.backgroundColor = btnColors.inactive;
    }
    chrome.storage.local.set({enabled: enabled});
  });
});