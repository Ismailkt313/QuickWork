import React, { useState } from 'react';
import { RiSendPlane2Fill } from "react-icons/ri";

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-footer">
      <div className="chat-input-wrapper">
        <textarea
          className="chat-input"
          placeholder="Type a message..."
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled}
        />
        <button 
          className="chat-send-btn" 
          onClick={handleSend}
          disabled={disabled || !text.trim()}
        >
          <RiSendPlane2Fill size={20} />
        </button>
      </div>
    </div>
  );
};
