import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, PaperclipIcon } from "lucide-react";
import ChatMessage from "@/components/chat-message";
import { getRandomResponse, delay } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChatAssistantProps {
  onStartRegistration: () => void;
}

export default function ChatAssistant({ onStartRegistration }: ChatAssistantProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; sender: "user" | "system" }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Initial messages
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
          text: "Por favor, selecione uma opção ou digite sua dúvida:", 
          sender: "system" 
        }
      ]);
    };
    
    loadInitialMessages();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage = { text: message, sender: "user" as const };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setShowOptions(false);
    
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
      
      // Start registration after a short delay
      setTimeout(onStartRegistration, 1500);
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
  
  const handleOptionClick = (option: string) => {
    // Add user message
    setMessages(prev => [...prev, { text: option, sender: "user" }]);
    setShowOptions(false);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Handle different options
    setTimeout(async () => {
      setIsTyping(false);
      
      if (option === "Iniciar nova matrícula") {
        setMessages(prev => [
          ...prev,
          { 
            text: "Ótimo! Vamos iniciar seu processo de matrícula. Por favor, preencha o formulário a seguir com suas informações.", 
            sender: "system" 
          }
        ]);
        
        // Start registration after a short delay
        setTimeout(onStartRegistration, 1500);
      } else if (option === "Continuar matrícula em andamento") {
        setMessages(prev => [
          ...prev,
          { 
            text: "Para continuar uma matrícula existente, precisamos do seu número de protocolo ou CPF. Você poderia informar um desses dados?", 
            sender: "system" 
          }
        ]);
      } else if (option === "Dúvidas sobre o processo") {
        setMessages(prev => [
          ...prev,
          { 
            text: "Ficarei feliz em esclarecer qualquer dúvida sobre o processo de matrícula. O que você gostaria de saber? Posso ajudar com informações sobre documentos necessários, prazos, valores, bolsas de estudo e muito mais.", 
            sender: "system" 
          }
        ]);
      }
    }, 1500);
  };
  
  return (
    <>
      <div 
        ref={chatContainerRef}
        className="chat-container flex-1 overflow-y-auto p-4"
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
          
          {/* Options buttons after initial messages */}
          {messages.length === 2 && showOptions && (
            <motion.div 
              className="flex items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
                <div className="flex flex-col space-y-2">
                  <Button 
                    className="bg-primary hover:bg-[hsl(var(--whatsapp-light-green))] text-white px-4 py-2 rounded-full text-sm text-left transition-all justify-start"
                    onClick={() => handleOptionClick("Iniciar nova matrícula")}
                  >
                    Iniciar nova matrícula
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-[hsl(var(--whatsapp-light-green))] text-white px-4 py-2 rounded-full text-sm text-left transition-all justify-start"
                    onClick={() => handleOptionClick("Continuar matrícula em andamento")}
                  >
                    Continuar matrícula em andamento
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-[hsl(var(--whatsapp-light-green))] text-white px-4 py-2 rounded-full text-sm text-left transition-all justify-start"
                    onClick={() => handleOptionClick("Dúvidas sobre o processo")}
                  >
                    Dúvidas sobre o processo
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
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
      </div>
      
      {/* Input area */}
      <div className="bg-white p-3 border-t">
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
      </div>
    </>
  );
}
