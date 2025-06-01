"use client";
import axios from "axios";
import { useState, useEffect, useRef } from "react";

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};
declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

type Message = {
  text: string;
  sender: "user" | "bot";
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your bot. Ask me anything.", sender: "bot" },
  ]);
  const [input, setInput] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.maxAlternatives = 1;

        recognition.onspeechend = () => recognition.stop();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setTimeout(() => {
            handleSend(transcript);
          }, 200);
        };

        recognition.onerror = (event: any) => {
          if (event.error === "no-speech") {
            alert("No speech was detected. Please try again.");
          } else {
            console.error("Speech recognition error:", event.error);
          }
        };

        recognitionRef.current = recognition;
      } else {
        alert("Speech Recognition is not supported in this browser.");
      }
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const fetchBotReply = async (message: string): Promise<Message> => {
    try {
      const query = encodeURIComponent(message);
      const res = await fetch(`https://api.duckduckgo.com/?q=${query}&format=json&no_html=1`);
      const data = await res.json();
      const answer = data.AbstractText || data.Heading || "I couldn't find a direct answer.";

      return { text: answer, sender: "bot" };
    } catch (error) {
      return { text: "Oops! I couldn’t reach DuckDuckGo right now.", sender: "bot" };
    }
  };

  const handleSend = async (customText?: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    const message = customText || input;
    if (!message.trim()) return;

    const userMessage: Message = { text: message, sender: "user" };
    const botMessage = await fetchBotReply(message);
    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");

  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            style={{
              padding: "10px 20px",
              borderRadius: "50%",
              backgroundColor: "#0084ff",
              color: "white",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            💬
          </button>
        ) : (
          <div
            style={{
              width: "350px",
              height: "500px",
              backgroundColor: "white",
              borderRadius: "10px",
              boxShadow: "0 0 10px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              fontFamily: "Arial, sans-serif",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                flex: 1,
                padding: "10px",
                overflowY: "auto",
              }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    textAlign: msg.sender === "user" ? "right" : "left",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      borderRadius: "16px",
                      backgroundColor: msg.sender === "user" ? "#0084ff" : "#e5e5ea",
                      color: msg.sender === "user" ? "white" : "black",
                      maxWidth: "80%",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ccc" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "4px",
                  color: 'black',
                  border: "#ccc",
                  marginRight: "8px",
                }}
                placeholder="Type your message..."
              />
              <button onClick={()=>handleSend()} style={{ padding: "8px 12px", cursor: "pointer", color:"blue" }}>
                ➤
              </button>
              <button onClick={startListening} style={{ padding: "8px 12px", cursor: "pointer" }}>
                🎤
              </button>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                position: "absolute",
                top: "8px",
                right: "10px",
                border: "none",
                color: 'red',
                background: "transparent",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>
        )}
      </div>
    </>
  );
}
