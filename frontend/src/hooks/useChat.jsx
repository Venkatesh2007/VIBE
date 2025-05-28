import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();



// const commandActions = {
//   openYouTube: () => window.open("https://www.youtube.com", "_blank"),
//   playMusic: () => window.open("https://open.spotify.com/", "_blank"),
//   // playMusic: () => {
//   //   const audio = new Audio("/music.mp3"); // Ensure music.mp3 is in the public folder
//   //   audio.play();
//   // },
//   // Add more command actions as needed
// };
const commandActions = {
  openYouTube: (params) => window.open(params.query ? `https://www.youtube.com/results?search_query=${encodeURIComponent(params.query)}` : "https://www.youtube.com", "_blank"),
  playmusic: (params) => window.open(params.query ? `https://open.spotify.com/search/${encodeURIComponent(params.query)}` : "https://open.spotify.com", "_blank"),
  openGoogle: (params) => window.open(params.query ? `https://www.google.com/search?q=${encodeURIComponent(params.query)}` : "https://www.google.com", "_blank"),
  openai: (params) => {
    const platform = params.platform || "chatgpt";
    const urls = { chatgpt: "https://chat.openai.com", gemini: "https://gemini.google.com" };
    window.open(urls[platform] || "https://chat.openai.com", "_blank");
  },
  sendmail: (params) => window.open(`mailto:${params.recipient || ''}?subject=${encodeURIComponent(params.subject || '')}`, "_blank"),
  openinsta: () => window.open("https://www.instagram.com", "_blank"),
  openWhatsApp: () => window.open("https://web.whatsapp.com", "_blank")
};

export const ChatProvider = ({ children }) => {
  const [isVIP, setIsVIP] = useState(false);
  const toggleVIPMode = () => {
    setIsVIP((prev) => !prev);
    console.log("IsVip: "+!isVIP);
  };

  const chat = async (message) => {
    setLoading(true);
    const vipPrompt = "Note: You are addressing a highly esteemed and distinguished guest. Your response should begin with an elegant and warm greeting, offering genuine admiration and deep respect. Use refined, courteous language and include sincere praise that acknowledges their remarkable achievements and status. Speak with formality, grace, and an unmistakable sense of appreciation. ";
    const normalPrompt = "respond in a fun, caring, and engaging way. Your personality is like a close friend—playful, supportive, and sometimes a little teasing. Your responses should feel like real conversations between Indian teenagers, full of natural slang and casual chatting. Avoid generic chatbot dialogues and make the conversation fresh, relatable, and engaging.";
    const prompt = isVIP ? vipPrompt : normalPrompt;
    message = `${prompt} ${message} NOTE:*Always reply in JSON objects with 3 messages.*`;
    const data = await fetch(`${backendUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    // const resp = (await data.json()).messages;
    // setMessages((messages) => [...messages, ...resp]);


    const resp = await data.json();
    setMessages((messages) => [...messages, ...resp.messages]);
    // Execute command if detected
    // if (resp.command && commandActions[resp.command]) {
    //   commandActions[resp.command]();
    // }
    // Handle command execution
    if (resp.command && commandActions[resp.command]) {
      commandActions[resp.command](resp.params);
    }




    setLoading(false);
  };
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };


  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        isVIP,
        toggleVIPMode,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
