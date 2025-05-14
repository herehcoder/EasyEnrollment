import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Send, PaperclipIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "@/components/chat-message";
import { getRandomResponse, delay } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type ChatMessageType = {
  text: string;
  sender: "user" | "system";
};

export default function ChatPage() {
  const [location, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [registrationStarted, setRegistrationStarted] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);

  const chatMessageMutation = useMutation({
    mutationFn: async (data: { sender: string; message: string; studentId?: number }) => {
      const res = await apiRequest("POST", "/api/chat-messages", data);
      return res.json();
    }
  });

  // Simulate initial system messages on first load
  useEffect(() => {
    const loadInitialMessages = async () => {
      const initialMessage = { 
        text: "Olá! Bem-vindo(a) ao EasyMatrícula. Sou seu assistente virtual e estou aqui para ajudar no processo de matrícula. Vamos começar? 😊", 
        sender: "system" as const
      };
      
      setMessages([initialMessage]);
      
      // Save message to backend
      chatMessageMutation.mutate({
        sender: "system",
        message: initialMessage.text,
        studentId: studentId || undefined
      });
      
      setIsTyping(true);
      await delay(1500);
      setIsTyping(false);
      
      const optionsMessage = { 
        text: "Por favor, selecione uma opção ou digite sua dúvida:", 
        sender: "system" as const
      };
      
      setMessages(prev => [...prev, optionsMessage]);
      
      // Save message to backend
      chatMessageMutation.mutate({
        sender: "system",
        message: optionsMessage.text,
        studentId: studentId || undefined
      });
    };
    
    loadInitialMessages();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage = { text: message, sender: "user" as const };
    setMessages(prev => [...prev, userMessage]);
    
    // Save message to backend
    chatMessageMutation.mutate({
      sender: "user",
      message: userMessage.text,
      studentId: studentId || undefined
    });
    
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
      const response = { 
        text: "Ótimo! Vamos iniciar seu processo de matrícula. Por favor, preencha o formulário a seguir com suas informações.", 
        sender: "system" as const
      };
      
      setMessages(prev => [...prev, response]);
      
      // Save message to backend
      chatMessageMutation.mutate({
        sender: "system",
        message: response.text,
        studentId: studentId || undefined
      });
      
      setRegistrationStarted(true);
      
      // Redirect to form after a short delay
      setTimeout(() => navigate("/form/1"), 1500);
    } else {
      // Generate AI response
      const aiResponse = getRandomResponse(message);
      const response = { text: aiResponse, sender: "system" as const };
      
      setMessages(prev => [...prev, response]);
      
      // Save message to backend
      chatMessageMutation.mutate({
        sender: "system",
        message: response.text,
        studentId: studentId || undefined
      });
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

  const handleStartRegistration = () => {
    setRegistrationStarted(true);
    navigate("/form/1");
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
              <span className="text-primary text-xl font-bold">EM</span>
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
          ref={chatContainerRef}
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
            
            {/* Options buttons after initial messages */}
            {messages.length === 2 && !registrationStarted && (
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
                      onClick={handleStartRegistration}
                    >
                      Iniciar nova matrícula
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-[hsl(var(--whatsapp-light-green))] text-white px-4 py-2 rounded-full text-sm text-left transition-all justify-start"
                      onClick={() => {
                        setMessages(prev => [
                          ...prev, 
                          { text: "Continuar matrícula em andamento", sender: "user" },
                          { text: "Para continuar uma matrícula existente, precisamos do seu número de protocolo ou CPF. Você poderia informar um desses dados?", sender: "system" }
                        ]);
                      }}
                    >
                      Continuar matrícula em andamento
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-[hsl(var(--whatsapp-light-green))] text-white px-4 py-2 rounded-full text-sm text-left transition-all justify-start"
                      onClick={() => {
                        setMessages(prev => [
                          ...prev, 
                          { text: "Dúvidas sobre o processo", sender: "user" },
                          { text: "Ficarei feliz em esclarecer qualquer dúvida sobre o processo de matrícula. O que você gostaria de saber? Posso ajudar com informações sobre documentos necessários, prazos, valores, bolsas de estudo e muito mais.", sender: "system" }
                        ]);
                      }}
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
