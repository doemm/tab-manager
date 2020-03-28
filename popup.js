'use strict';

const colorMap = {
  blue: '#0377fb',
  grey: '#929292',
  red:  '#f44336'
};

chrome.storage.local.get('savedTab', (data) => {
  let savedTab = data.savedTab;
  if (savedTab !== 'actions-tab') {
    let tabButton = document.querySelector('#'+savedTab);
    tabButton.click();
  }
});

let tabBar = document.querySelector('.tab-bar');
tabBar.addEventListener('click', (event) => {
  let activeTab = event.target;

  let tabContents = document.querySelectorAll('.tab-content');
  for (let i = 0; i < tabContents.length; ++i) {
    if (tabContents[i].id !== activeTab.dataset.page) {
      tabContents[i].style.display = 'none';
    }
  }
  let tabButtons = document.querySelectorAll('.tab-button');
  for (let i = 0; i < tabButtons.length; ++i) {
    if (tabButtons[i].id !== activeTab.id) {
      tabButtons[i].style.background = colorMap.grey;
    }
  }

  activeTab.style.background = colorMap.red;
  switch(activeTab.id) {
    case 'currwin-tab':
      loadCurrwinPage();
      let currwinPage = document.querySelector('#currwin-page');
      currwinPage.style.display = 'block';
      break;
    case 'allwins-tab':
      let allwinsPage = document.querySelector('#allwins-page');
      allwinsPage.style.display = 'block';
      break;
    default:
      let actionsPage = document.querySelector('#actions-page');
      actionsPage.style.display = 'block';
  }
  chrome.storage.local.set({savedTab: activeTab.id});
});

let toggleBtn = document.querySelector('#toggle-button');
chrome.storage.local.get('enabled', (data) => {
  let enabled = data.enabled;
  if (enabled) {
    toggleBtn.style.background = colorMap.blue;
  } else {
    toggleBtn.style.background = colorMap.grey;
  }
});
toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get('enabled', (data) => {
    let enabled = !data.enabled;
    if (enabled) {
      toggleBtn.style.background = colorMap.blue;
      chrome.browserAction.setIcon({
        path: {
          '16': 'images/tab_active16.png',
          '32': 'images/tab_active32.png',
          '48': 'images/tab_active48.png',
          '128': 'images/tab_active128.png'
        }
      });
    } else {
      toggleBtn.style.background = colorMap.grey;
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

let mergeBtn = document.querySelector('#merge-button');
mergeBtn.addEventListener('click', () => {
    chrome.windows.getCurrent((window) => {
      let currWindow = window.id;
      chrome.tabs.query({}, (tabs) => {
        for (let tab of tabs) {
          chrome.tabs.move(tab.id, {windowId: currWindow, index: -1});
        }
      });
    });
});

let sortBtn = document.querySelector('#sort-button');
sortBtn.addEventListener('click', () => {
  chrome.tabs.query({currentWindow: true}, (tabs) => {
    let domains = [];
    for (let tab of tabs) {
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
    }

    domains.sort((a, b) => {
      if (a.domain === b.domain) {
        if (a.subdomain === b.subdomain) return 0;
        return a.subdomain < b.subdomain ? -1 : 1;
      }
      return a.domain < b.domain ? -1 : 1;
    });

    for (let i = 0; i < domains.length; ++i) {
      chrome.tabs.move(domains[i].id, {index: i});      
    }
  });
});

function loadCurrwinPage() {
  let currwinPage = document.querySelector('#currwin-page');
  currwinPage.innerHTML = '';
  chrome.tabs.query({currentWindow: true}, (tabs) => {
    let ulElement = document.createElement('ul');
    ulElement.className = 'site-list';
    for (let tab of tabs) {
      let liElement = document.createElement('li');
      liElement.className = 'site-item';
      liElement.dataset.tabId = tab.id;
      liElement.innerHTML = '<img class="site-icon" ' +
        'src="' + tab.favIconUrl + '">' + tab.title;
      ulElement.appendChild(liElement);
    }
    currwinPage.appendChild(ulElement);
  });
}

let currwinPage = document.querySelector('#currwin-page');
currwinPage.addEventListener('click', (event) => {
  const siteItem = event.target;
  const tabId = siteItem.dataset.tabId;
  chrome.tabs.update(parseInt(tabId), {active: true});
});
