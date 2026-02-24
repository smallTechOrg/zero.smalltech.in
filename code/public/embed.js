(function () {
  const script = document.currentScript;
  const chatUrl =
    document.currentScript.getAttribute("data-chat-url") ||
    "https://zero.smalltech.in/embed";

  // Get the host website domain
  const hostWebsite = window.location.origin;
  
  let displayMobile = script.getAttribute("data-display-mobile");
  if (displayMobile === null || displayMobile.trim() === "") {
    displayMobile = true;
  } else if (displayMobile.toLowerCase().trim() === "true") {
    displayMobile = true;
  } else {
    displayMobile = false;
  }
  //  const enableMobile = attr === null ? true : attr === "true";

  // Get custom colour if provided
  const customColour = script.getAttribute("data-colour") || "#219EBC";

  // Get custom tagline if provided
  const customTagline = script.getAttribute("data-tagline") || "Talk to our AI Agent now";

  // Create iframe container
  const iframeWrapper = document.createElement("div");
  iframeWrapper.style.position = "fixed";
  iframeWrapper.style.bottom = "20px";
  iframeWrapper.style.right = "20px";
  iframeWrapper.style.marginLeft = "auto";
  iframeWrapper.style.width = "350px";
  iframeWrapper.style.height = "520px";
  iframeWrapper.style.borderRadius = "16px";
  iframeWrapper.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  iframeWrapper.style.zIndex = "999999";
  iframeWrapper.style.transition = "opacity 0.35s ease, transform 0.35s ease";
  iframeWrapper.style.display = "none";
  iframeWrapper.style.opacity = "0";
  iframeWrapper.style.transform = "translateY(20px) scale(0.97)";
  iframeWrapper.style.overflow = "hidden";
  iframeWrapper.style.background = "white";

  // iframe inside wrapper
  const iframe = document.createElement("iframe");
  iframe.src = `${chatUrl}?host=${encodeURIComponent(hostWebsite)}&color=${encodeURIComponent(customColour)}`;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.borderRadius = "16px";
  iframeWrapper.appendChild(iframe);

  // Close is handled by the widget's internal close button via postMessage

  // Chat text label
  const bubbleText = document.createElement("div");
  bubbleText.innerHTML = customTagline;
  bubbleText.style.position = "fixed";
  bubbleText.style.bottom = "60px";
  bubbleText.style.right = "140px";
  bubbleText.style.background = "#8ECAE6";
  bubbleText.style.background = "rgba(142, 202, 230, 0.25)";
  bubbleText.style.backgroundOpacity = "0.1";
  bubbleText.style.padding = "8px 12px";
  bubbleText.style.borderRadius = "12px";
  bubbleText.style.boxShadow = "0 4px 10px rgba(0,0,0,0.12)";
  bubbleText.style.border = "2px solid #8ECAE6";
  bubbleText.style.zIndex = "999997";
  bubbleText.style.fontSize = "16px";
    bubbleText.style.fontWeight = "600";
  // Ensure bubbleText color is readable on light background
  // For very dark colours, use as-is; but ensure minimum contrast
  bubbleText.style.color = customColour;

  // Floating chat bubble
  const bubble = document.createElement("div");
  bubble.innerHTML = "💬";
  bubble.style.position = "fixed";
  bubble.style.bottom = "50px";
  bubble.style.right = "70px";
  bubble.style.marginLeft = "auto";
  bubble.style.width = "60px";
  bubble.style.height = "60px";
  bubble.style.borderRadius = "50%";
  bubble.style.background = customColour;
  bubble.style.color = "white";
  bubble.style.display = "flex";
  bubble.style.alignItems = "center";
  bubble.style.justifyContent = "center";
  bubble.style.cursor = "pointer";
  bubble.style.fontSize = "28px";
  bubble.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  bubble.style.zIndex = "999998";

  if (displayMobile === false) {
    // Hide on mobile
    if (window.matchMedia("(max-width: 768px)").matches) {
      bubble.style.display = "none";
      bubbleText.style.display = "none";
      iframeWrapper.style.display = "none";
    }
  }
  // Helper function to track analytics events
  function trackAnalyticsEvent(eventName, eventParams) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, eventParams);
    }
  }

  // Listen for analytics events from the iframe
  window.addEventListener("message", (event) => {
    //  verify the message is from our iframe
    if (event.source === iframe.contentWindow) {
      const { type, eventName, eventParams } = event.data;
      if (type === "ANALYTICS_EVENT") {
        trackAnalyticsEvent(eventName, eventParams);
      } else if (type === "CLOSE_CHAT") {
        // Handle close chat message from iframe
        iframeWrapper.style.opacity = "0";
        iframeWrapper.style.transform = "translateY(20px) scale(0.97)";
        setTimeout(function () { iframeWrapper.style.display = "none"; }, 350);
        bubbleText.style.display = "block";
        chatIsOpen = false;
      }
    }
  });

  var chatIsOpen = false;

  function openChat(message) {
    bubbleText.style.display = "none";
    iframeWrapper.style.display = "block";
    // Trigger reflow so the transition plays
    void iframeWrapper.offsetHeight;
    iframeWrapper.style.opacity = "1";
    iframeWrapper.style.transform = "translateY(0) scale(1)";
    chatIsOpen = true;

    // If a pre-filled message was supplied, forward it to the iframe
    if (message && typeof message === "string") {
      // Small delay to let the iframe finish loading / re-rendering
      setTimeout(function () {
        iframe.contentWindow.postMessage({ type: "SEND_MESSAGE", text: message }, "*");
      }, 600);
    }

    // Track in host website's GA4
    trackAnalyticsEvent("chat_bubble_clicked", {
      event_category: "chat_widget",
      event_label: "floating_bubble",
    });
  }

  bubble.addEventListener("click", function () { openChat(); });

  // Allow the host page to open the chat programmatically (with optional message)
  window.addEventListener("open-chat-widget", function (e) {
    openChat(e.detail && e.detail.message ? e.detail.message : undefined);
  });

  // Auto-open the chat after 10 seconds on the page
  setTimeout(function () {
    if (!chatIsOpen) openChat();
  }, 10000);

  function addChatElements() {
    document.body.appendChild(iframeWrapper);
    document.body.appendChild(bubble);
    document.body.appendChild(bubbleText);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addChatElements);
  } else {
    addChatElements();
  }
})();
