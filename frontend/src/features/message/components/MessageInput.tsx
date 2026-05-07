import React, { useState, useRef, useEffect } from "react";
import { RiSendPlane2Fill, RiImage2Line, RiCloseLine, RiLoader4Line, RiEmotionHappyLine } from "react-icons/ri";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { toast } from "react-toastify";
import { apiClient } from "../../../services/api/apiClient";
import { ENDPOINTS } from "../../../constants/endpoints";

interface MessageInputProps {
  onSend: (text: string, imageUrl?: string) => void;
  disabled: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled,
}) => {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onEmojiClick = (emojiObject: EmojiClickData) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size too large (max 5MB)");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if ((!text.trim() && !selectedFile) || disabled || isUploading) return;

    let imageUrl = undefined;
    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const response = await apiClient.post(ENDPOINTS.UPLOAD.CHAT_IMAGE, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        imageUrl = response.data.data.imageUrl;
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.error("Failed to upload image");
        setIsUploading(false);
        return;
      }
    }

    onSend(text, imageUrl);
    setText("");
    removeSelectedFile();
    setIsUploading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-footer position-relative">
      {showEmojiPicker && (
        <div
          ref={pickerRef}
          style={{
            position: "absolute",
            bottom: "100%",
            left: "10px",
            zIndex: 1000,
            marginBottom: "10px"
          }}
        >
          <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
        </div>
      )}
      {previewUrl && (
        <div className="p-2 border-bottom bg-light d-flex align-items-center gap-2">
          <div className="position-relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="rounded-3 border"
              style={{ width: "60px", height: "60px", objectFit: "cover" }}
            />
            <button
              className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger border-0"
              onClick={removeSelectedFile}
              style={{ padding: "4px" }}
            >
              <RiCloseLine size={12} />
            </button>
          </div>
          <div className="small text-muted flex-grow-1">
            {selectedFile?.name}
          </div>
        </div>
      )}
      <div className="chat-input-wrapper d-flex align-items-center gap-2 p-2">
        <input
          type="file"
          className="d-none"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <button
          className="btn btn-link text-muted p-2"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          disabled={disabled || isUploading}
          type="button"
        >
          <RiEmotionHappyLine size={24} />
        </button>
        <button
          className="btn btn-link text-muted p-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          type="button"
        >
          <RiImage2Line size={24} />
        </button>
        <textarea
          className="chat-input flex-grow-1 border-0 shadow-none"
          placeholder="Type a message..."
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled || isUploading}
          style={{ resize: "none", outline: "none" }}
        />
        <button
          className="chat-send-btn btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-2"
          onClick={handleSend}
          disabled={disabled || isUploading || (!text.trim() && !selectedFile)}
          style={{ width: "40px", height: "40px" }}
        >
          {isUploading ? (
            <RiLoader4Line className="animate-spin" size={20} />
          ) : (
            <RiSendPlane2Fill size={20} />
          )}
        </button>
      </div>
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
