// uri2png browser toy: screenshot any URI via a permacomputer.
// https://github.com/russellballestrini/uri2png

(function () {
  "use strict";

  function getStorageAPI() {
    if (typeof browser !== "undefined" && browser.storage) return browser.storage;
    if (typeof chrome !== "undefined" && chrome.storage) return chrome.storage;
    return null;
  }

  function getTabsAPI() {
    if (typeof browser !== "undefined" && browser.tabs) return browser.tabs;
    if (typeof chrome !== "undefined" && chrome.tabs) return chrome.tabs;
    return null;
  }

  var uriInput = document.getElementById("uri-input");
  var endpointInput = document.getElementById("endpoint-input");
  var widthInput = document.getElementById("width-input");
  var heightInput = document.getElementById("height-input");
  var fullpageInput = document.getElementById("fullpage-input");
  var captureBtn = document.getElementById("capture-btn");
  var previewPanel = document.getElementById("preview-panel");
  var previewImg = document.getElementById("preview-img");
  var downloadLink = document.getElementById("download-link");
  var copyBtn = document.getElementById("copy-btn");
  var statusEl = document.getElementById("status");
  var settingsToggle = document.getElementById("settings-toggle");
  var settingsPanel = document.getElementById("settings-panel");

  // Toggle advanced settings
  settingsToggle.addEventListener("click", function () {
    var open = settingsPanel.style.display === "block";
    settingsPanel.style.display = open ? "none" : "block";
    settingsToggle.textContent = open ? "more options" : "fewer options";
  });

  // Pre-fill URI with current tab
  var tabs = getTabsAPI();
  if (tabs && tabs.query) {
    tabs.query({ active: true, currentWindow: true }, function (results) {
      if (results && results[0] && results[0].url) {
        var url = results[0].url;
        if (url.indexOf("http") === 0) {
          uriInput.value = url;
        }
      }
    });
  }

  // Load saved settings
  var storage = getStorageAPI();
  if (storage) {
    storage.local.get(
      ["uri2png_endpoint", "uri2png_width", "uri2png_height", "uri2png_fullpage"],
      function (result) {
        if (result.uri2png_endpoint) endpointInput.value = result.uri2png_endpoint;
        if (result.uri2png_width) widthInput.value = result.uri2png_width;
        if (result.uri2png_height) heightInput.value = result.uri2png_height;
        if (result.uri2png_fullpage) fullpageInput.checked = result.uri2png_fullpage;
      }
    );
  }

  function saveSettings() {
    if (!storage) return;
    storage.local.set({
      uri2png_endpoint: endpointInput.value,
      uri2png_width: widthInput.value,
      uri2png_height: heightInput.value,
      uri2png_fullpage: fullpageInput.checked,
    });
  }

  endpointInput.addEventListener("change", saveSettings);
  widthInput.addEventListener("change", saveSettings);
  heightInput.addEventListener("change", saveSettings);
  fullpageInput.addEventListener("change", saveSettings);

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = "status" + (type ? " " + type : "");
  }

  captureBtn.addEventListener("click", function () {
    var uri = uriInput.value.trim();
    var endpoint = endpointInput.value.trim().replace(/\/+$/, "");

    if (!uri) {
      setStatus("Enter a URI to capture.", "error");
      return;
    }

    if (!endpoint) {
      setStatus("Configure a uri2png endpoint first.", "error");
      return;
    }

    captureBtn.disabled = true;
    captureBtn.textContent = "Capturing...";
    previewPanel.style.display = "none";
    setStatus("Sending request to " + endpoint + " ...", "");

    saveSettings();

    var params = new URLSearchParams({
      url: uri,
      width: widthInput.value || "1280",
      height: heightInput.value || "1024",
      full_page: fullpageInput.checked ? "true" : "false",
    });

    var imageUrl = endpoint + "/screenshot/capture/image?" + params.toString();

    fetch(imageUrl)
      .then(function (response) {
        if (!response.ok) {
          return response.text().then(function (text) {
            throw new Error("Server returned " + response.status + ": " + text);
          });
        }
        var duration = response.headers.get("X-Screenshot-Duration");
        return response.blob().then(function (blob) {
          return { blob: blob, duration: duration };
        });
      })
      .then(function (result) {
        var objectUrl = URL.createObjectURL(result.blob);

        previewImg.src = objectUrl;
        previewPanel.style.display = "block";

        downloadLink.href = objectUrl;
        var hostname = "screenshot";
        try {
          hostname = new URL(uri).hostname.replace(/\./g, "-");
        } catch (e) {
          // keep default
        }
        downloadLink.download = hostname + ".png";

        var msg = "Captured";
        if (result.duration) msg += " in " + result.duration + "ms";
        setStatus(msg, "success");

        captureBtn.disabled = false;
        captureBtn.textContent = "Capture";
      })
      .catch(function (err) {
        setStatus(err.message, "error");
        captureBtn.disabled = false;
        captureBtn.textContent = "Capture";
      });
  });

  copyBtn.addEventListener("click", function () {
    if (!previewImg.src) return;

    fetch(previewImg.src)
      .then(function (r) { return r.blob(); })
      .then(function (blob) {
        return navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
      })
      .then(function () {
        setStatus("Copied to clipboard", "success");
      })
      .catch(function () {
        setStatus("Could not copy to clipboard", "error");
      });
  });

  uriInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") captureBtn.click();
  });
})();
