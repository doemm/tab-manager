'use strict';

const colorMap = {
  blue: '#3688f4',
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

  activeTab.style.background = colorMap.blue;
  switch(activeTab.id) {
    case 'currwin-tab':
      loadCurrwinList();
      let currwinPage = document.querySelector('#currwin-page');
      currwinPage.style.display = 'block';
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

// use dragula to complete dnd effects
let drake = dragula();
function loadCurrwinList() {
  let currwinList = document.querySelector('#currwin-list-wrapper');
  currwinList.innerHTML = '';     // clear the currwin list
  chrome.tabs.query({currentWindow: true}, (tabs) => {
    let tabList = document.createElement('ul');
    tabList.className = 'site-list';
    for (let tab of tabs) {
      let tabItem = document.createElement('li');
      tabItem.className = 'site-item';
      tabItem.dataset.tabId = tab.id;

      let infoText = document.createElement('span');
      infoText.className = 'info-text';
      if (tab.favIconUrl) {
        infoText.innerHTML = '<img class="site-icon" ' +
          'src="' + tab.favIconUrl + '">' + tab.title;
      } else {
        const spanStyle = 'display:inline-block; width:13.3333px; height:13.3333px; margin-right:6px;';
        infoText.innerHTML = '<span style="' + spanStyle + '"></span>' + tab.title;
      }

      let closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = 'X';

      tabItem.appendChild(infoText);
      tabItem.appendChild(closeBtn);
      tabList.appendChild(tabItem);
      // append tabList as the dragula containers
      drake.containers.push(tabList);
    }
    currwinList.appendChild(tabList);
  });
}

let searchInput = document.querySelector('#currwin-search');
searchInput.addEventListener('keyup', searchTabs);
function searchTabs() {
  let filterWord = searchInput.value.toLowerCase();

  let tabItems = document.querySelectorAll('#currwin-list-wrapper li');
  for (let item of tabItems) {
    const itemText = item.querySelector('span').textContent;
    if (itemText.toLowerCase().indexOf(filterWord) > -1) {
      item.style.display = 'list-item';
    } else {
      item.style.display = 'none';
    }
  }
}

drake.on('drop', (el, target, source, sibling) => {
  const sourceId = el.dataset.tabId;
  // glory to es6 features; start index is 1
  const tempIdx = [...source.childNodes].findIndex((item) => {
    return item === sibling;
  });
  const dropIdx = (tempIdx !== -1) ? tempIdx-1 : -1;

  chrome.tabs.move(parseInt(sourceId), {index: dropIdx})
});

let currwinPage = document.querySelector('#currwin-page');
currwinPage.addEventListener('click', (event) => {
  const siteItem = event.target.parentNode;
  const tabId = siteItem.dataset.tabId;
  if (event.target.matches('span.info-text')) {
    chrome.tabs.update(parseInt(tabId), {active: true});
  }
  if (event.target.matches('button.close-btn')) {
    chrome.tabs.remove(parseInt(tabId));
    // remove closed page list item
    let siteList = document.querySelector('.site-list');
    siteList.removeChild(siteItem);
  }
});
