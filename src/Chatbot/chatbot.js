import React, { useState, useEffect, useRef, useCallback } from "react";
import axiosClient from "../Chatbot/axiosClient";
import Lottie from "lottie-react";
import BotAnimation from "../assets/chat-bot-animation.json";
import PeoplesIcon from "../assets/peoples_logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { MicIcon, Minimize2, SendIcon, StopCircleIcon } from "lucide-react";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); //state to catch chat window open or not
  const [chatStep, setChatStep] = useState(0); // 0 = intro, 1 = chat
  const [threadId, setThreadId] = useState(null); // To store thread_id
  const [userId, setUserId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`); // Generate random user ID

  const messagesEndRef = useRef(null);

  // ✅ Memoize startChat using useCallback to prevent re-renders
  const startChat = useCallback(async () => {
    try {
      setMessages([
        {
          role: "bot",
          content: formatMessage(
            "Hi, I'm <b>PI Assist</b>, your **Personal Insurance Advisor** at <b>People's Insurance</b>! 🚀<br><br>" +
              "I'm here to help you secure your future with the **most reliable and comprehensive insurance solutions** in the industry.<br><br>" +
              "✅ Whether it's for your **health**, **vehicle**, **home**, or **business**, we've got you covered! 🏡🚗💼<br><br>" +
              "📢 <b>Why Choose People's Insurance?</b><br>" +
              "• **Affordable Premiums** 💰 – Get the best coverage without overpaying.<br>" +
              "• **Seamless Claims Process** 📄 – Quick & hassle-free claims settlement.<br>" +
              "• **Trusted Brand** 🌟 – Years of proven customer loyalty and satisfaction.<br><br>" +
              "💬 What type of insurance are you considering today?"
          ),
        },
      ]);
    } catch (error) {
      console.error("Error starting chat:", error);
      setMessages([
        {
          role: "bot",
          content: formatMessage(
            "Oops! Unable to start the chat. Please try again later."
          ),
        },
      ]);
    }
  }, []); // ✅ Empty dependency array ensures it's only defined once

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      setVoiceSupported(true);
    }
    startChat(); // ✅ Now `startChat` is properly defined with useCallback
  }, [startChat]); // ✅ Fixes the ESLint warning

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInputText("");
    setThinking(true);

    try {
      let response;
      // If we don't have a thread ID yet, this is the first message
      if (!threadId) {
        response = await axiosClient.post("/chat", {
          message: userMessage,
          user_id: userId
        });
        // Store the thread_id for subsequent messages
        if (response.data.thread_id) {
          setThreadId(response.data.thread_id);
        }
      } else {
        // For follow-up messages, include the thread_id
        response = await axiosClient.post("/chat", {
          message: userMessage,
          thread_id: threadId,
          user_id: userId
        });
      }

      // Clean up the response by removing source citations
      let botResponse = response.data.response || "No response received.";
      botResponse = botResponse.replace(/【[^【】]*?†source】/g, ''); // Remove source citations
      
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: formatMessage(botResponse) },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: formatMessage(
            "Oops! Something went wrong. Please try again."
          ),
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleVoiceInput = () => {
    if (!voiceSupported) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    recognition.onstart = () => setRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };
    recognition.onerror = () => {
      setRecording(false);
      console.error("Voice recognition error.");
    };
    recognition.onend = () => {
      setRecording(false);
      if (inputText.trim()) sendMessage();
    };

    recognition.start();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // **Bold** → <b>Bold</b>
      .replace(/\n/g, "<br>") // New lines → <br>
      .replace(/• /g, "<br>• ") // Bullet points formatting
      .trim();
  };

  return (
    <>
      <AnimatePresence>
        {isChatOpen ? (
          <motion.div
            key="chatbot"
            initial={{
              opacity: 0,
              scale: 0.95,
              clipPath: "circle(0% at 95% 95%)",
              width: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              clipPath: "circle(150% at 95% 95%)",
              width: "27rem",
              height: "37rem",
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              clipPath: "circle(0% at 95% 95%)",
              width: 0,
              height: 0,
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            className="fixed bottom-4 right-4 shadow-xl rounded-3xl overflow-hidden border border-gray-200 flex flex-col z-50 h-[580px]"
            style={{
              background: "linear-gradient(145deg, #ffffff, #f4f8fb)",
              transformOrigin: "bottom right",
              maxWidth: "calc(100vw - 2rem)",
            }}
          >
            {chatStep === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 space-y-10 bg-gradient-to-br from-[#1E5BA9] to-[#4F81BC] text-white">
                <div className="bg-white py-4 px-8 rounded-full shadow-lg">
                  <img src={PeoplesIcon} className="h-20" alt="Logo" />
                </div>

                <p className="text-center text-md text-white  px-8 leading-relaxed">
                  <span className="font-bold text-5xl tracking-wide">
                    Hello
                  </span>
                  <br />
                  Welcome! I am here to assist you to summarize and discuss the
                  facts of People's Insurance Annual Report 2024.
                </p>

                <motion.button
                  onClick={() => setChatStep(1)}
                  className="bg-white text-[#1E5BA9] font-medium px-5 py-2.5 rounded-full shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Chat Header  */}
                <header className="flex px-5 items-center justify-between p-2.5 py-4 bg-gradient-to-r from-white to-[#1E5BA9]">
                  <img src={PeoplesIcon} className="h-9" alt="Logo" />
                  <motion.button
                    onClick={() => setIsChatOpen(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white"
                  >
                    <Minimize2 />
                  </motion.button>
                </header>

                {/* Chat Body */}
                <div className="flex-1 overflow-y-auto p-3 pt-5 space-y-2.5 bg-gray-50">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      className={`p-2.5 rounded-lg max-w-[90%] text-sm ${
                        msg.role === "user"
                          ? "bg-blue-100 self-end ml-auto"
                          : "bg-gray-200 self-start"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p dangerouslySetInnerHTML={{ __html: msg.content }} />
                    </motion.div>
                  ))}
                  {thinking && (
                    <motion.div
                      className="flex items-center gap-1.5 text-sm text-gray-500 pl-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span>Typing</span>
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full"
                          animate={{
                            y: ["0%", "-30%", "0%"],
                            transition: {
                              duration: 1.2,
                              repeat: Infinity,
                              delay: i * 0.2,
                            },
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="border-t px-5 border-gray-200 p-2.5 bg-white">
                  <div className="flex gap-1.5">
                    <textarea
                      className="flex-1 resize-none px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={1}
                      placeholder="Type your message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    {voiceSupported && (
                      <motion.button
                        onClick={handleVoiceInput}
                        className="p-1.5 rounded-lg border border-gray-300 text-blue-600 flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {recording ? (
                          <StopCircleIcon
                            className="text-red-500 animate-pulse"
                            size={18}
                          />
                        ) : (
                          <MicIcon className="text-red-400" size={18} />
                        )}
                      </motion.button>
                    )}
                    <motion.button
                      onClick={sendMessage}
                      className="py-1.5 px-3 bg-blue-600 text-white rounded-lg flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SendIcon size={18} />
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-4 right-4 z-40"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lottie
              animationData={BotAnimation}
              className="w-36"
              alt="Chatbot"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

export default Chatbot;