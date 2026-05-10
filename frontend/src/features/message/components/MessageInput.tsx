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
    <div className="message-input-production position-relative">
      {showEmojiPicker && (
        <div
          ref={pickerRef}
          className="emoji-picker-container shadow-2xl"
          style={{
            position: "absolute",
            bottom: "100%",
            left: "0",
            zIndex: 1000,
            marginBottom: "12px",
            animation: "popIn 0.2s cubic-bezier(0, 0, 0.2, 1)"
          }}
        >
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            width={window.innerWidth < 400 ? 280 : 340} 
            height={380}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {previewUrl && (
        <div className="file-preview-pill p-2 mb-2 bg-light border d-flex align-items-center gap-3 animate-slide-up" 
             style={{ borderRadius: '14px', borderStyle: 'dashed' }}>
          <div className="position-relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="rounded-3 shadow-sm"
              style={{ width: "44px", height: "44px", objectFit: "cover" }}
            />
            <button
              className="position-absolute top-0 end-0 translate-middle btn btn-danger rounded-circle p-0 d-flex align-items-center justify-content-center"
              onClick={removeSelectedFile}
              style={{ width: "18px", height: "18px", fontSize: '10px', border: '2px solid #fff' }}
            >
              <RiCloseLine />
            </button>
          </div>
          <div className="small text-dark fw-bold text-truncate flex-grow-1">
            {selectedFile?.name}
          </div>
        </div>
      )}

      <div 
        className="composer-wrap d-flex align-items-end gap-2 p-2"
        style={{ 
          background: "#f1f5f9", 
          borderRadius: "24px",
          transition: 'all 0.2s'
        }}
      >
        <input
          type="file"
          className="d-none"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <div className="d-flex align-items-center mb-1 ps-1">
          <button
            className="btn-composer-action text-slate-500"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            disabled={disabled || isUploading}
            type="button"
          >
            <RiEmotionHappyLine size={22} />
          </button>
          <button
            className="btn-composer-action text-slate-500"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            type="button"
          >
            <RiImage2Line size={22} />
          </button>
        </div>

        <textarea
          className="composer-textarea flex-grow-1 border-0 bg-transparent py-2 px-1"
          placeholder="Message..."
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled || isUploading}
          style={{ 
            resize: "none", 
            outline: "none", 
            fontSize: "0.95rem", 
            maxHeight: "150px",
            lineHeight: "1.4",
            fontWeight: "500"
          }}
        />

        <button
          className={`btn-send-production d-flex align-items-center justify-content-center transition-all ${
            (!text.trim() && !selectedFile) ? 'disabled' : 'active'
          }`}
          onClick={handleSend}
          disabled={disabled || isUploading || (!text.trim() && !selectedFile)}
          style={{ width: "40px", height: "40px", flexShrink: 0, borderRadius: '14px' }}
        >
          {isUploading ? (
            <RiLoader4Line className="animate-spin" size={20} />
          ) : (
            <RiSendPlane2Fill size={20} />
          )}
        </button>
      </div>

      <style>{`
        .btn-composer-action {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
          border: none;
          background: transparent;
        }
        .btn-composer-action:hover { background: rgba(15, 23, 42, 0.05); color: var(--qw-accent) !important; }
        
        .btn-send-production {
          background: #3b82f6;
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .btn-send-production.disabled {
          background: #e2e8f0;
          color: #94a3b8;
          box-shadow: none;
          opacity: 0.5;
        }
        .btn-send-production.active:hover { transform: scale(1.05); background: #2563eb; }
        .btn-send-production.active:active { transform: scale(0.95); }
        
        .animate-slide-up { animation: slideUp 0.2s ease-out; }
        @keyframes popIn { from { opacity: 0; transform: scale(0.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .composer-textarea::-webkit-scrollbar { width: 0; }
        .composer-wrap:focus-within { background: #e2e8f0 !important; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }
      `}</style>
    </div>
  );;
};
