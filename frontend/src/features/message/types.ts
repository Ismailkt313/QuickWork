export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image";
  createdAt: string;
}

export interface Participant {
  id?: string;
  _id?: string;
  name: string;
  role?: string;
}

export interface Conversation {
  unreadCount: number;
  id: string;
  participants: Participant[];
  lastMessage?: string;
  lastMessageAt?: string | Date;
  updatedAt?: string;
  isPlaceholder?: boolean;
}
