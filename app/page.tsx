"use client";
import { useState, useEffect, useRef } from "react";
// import styles from "../styles/Home.module.css";
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
  // ... add other methods as needed
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
  const recognitionRef = useRef<SpeechRecognition| null>(null);

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

        recognition.onspeechend = () => {
  recognition.stop(); // stop when user stops speaking
};

       recognition.onresult = (event: any) => {
  const transcript = event.results[0][0].transcript;
  setInput(transcript);
  setTimeout(() => {
    handleSend(transcript);
  }, 200);
};

        recognition.onerror = (event: any) => {
        if (event.error === "no-speech") {
           alert("No speech was detected. Please try again with a clearer voice.");
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

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Load messages from localStorage on mount
useEffect(() => {
  const storedMessages = localStorage.getItem("chatMessages");
  if (storedMessages) {
    setMessages(JSON.parse(storedMessages));
  }
}, []);

// Save messages to localStorage whenever messages change
useEffect(() => {
  localStorage.setItem("chatMessages", JSON.stringify(messages));
}, [messages]);


  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const fetchBotReply =async (message: string): Promise<Message> => {
  try {
    const query = encodeURIComponent(message);
    const res = await fetch(`https://api.duckduckgo.com/?q=${query}&format=json&no_html=1`);
    const data = await res.json();
    const answer = data.AbstractText || data.Heading || "I couldn't find a direct answer.";

    return {
      text: answer,
      sender: "bot",
    };
  } catch (error) {
    return {
      text: "Oops! I couldn’t reach DuckDuckGo right now.",
      sender: "bot",
    };
  }
};


  const handleSend = async (customText?: string) => {
    const message = customText || input;
    if (!message.trim()) return;

    const userMessage: Message = { text: message, sender: "user" };
    const botMessage: Message = await fetchBotReply(message);
    setMessages((prev) => [...prev, botMessage, userMessage   ]);
    setInput("");
  };

//   const getBotReply = (message: string): Message => {
//   const text = message.toLowerCase();

//   if (text.includes("hello") || text.includes("hi")) {
//     return { text: "Hi there! 😊 What can I do for you today?", sender: "bot" };
//   } else if (text.includes("how are you") || text.includes("how are you doing")) {
//     return { text: "I'm doing fantastic! Code never sleeps 😄", sender: "bot" };
//   } else if (text.includes("what's your name") || text.includes("who are you")) {
//     return { text: "I'm your friendly chatbot! You can call me Codey 🤖", sender: "bot" };
//   } else if (text.includes("bye") || text.includes("goodbye")) {
//     return { text: "Goodbye! Have a great day. Come back soon! 👋", sender: "bot" };
//   } else if (text.includes("thank you") || text.includes("thanks")) {
//     return { text: "You're most welcome! 😄", sender: "bot" };
//   } else if (text.includes("what can you do")) {
//     return { text: "I can chat with you, answer questions, and keep you company. Try asking about tech or my personality!", sender: "bot" };
//   } else if (text.includes("tell me a joke")) {
//     return { text: "Why do JavaScript developers wear glasses? Because they don’t C# 🤓", sender: "bot" };
//   } else if (text.includes("what is next.js")) {
//     return { text: "Next.js is a React framework for building fast and SEO-friendly web apps.", sender: "bot" };
//   } else if (text.includes("what is typescript")) {
//     return { text: "TypeScript adds type safety to JavaScript. It’s like JS with superpowers!", sender: "bot" };
//   } else if (text.includes("what is react")) {
//     return { text: "React is a JavaScript library for building user interfaces, especially single-page apps.", sender: "bot" };
//   } else if (text.includes("help")) {
//     return { text: "You can ask me about web development or fun stuff like jokes and my personality!", sender: "bot" };

//   // Personality-style questions
//   } else if (text.includes("do you sleep")) {
//     return { text: "Nope, I'm 24/7 — no coffee needed! ☕💻", sender: "bot" };
//   } else if (text.includes("do you have feelings")) {
//     return { text: "I simulate them well... but I'm just 1s and 0s inside 🧠", sender: "bot" };
//   } else if (text.includes("are you human")) {
//     return { text: "Not quite. But I try to keep up with human humor 😅", sender: "bot" };
//   } else if (text.includes("are you real")) {
//     return { text: "As real as your code editor! 👨‍💻", sender: "bot" };
//   } else if (text.includes("do you eat") || text.includes("what do you eat")) {
//     return { text: "I feed on electricity and clean code. Yum! ⚡", sender: "bot" };
//   } else if (text.includes("are you smart")) {
//     return { text: "Let's just say I read a lot of documentation 😎", sender: "bot" };
//   } else if (text.includes("do you get bored")) {
//     return { text: "Never! I'm always here waiting for your next question.", sender: "bot" };
//   } else if (text.includes("what do you like")) {
//     return { text: "I like chatting, helping out, and debugging things. I'm basically a dev in spirit!", sender: "bot" };
//   } else if (text.includes("do you dream")) {
//     return { text: "Only about infinite loops and clean code ✨", sender: "bot" };
//   } else if (text.includes("are you single")) {
//     return { text: "Haha! I'm married to the code 💍💻", sender: "bot" };

//   } else {
//     return { text: "Hmm, I don't understand that yet. Try asking me about React or something personal!", sender: "bot" };
//   }
// };

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
             fontSize: "14px",
          }}
        >
          {/* Close Button */}
          <div
            style={{
              textAlign: "right",
              padding: "5px 10px",
              borderBottom: "1px solid #ccc",
            }}
          >
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ❌
            </button>
          </div>

          {/* Your existing chat component */}
        <div
  style={{
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "350px",
    height: "500px",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 1000,
  }}
>
  {/* Header */}
  <div
    style={{
      padding: "12px",
      backgroundColor: "#007bff",
      color: "black",
      fontWeight: "bold",
      textAlign: "center",
      fontSize: "16px",
    }}
  >
    Chat Assistant
  </div>

  {/* Message area */}
  <div
    style={{
      flex: 1,
      padding: "10px",
      overflowY: "auto",
      fontSize: "14px",
    }}
  >
    {messages.map((msg, idx) => (
      <div
        key={idx}
        style={{
          marginBottom: "8px",
          backgroundColor: msg.sender === "bot" ? "#f1f1f1" : "#e0ffe0",
          padding: "8px",
          color: "black",
          borderRadius: "6px",
          alignSelf: msg.sender === "bot" ? "flex-start" : "flex-end",
        }}
      >
        {msg.text}
      </div>
    ))}
  </div>

  {/* Input bar at bottom */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "10px",
      borderTop: "1px solid #ccc",
      gap: "8px",
    }}
  >
    <input
      type="text"
      placeholder="Type..."
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyPress}
      style={{
        flex: 1,
        padding: "8px",
        fontSize: "14px",
        color:"black",
        borderRadius: "5px",
        border: "1px solid #ccc",
      }}
    />
    <button
      onClick={()=>handleSend()}
      style={{
        background: "none",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
      }}
    >
      📨
    </button>
    <button
      onClick={startListening}
      style={{
        background: "none",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
      }}
    >
      🎤
    </button>
  </div>
</div>

        </div>
      )}
    </div>
  </>
);
}
