import { useState, useEffect, useRef } from "react";

export interface Message {
    sender: string;
    text: string;
}

interface HistoryItem {
    type: "human" | "ai";
    content: string;
}

const REQUEST_TIMEOUT = 20 * 1000; // 20 seconds
// Session storage config
const SESSION_KEY = "chat_session";
const SESSION_TTL = 1000 * 60 * 30; // 30 minutes

// load session with expiry
function loadSession(): string {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            const { id, expiry } = JSON.parse(stored);
            if (Date.now() < expiry) {
                return id;
            }
        }
    } catch (e) {
        console.warn("Failed to parse stored session:", e);
    }
    // generate new if expired or not found
    const newId = crypto.randomUUID();
    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ id: newId, expiry: Date.now() + SESSION_TTL })
    );
    return newId;
}
export function useChat(hostWebsite: string = "") {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isClient, setIsClient] = useState(false);
    const [isBotProcessing, setisBotProcessing] = useState(true); // Start true to show typing on initial load
    const chatBoxText = useRef<HTMLDivElement>(null);
    const sessionId = useRef<string>("");


    // initialize session & load history
    useEffect(() => {
        setIsClient(true);

        const init = async () => {
            try {

                //real api call
                const saved = loadSession();
                sessionId.current = saved;

                const url = `${process.env.NEXT_PUBLIC_API_URL}/history?session_id=${saved}${hostWebsite ? `&origin=${encodeURIComponent(hostWebsite)}` : ''}`;
                console.log("[useChat] History API URL:", url);
                const res = await fetch(url, { method: "GET" });
                const data = await res.json();

                if (res.status === 200 || res.status === 201) {
                    setMessages(
                        (data.history as HistoryItem[]).map((h) => ({
                            sender: h.type === "human" ? "You" : "Bot",
                            text: h.content,
                        }))
                    );
                } else {
                    console.error("Unexpected status from /history", res.status, data);
                }
                // Hide typing indicator after history loads
                setisBotProcessing(false);
            } catch (err) {
                console.error("Failed to initialize chat history", err);
                setisBotProcessing(false);
            }
        };

        init();
    }, [hostWebsite]);

    // send message
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent sending if already waiting for a response
        if (isBotProcessing) return;

        const userMsg = input.trim();
        if (!userMsg) return;


        // Track first chatbot message (only once per session)
        const hasTracked = localStorage.getItem(`chat_first_sent_${sessionId.current}`);
        if (!hasTracked) {
            try {
                // Send analytics event to parent window (host website)
                if (typeof window !== "undefined" && window.parent !== window) {
                    window.parent.postMessage(
                        {
                            type: "ANALYTICS_EVENT",
                            eventName: "chatbot_first_interaction",
                            eventParams: {
                                session_id: sessionId.current,
                                page_path: window.location.pathname,
                            },
                        },
                        "*" // Allow any origin since we don't know which websites will embed this
                    );
                }
                localStorage.setItem(`chat_first_sent_${sessionId.current}`, "true");
            } catch (err) {
                console.warn("Failed to send GA event", err);
            }
        }


        setMessages((prev) => [...prev, { sender: "You", text: userMsg }]);
        setInput("");
        // Show typing indicator
        setisBotProcessing(true);
        try {
            //real api call
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            const payload = {
                input: userMsg,
                session_id: sessionId.current,
                request_type: "sales",
            };

            const url = `${process.env.NEXT_PUBLIC_API_URL}/chat${hostWebsite ? `?origin=${encodeURIComponent(hostWebsite)}` : ''}`;
            console.log("[useChat] Chat API URL:", url);
            console.log("[useChat] Chat API payload:", payload);

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            const data = await res.json();
            // Hide typing indicator
            setisBotProcessing(false);

            setMessages((prev) => [
                ...prev,
                {
                    sender: data.success ? "Bot" : "Error",
                    text: data.success ? data.response : data.error || "Something went wrong.",
                },
            ]);
        } catch (err) {
            // Hide typing indicator
            setisBotProcessing(false);
            const errorMsg =
                (err as Error).name === "AbortError"
                    ? "Request timed out. Please try again."
                    : "Network or server issue.";
            setMessages((prev) => [...prev, { sender: "Error", text: errorMsg }]);
        }
    };

    // useEffect to auto-scroll chatbox to the bottom when messages change.
    useEffect(() => {
        if (chatBoxText.current) {
            chatBoxText.current.scrollTop = chatBoxText.current.scrollHeight;
        }
    }, [messages, isBotProcessing]);

    // Programmatic send (no form event required)
    const sendMessageDirect = async (text: string) => {
        const userMsg = text.trim();
        if (!userMsg || isBotProcessing) return;

        setMessages((prev) => [...prev, { sender: "You", text: userMsg }]);
        setInput("");
        setisBotProcessing(true);

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            const payload = {
                input: userMsg,
                session_id: sessionId.current,
                request_type: "sales",
            };

            const url = `${process.env.NEXT_PUBLIC_API_URL}/chat${hostWebsite ? `?origin=${encodeURIComponent(hostWebsite)}` : ''}`;
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            const data = await res.json();
            setisBotProcessing(false);

            setMessages((prev) => [
                ...prev,
                {
                    sender: data.success ? "Bot" : "Error",
                    text: data.success ? data.response : data.error || "Something went wrong.",
                },
            ]);
        } catch (err) {
            setisBotProcessing(false);
            const errorMsg =
                (err as Error).name === "AbortError"
                    ? "Request timed out. Please try again."
                    : "Network or server issue.";
            setMessages((prev) => [...prev, { sender: "Error", text: errorMsg }]);
        }
    };

    return {
        chatBoxText,
        messages,
        input,
        isClient,
        isBotProcessing,
        sendMessage,
        sendMessageDirect,
        setInput,
    };
}
