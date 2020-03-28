'use strict';

const btnColors = {
  active: '#0377fb',
  inactive: '#929292'
};

let tabBar = document.getElementsByClassName('tab-bar')[0];
tabBar.addEventListener('click', (event) => {
  let tabContents = document.getElementsByClassName('tab-content');
  for (let i = 0; i < tabContents.length; ++i) {
    tabContents[i].style.display = 'none';
  }
  let tabButtons = document.getElementsByClassName('tab-button');
  for (let i = 0; i < tabButtons.length; ++i) {
    tabButtons[i].className= tabButtons[i].className.replace(' red', '');
  }

  let activeTab = event.target;
  activeTab.className += ' red';
  switch(activeTab.id) {
    case 'currwin-tab':
      let currwinPage = document.getElementById('currwin-page');
      currwinPage.style.display = 'block';
      break;
    case 'allwins-tab':
      let allwinsPage = document.getElementById('allwins-page');
      allwinsPage.style.display = 'block';
      break;
    default:
      let actionsPage = document.getElementById('actions-page');
      actionsPage.style.display = 'block';
  }
});

let toggleBtn = document.getElementById('toggle-button');
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
          '16': 'images/tab_active16.png',
          '32': 'images/tab_active32.png',
          '48': 'images/tab_active48.png',
          '128': 'images/tab_active128.png'
        }
      });
    } else {
      toggleBtn.style.backgroundColor = btnColors.inactive;
      chrome.browserAction.setIcon({
        path: {
          '16': 'images/tab_inactive16.png',
          '32': 'images/tab_inactive32.png',
          '48': 'images/tab_inactive48.png',
          '128': 'images/tab_inactive128.png',
        }
      });
    }
    chrome.storage.local.set({enabled: enabled});
  });
});

let mergeBtn = document.getElementById('merge-button');
mergeBtn.addEventListener('click', () => {
    chrome.windows.getCurrent((window) => {
      let currWindow = window.id;
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.move(tab.id, {windowId: currWindow, index: -1});
        });
      });
    });
});

let sortBtn = document.getElementById('sort-button');
sortBtn.addEventListener('click', () => {
  chrome.tabs.query({currentWindow: true}, (tabs) => {
    let domains = [];
    tabs.forEach((tab) => {
      const url = new URL(tab.url);
      const urlItems = url.hostname.split('.');
      const itemsLen = urlItems.length;

      const info = {
        domain: '',
        subdomain: '',
        id: tab.id
      };

      // e.g. domain.com
      if (itemsLen <= 2) {
        info.domain = urlItems[0];
      } else {
        // e.g. sub.sub.domain.com
        if (urlItems.some(isNaN)) {
          info.domain = urlItems[itemsLen-2];
          info.subdomain = urlItems.slice(0, itemsLen-2).join('.');
        // e.g. 192.168.0.1
        } else {
          info.domain = url.hostname;
        }
      }
      domains.push(info);
    });

    domains.sort((a, b) => {
      if (a.domain === b.domain) {
        if (a.subdomain === b.subdomain) return 0;
        return a.subdomain < b.subdomain ? -1 : 1;
      }
      return a.domain < b.domain ? -1 : 1;
    })

    for (let i = 0; i < domains.length; ++i) {
      chrome.tabs.move(domains[i].id, {index: i});      
    }
  })
});
