import { motion } from "framer-motion";

interface ChatMessageProps {
  message: string;
  sender: "user" | "system";
  animate?: boolean;
}

export default function ChatMessage({ message, sender, animate = false }: ChatMessageProps) {
  const isUser = sender === "user";
  
  const bubbleClass = isUser
    ? "chat-bubble-user ml-auto"
    : "chat-bubble-system";
  
  const containerClass = isUser
    ? "flex items-end justify-end"
    : "flex items-start";
  
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      }
    : {};
  
  return (
    <motion.div 
      className={`${containerClass} ${isUser ? 'animate-slide-in mt-2' : 'animate-slide-in mt-2'}`}
      {...animationProps}
    >
      <div className={bubbleClass}>
        <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
      </div>
    </motion.div>
  );
}
