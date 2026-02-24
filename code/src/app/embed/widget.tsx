"use client";
import { useChat } from "../hooks/useChat";
import { useSearchParams } from "next/navigation";
import { useEffect, useCallback } from "react";
import { generateColorPalette, applyColorPalette, getThemeColor } from "./colorTheme";
import styles from "./widget.module.css";
import { analytics } from "@/app/lib/analytics";

export default function Chat() {
  const searchParams = useSearchParams();
  const hostWebsite = searchParams.get("host") || "";
  
  // Initialize color theme
  useEffect(() => {
    const themeColor = getThemeColor(searchParams);
    const palette = generateColorPalette(themeColor);
    applyColorPalette(palette);
  }, [searchParams]);

  const {
    chatBoxText,
    messages,
    input,
    isClient,
    isBotProcessing,
    sendMessage,
    sendMessageDirect,
    setInput,
  } = useChat(hostWebsite);

  // Listen for pre-filled messages from the parent (embed.js)
  const sendMessageDirectCb = useCallback(sendMessageDirect, [sendMessageDirect]);
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type === "SEND_MESSAGE" && event.data.text) {
        analytics.track('embed_widget_parent_message', {
          message_length: event.data.text.length,
        });
        sendMessageDirectCb(event.data.text);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [sendMessageDirectCb]);

  const handleClose = () => {
    analytics.track('embed_widget_close', {
      session_id: '', // session is inside the hook
      message_count: messages.length,
    });
    // Send close message to parent window
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage({ type: "CLOSE_CHAT" }, "*");
    }
  };

  return (
    <div className={styles.chatContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            💬
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.headerTitle}>Chat with us</h1>
            <p className={styles.headerSubtitle}>We are here to help you</p>
          </div>
        </div>
        <button 
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close chat"
          type="button"
        >
          ✕
        </button>
      </div>

      {/* Messages Area */}
      <div ref={chatBoxText} className={styles.messagesContainer}>
        {messages.length === 0 && !isBotProcessing && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>👋</div>
            <h2 className={styles.emptyStateTitle}>Welcome!</h2>
            <p className={styles.emptyStateText}>
              How can we help you today?
            </p>
          </div>
        )}
        
        {messages.map((msg, i) => {
          const isUser = msg.sender === "You";
          
          return (
            <div
              key={i}
              className={`${styles.message} ${
                isUser ? styles.messageUser : styles.messageBot
              }`}
            >
              <div
                className={`${styles.messageAvatar} ${
                  isUser ? styles.messageAvatarUser : styles.messageAvatarBot
                }`}
              >
                {isUser ? "👤" : "🤖"}
              </div>
              <div
                className={`${styles.messageBubble} ${
                  isUser ? styles.messageBubbleUser : styles.messageBubbleBot
                }`}
              >
                <p className={styles.messageText}>{msg.text}</p>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isBotProcessing && (
          <div className={styles.typingIndicator}>
            <div className={`${styles.messageAvatar} ${styles.messageAvatarBot}`}>
              🤖
            </div>
            <div className={styles.typingBubble}>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      {isClient && (
        <div className={styles.inputContainer}>
          <form onSubmit={sendMessage} className={styles.inputForm}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isBotProcessing}
                aria-label="Message input"
              />
            </div>
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isBotProcessing || !input.trim()}
              aria-label="Send message"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
