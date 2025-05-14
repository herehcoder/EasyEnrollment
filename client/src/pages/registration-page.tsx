import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Send, PaperclipIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "@/components/chat-message";
import { getRandomResponse, delay } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function RegistrationPage() {
  const [location, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; sender: "user" | "system" }>>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Simulate initial system messages on first load
  useEffect(() => {
    const loadInitialMessages = async () => {
      setMessages([
        { 
          text: "Olá! Bem-vindo(a) ao EasyMatrícula. Sou seu assistente virtual e estou aqui para ajudar no processo de matrícula. Vamos começar? 😊", 
          sender: "system" 
        }
      ]);
      
      setIsTyping(true);
      await delay(1500);
      setIsTyping(false);
      
      setMessages(prev => [
        ...prev,
        { 
          text: "Por favor, selecione uma opção:", 
          sender: "system" 
        }
      ]);
    };
    
    loadInitialMessages();
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage = { text: message, sender: "user" as const };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate AI response delay
    await delay(1000 + Math.random() * 1000);
    setIsTyping(false);
    
    // Check if user wants to start registration
    if (
      message.toLowerCase().includes("matrícula") || 
      message.toLowerCase().includes("matricula") ||
      message.toLowerCase().includes("iniciar") ||
      message.toLowerCase().includes("começar") ||
      message.toLowerCase().includes("comecar")
    ) {
      setMessages(prev => [
        ...prev,
        { 
          text: "Ótimo! Vamos iniciar seu processo de matrícula. Por favor, preencha o formulário a seguir com suas informações.", 
          sender: "system" 
        }
      ]);
      
      // Redirect to form after a short delay
      setTimeout(() => navigate("/form/1"), 1500);
    } else {
      // Generate AI response
      const aiResponse = getRandomResponse(message);
      setMessages(prev => [...prev, { text: aiResponse, sender: "system" }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleGoBack = () => {
    navigate("/auth");
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <motion.header 
        className="bg-primary text-white px-4 py-3 flex items-center shadow-md"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleGoBack}
            className="mr-2 text-white hover:bg-primary/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary text-xl material-icons">school</span>
            </div>
            <div className="ml-3">
              <h1 className="font-medium">EasyMatrícula</h1>
              <p className="text-xs opacity-75">Assistente de matrícula online</p>
            </div>
          </div>
        </div>
      </motion.header>
      
      {/* Chat Interface */}
      <div 
        className="flex-1 overflow-hidden flex flex-col bg-[url('https://img.freepik.com/free-vector/abstract-white-shapes-background_79603-1362.jpg')] bg-cover bg-center bg-fixed"
      >
        <motion.div 
          className="chat-container flex-1 overflow-y-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col space-y-4">
            {messages.map((msg, index) => (
              <ChatMessage 
                key={index} 
                message={msg.text} 
                sender={msg.sender}
                animate={true}
              />
            ))}
            
            {isTyping && (
              <div className="flex items-start">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Input area */}
        <motion.div 
          className="bg-white p-3 border-t"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <PaperclipIcon className="h-5 w-5" />
            </Button>
            <Input
              type="text"
              placeholder="Digite uma mensagem"
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button 
              size="icon"
              className="ml-2 bg-primary hover:bg-[hsl(var(--whatsapp-light-green))] text-white"
              onClick={handleSendMessage}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
