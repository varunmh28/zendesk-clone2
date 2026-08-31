/**
 * SupportHub Embeddable Widget Loader
 * Lightweight, zero-dependency async client script.
 * 
 * Usage:
 * <script 
 *   src="https://your-domain.com/widget.js" 
 *   data-workspace="wk_live_..."
 *   data-position="bottom-right" 
 *   defer>
 * </script>
 */

(function () {
  if (typeof window === "undefined") return;

  // Prevent multiple initializations
  if (window.__SUPPORTHUB_INITIALIZED__) {
    return;
  }
  window.__SUPPORTHUB_INITIALIZED__ = true;

  // 1. Locate current script and extract config attributes
  var currentScript =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      for (var i = scripts.length - 1; i >= 0; i--) {
        if (
          scripts[i].src &&
          (scripts[i].src.indexOf("widget.js") !== -1 ||
            scripts[i].getAttribute("data-workspace") ||
            scripts[i].getAttribute("data-workspace-key"))
        ) {
          return scripts[i];
        }
      }
      return null;
    })();

  var workspaceKey = "";
  var scriptOrigin = window.location.origin;

  if (currentScript) {
    workspaceKey =
      currentScript.getAttribute("data-workspace") ||
      currentScript.getAttribute("data-workspace-key") ||
      currentScript.getAttribute("data-key") ||
      "";

    if (currentScript.src) {
      try {
        var parsedUrl = new URL(currentScript.src, window.location.href);
        scriptOrigin = parsedUrl.origin;
      } catch (e) {
        scriptOrigin = window.location.origin;
      }
    }
  }

  var baseUrl = (currentScript && currentScript.getAttribute("data-base-url")) || scriptOrigin;
  var position = (currentScript && currentScript.getAttribute("data-position")) || "bottom-right";
  var primaryColor = (currentScript && currentScript.getAttribute("data-primary-color")) || "#4f46e5";
  var zIndex = (currentScript && currentScript.getAttribute("data-z-index")) || "999999";
  var hideButton = currentScript && currentScript.getAttribute("data-hide-button") === "true";
  var autoOpen = currentScript && currentScript.getAttribute("data-auto-open") === "true";

  var isOpen = false;
  var eventListeners = {};
  var iframe = null;
  var container = null;
  var button = null;
  var badge = null;

  // 2. Inject CSS styles
  function injectStyles() {
    if (document.getElementById("supporthub-widget-styles")) return;

    var style = document.createElement("style");
    style.id = "supporthub-widget-styles";
    style.textContent = `
      #supporthub-root {
        position: fixed;
        z-index: ${zIndex};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        box-sizing: border-box;
      }
      #supporthub-root * {
        box-sizing: border-box;
      }
      #supporthub-root.pos-bottom-right {
        bottom: 20px;
        right: 20px;
      }
      #supporthub-root.pos-bottom-left {
        bottom: 20px;
        left: 20px;
      }
      .supporthub-launcher-btn {
        width: 58px;
        height: 58px;
        border-radius: 50%;
        background-color: ${primaryColor};
        color: #ffffff;
        border: none;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0, 0, 0, 0.08);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, background-color 0.2s ease;
        position: relative;
        outline: none;
        -webkit-tap-highlight-color: transparent;
      }
      .supporthub-launcher-btn:hover {
        transform: scale(1.06);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22), 0 3px 8px rgba(0, 0, 0, 0.1);
      }
      .supporthub-launcher-btn:active {
        transform: scale(0.95);
      }
      .supporthub-launcher-icon {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.25s ease, opacity 0.2s ease;
      }
      .supporthub-launcher-icon svg {
        width: 26px;
        height: 26px;
        fill: currentColor;
      }
      .supporthub-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background-color: #ef4444;
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        min-width: 20px;
        height: 20px;
        border-radius: 10px;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: supporthub-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes supporthub-pop {
        0% { transform: scale(0); }
        100% { transform: scale(1); }
      }
      .supporthub-iframe-wrap {
        position: fixed;
        width: 400px;
        height: 640px;
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 100px);
        background: transparent;
        border-radius: 18px;
        box-shadow: 0 12px 36px -6px rgba(0, 0, 0, 0.22), 0 4px 16px -2px rgba(0, 0, 0, 0.12);
        overflow: hidden;
        transition: opacity 0.24s ease, transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.24s;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateY(16px) scale(0.95);
        z-index: ${zIndex};
      }
      #supporthub-root.pos-bottom-right .supporthub-iframe-wrap {
        bottom: 90px;
        right: 20px;
        transform-origin: bottom right;
      }
      #supporthub-root.pos-bottom-left .supporthub-iframe-wrap {
        bottom: 90px;
        left: 20px;
        transform-origin: bottom left;
      }
      .supporthub-iframe-wrap.is-open {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0) scale(1);
      }
      .supporthub-iframe {
        width: 100%;
        height: 100%;
        border: none;
        display: block;
        background: #ffffff;
      }
      @media (max-width: 640px) {
        .supporthub-iframe-wrap {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          border-radius: 0 !important;
          transform: translateY(100%) !important;
        }
        .supporthub-iframe-wrap.is-open {
          transform: translateY(0) !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 3. SVG Icons
  var CHAT_ICON_SVG =
    '<svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.1 21.2a1 1 0 001.2 1.2l4.2-1.238A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 2c4.418 0 8 3.582 8 8s-3.582 8-8 8a7.96 7.96 0 01-3.714-.913l-.337-.183-2.617.771.771-2.617-.183-.337A7.96 7.96 0 014 12c0-4.418 3.582-8 8-8zm-3 5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm3 0a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zm3 0a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z"/></svg>';

  var CLOSE_ICON_SVG =
    '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

  // 4. Build DOM structure
  function initDOM() {
    injectStyles();

    var root = document.createElement("div");
    root.id = "supporthub-root";
    root.className = position === "bottom-left" ? "pos-bottom-left" : "pos-bottom-right";

    // Iframe container
    container = document.createElement("div");
    container.className = "supporthub-iframe-wrap";

    var targetUrl =
      baseUrl.replace(/\/+$/, "") +
      "/widget/" +
      encodeURIComponent(workspaceKey || "default");

    iframe = document.createElement("iframe");
    iframe.className = "supporthub-iframe";
    iframe.src = targetUrl;
    iframe.title = "SupportHub Support Chat";
    iframe.allow = "clipboard-write; microphone; camera";
    iframe.loading = "lazy";

    container.appendChild(iframe);
    root.appendChild(container);

    // Launcher button
    if (!hideButton) {
      button = document.createElement("button");
      button.className = "supporthub-launcher-btn";
      button.setAttribute("aria-label", "Open customer support chat");
      button.innerHTML = '<span class="supporthub-launcher-icon">' + CHAT_ICON_SVG + "</span>";

      badge = document.createElement("span");
      badge.className = "supporthub-badge";
      button.appendChild(badge);

      button.addEventListener("click", function () {
        toggle();
      });

      root.appendChild(button);
    }

    document.body.appendChild(root);

    if (autoOpen) {
      setTimeout(open, 800);
    }
  }

  // 5. State management
  function open() {
    if (isOpen) return;
    isOpen = true;
    if (container) container.classList.add("is-open");
    if (button) {
      var icon = button.querySelector(".supporthub-launcher-icon");
      if (icon) icon.innerHTML = CLOSE_ICON_SVG;
    }
    emit("open");
    postToIframe({ type: "supporthub:parent_opened" });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    if (container) container.classList.remove("is-open");
    if (button) {
      var icon = button.querySelector(".supporthub-launcher-icon");
      if (icon) icon.innerHTML = CHAT_ICON_SVG;
    }
    emit("close");
    postToIframe({ type: "supporthub:parent_closed" });
  }

  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  function identify(userTraits) {
    postToIframe({
      type: "supporthub:identify",
      user: userTraits,
    });
  }

  function setUnreadCount(count) {
    if (!badge) return;
    if (count > 0 && !isOpen) {
      badge.textContent = count > 99 ? "99+" : count;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }

  function postToIframe(message) {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(message, "*");
    }
  }

  function emit(eventName, data) {
    var cbs = eventListeners[eventName] || [];
    for (var i = 0; i < cbs.length; i++) {
      try {
        cbs[i](data);
      } catch (e) {
        console.error("[SupportHub] Event listener error:", e);
      }
    }
  }

  function on(eventName, callback) {
    if (!eventListeners[eventName]) {
      eventListeners[eventName] = [];
    }
    eventListeners[eventName].push(callback);
  }

  // 6. Handle postMessage from embedded widget
  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || typeof data !== "object") return;

    switch (data.type) {
      case "supporthub:toggle":
        toggle();
        break;
      case "supporthub:open":
        open();
        break;
      case "supporthub:close":
        close();
        break;
      case "supporthub:unread_count":
        setUnreadCount(Number(data.count) || 0);
        emit("unread_count", data.count);
        break;
      case "supporthub:ready":
        emit("ready");
        // Pass parent metadata to iframe
        postToIframe({
          type: "supporthub:init_parent",
          parentUrl: window.location.href,
          parentTitle: document.title,
        });
        break;
      default:
        break;
    }
  });

  // 7. Global API object
  var api = {
    open: open,
    close: close,
    toggle: toggle,
    identify: identify,
    on: on,
    setUnreadCount: setUnreadCount,
    show: function () {
      if (button) button.style.display = "flex";
    },
    hide: function () {
      if (button) button.style.display = "none";
    },
    getIsOpen: function () {
      return isOpen;
    },
  };

  // Process queued commands
  if (window.SupportHub && Array.isArray(window.SupportHub.q)) {
    var queue = window.SupportHub.q;
    for (var j = 0; j < queue.length; j++) {
      var item = queue[j];
      if (Array.isArray(item) && typeof api[item[0]] === "function") {
        api[item[0]].apply(api, item.slice(1));
      }
    }
  }

  window.SupportHub = api;

  // Initialize on document ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDOM);
  } else {
    initDOM();
  }
})();
