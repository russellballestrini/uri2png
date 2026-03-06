// uri2png browser toy: background/service worker
// Minimal: handles install defaults. The popup does its own fetch.

(function () {
  "use strict";

  function getStorageAPI() {
    if (typeof browser !== "undefined" && browser.storage) return browser.storage;
    if (typeof chrome !== "undefined" && chrome.storage) return chrome.storage;
    return null;
  }

  function getRuntimeAPI() {
    if (typeof browser !== "undefined" && browser.runtime) return browser.runtime;
    if (typeof chrome !== "undefined" && chrome.runtime) return chrome.runtime;
    return null;
  }

  var runtime = getRuntimeAPI();
  if (runtime && runtime.onInstalled) {
    runtime.onInstalled.addListener(function () {
      var storage = getStorageAPI();
      if (storage) {
        storage.local.set({
          uri2png_endpoint: "",
          uri2png_width: "1280",
          uri2png_height: "1024",
          uri2png_fullpage: false,
        });
      }
    });
  }
})();
