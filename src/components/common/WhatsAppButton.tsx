import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/919578059813"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 left-4 z-40 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-full p-3.5 shadow-lg transition-transform hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} fill="white" />
    </a>
  );
};

export default WhatsAppButton;
