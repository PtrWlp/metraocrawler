'use strict'
// Listens for message back from content script
chrome.runtime.onMessage.addListener(function (request) {
  // is the message for me?
  if (request === 'getMetraoData') {
    chrome.tabs.query({active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.executeScript(tabs[0].id, {file: 'metrao-inject.js'})
    })
  }
})

  