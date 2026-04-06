import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../hooks/useSocket";
import { useMessages } from "../hooks/useMessages";
import { ChatWindow } from "../components/chatwindow";
import { getMe } from "../../auth/services/authApi";
import { getConversations } from "../api/message.api";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

const MessagesPage = () => {
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchParams] = useSearchParams();

    const targetUserId = searchParams.get("userId");
    const targetUserName = searchParams.get("name");

    const token = localStorage.getItem("token");
    const socket = useSocket(token!);
    const { messages, sendMessage, loadMessages, loading: loadingMessages } = useMessages(socket, selectedConversationId);

    const fetchUser = useCallback(async () => {
        try {
            const response = await getMe();
            if (response.success) {
                setUser(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    }, []);

    const fetchConversations = useCallback(async () => {
        setLoadingConversations(true);
        try {
            const response = await getConversations();
            if (response.success) {
                setConversations(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
        fetchConversations();
    }, [fetchUser, fetchConversations]);

    // Normalize user ID — getMe() returns .id, conversations use ._id
    const currentUserId = user?.id || user?._id || "";

    // Handle auto-selection from query params
    useEffect(() => {
        if (!loadingConversations && targetUserId && currentUserId) {
            const existingConv = conversations.find(conv => 
                conv.participants.some((p: any) => p._id === targetUserId)
            );

            if (existingConv) {
                setSelectedConversationId(existingConv.id);
            } else if (targetUserName) {
                // Create a temporary "placeholder" conversation for the UI
                const placeholderId = `new-${targetUserId}`;
                const placeholderConv = {
                    id: placeholderId,
                    participants: [
                        { _id: currentUserId, name: user.name },
                        { _id: targetUserId, name: targetUserName }
                    ],
                    lastMessage: "Start a new conversation",
                    lastMessageAt: new Date(),
                    isPlaceholder: true
                };
                setConversations(prev => [placeholderConv, ...prev]);
                setSelectedConversationId(placeholderId);
            }
        }
    }, [loadingConversations, targetUserId, targetUserName, currentUserId]);

    // Handle real-time updates for conversation list (last message)
    useEffect(() => {
        if (!socket) return;
        const handleNewConversationMessage = (newMessage: any) => {
            // Update selectedConversationId if it matches the placeholder for this sender
            if (
                selectedConversationId?.startsWith("new-") && 
                selectedConversationId === `new-${newMessage.sender}`
            ) {
                setSelectedConversationId(newMessage.conversationId);
            }

            setConversations(prev => {
                const convExists = prev.some(c => c.id === newMessage.conversationId);
                
                if (!convExists && newMessage.conversationId) {
                    // New conversation created from a placeholder
                    fetchConversations();
                    return prev;
                }

                return prev.map(conv => {
                    const isMyPlaceholder = 
                        conv.isPlaceholder && 
                        conv.participants.some((p: any) => p._id === newMessage.sender);

                    if (conv.id === newMessage.conversationId || isMyPlaceholder) {
                        return {
                            ...conv,
                            id: newMessage.conversationId, // Update placeholder ID with real ID
                            isPlaceholder: false,
                            lastMessage: newMessage.message,
                            lastMessageAt: new Date(),
                        };
                    }
                    return conv;
                });
            });
        };
        socket.on("receiveMessage", handleNewConversationMessage);
        return () => {
            socket.off("receiveMessage", handleNewConversationMessage);
        };
    }, [socket, fetchConversations]);

    useEffect(() => {
        if (selectedConversationId && !selectedConversationId.startsWith('new-')) {
            loadMessages(selectedConversationId);
        }
    }, [selectedConversationId, loadMessages]);

    const activeConversation = conversations.find(c => c.id === selectedConversationId);
    
    // Extract other participant name and ID
    const getRecipientDetails = (conversation: any) => {
        if (!currentUserId || !conversation) return { name: "System", id: null };
        const recipient = conversation.participants.find((p: any) => p._id !== currentUserId);
        return {
            name: recipient?.name || "User",
            id: recipient?._id || null
        };
    };

    const recipient = getRecipientDetails(activeConversation);

    const filteredConversations = conversations.filter(c => {
        const otherParticipant = c.participants.find((p: any) => p._id !== currentUserId);
        return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading Profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4" style={{ height: 'calc(100vh - 100px)' }}>
            <div className="row g-4 h-100">
                {/* Conversations Sidebar */}
                <div className="col-12 col-md-4 col-lg-3 h-100">
                    <Sidebar 
                        conversations={filteredConversations}
                        activeConversationId={selectedConversationId}
                        onSelect={setSelectedConversationId}
                        loading={loadingConversations}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        getRecipientDetails={getRecipientDetails}
                    />
                </div>

                {/* Chat Window */}
                <div className="col-12 col-md-8 col-lg-9 h-100">
                    <ChatWindow
                        messages={selectedConversationId?.startsWith('new-') ? [] : messages}
                        loading={loadingMessages}
                        sendMessage={sendMessage}
                        receiverId={recipient.id}
                        currentUserId={currentUserId}
                        recipientName={recipient.name}
                    />
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;