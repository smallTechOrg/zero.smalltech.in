"use client";
import Footer from "../components/core/footer";
import { useChat } from "../hooks/useChat";
import Image from "next/image";
export default function Chat() {
  const {
    chatBoxText,
    messages,
    input,
    isClient,
    isBotProcessing,
    sendMessage,
    setInput,
  } = useChat();

  return (
    <div className="flex flex-col px-2 relative min-h-screen" >
      <h2 className="text-start">Meet Our AI Agent</h2>
      <p className="text-start">
        Talk to our smart assistant to explore services
      </p>

      <div
        ref={chatBoxText}
        className="flex flex-col overflow-y-auto space-y-1 "
        style={{
          flexGrow: 1,
          maxHeight: "calc(110vh - 200px)",
        }}

      >
        <Footer />
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-4 py-2 rounded-lg  ${msg.sender === "You"
              ? " bg-pacific self-end text-white  shadow-lg"
              : " bg-sky self-start  text-navy shadow-lg "
              }`}
          >
            {msg.sender === "You" ? (
              <p className="font-[400]">{msg.text}</p>
            ) : (
               <p className="text-navy font-[400]">{msg.text}</p>
            )}
          </div>
        ))}
        {/* Typing Indicator */}
        {isBotProcessing && (
          <div className="bg-sky self-start text-navy font-semibold px-3 py-[1%] rounded-lg flex space-x-1">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
          </div>
        )}
      </div>
      {isClient && (
        <form
          onSubmit={sendMessage}
          className="mt-4 mb-20"
        >
          <div className="flex items-center bg-navy rounded-xl border border-pacific px-3 py-2 shadow-md">
            <input
              type="text"
              className="flex-1 text-white placeholder-sky bg-transparent outline-none font-[200]"
              placeholder="Type a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
            />
            <button
              type="submit"
              className="text-white font-semibold ml-2 hover:text-sky transition"
              disabled={isBotProcessing}
            >
              <Image src="./send.svg" alt="Send" width={20} height={20} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
