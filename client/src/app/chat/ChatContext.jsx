// ChatContext.js
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

// --- API Service Functions (MOCK) ---
// REPLACE 'http://localhost:8000' with your actual FastAPI URL
const API_BASE_URL = 'http://localhost:8000'; 

// Data structure assumed from backend:
// Conversation: { id: str, title: str, messages: array }
// Message: { id: str, sender: 'user' | 'bot', content: str, timestamp: str }

const api = {
    async fetchConversations() {
        // Assume API returns: [{ id, title, last_snippet, unread_count }]
        const response = await fetch(`${API_BASE_URL}/conversations`);
        if (!response.ok) throw new Error('Failed to fetch conversations');
        return response.json();
    },
    async fetchMessages(chatId) {
        // Assume API returns: [{ id, sender, content, timestamp }]
        const response = await fetch(`${API_BASE_URL}/conversations/${chatId}/messages`);
        if (!response.ok) throw new Error(`Failed to fetch messages for ${chatId}`);
        return response.json();
    },
    async createConversation() {
        // Assume API returns: { id, title, messages: [] }
        const response = await fetch(`${API_BASE_URL}/conversations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initial_title: 'New Conversation' }), // Example body
        });
        if (!response.ok) throw new Error('Failed to create new conversation');
        return response.json();
    },
    async deleteConversation(chatId) {
        const response = await fetch(`${API_BASE_URL}/conversations/${chatId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete conversation');
        // FastAPI might return a 204 No Content or success message
        return true; 
    },
    async sendMessage(chatId, content) {
        // Assume API returns the bot's response and potentially the user message if needed
        const response = await fetch(`${API_BASE_URL}/conversations/${chatId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) throw new Error('Failed to send message');
        // Assume returns: { user_message: {...}, bot_message: {...} }
        return response.json(); 
    },
};

export const ChatProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Load all existing conversations
    const loadConversations = useCallback(async () => {
        try {
            const data = await api.fetchConversations();
            setConversations(data);
            if (data.length > 0 && !currentChatId) {
                // Set the first conversation as active initially
                setCurrentChatId(data[0].id);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            // Handle UI error (e.g., show a toast)
        }
    }, [currentChatId]);

    // Initial load
    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Load messages for the active conversation
    const loadMessages = useCallback(async (chatId) => {
        if (!chatId) {
            setMessages([]);
            return;
        }
        setIsLoading(true);
        try {
            const data = await api.fetchMessages(chatId);
            setMessages(data);
        } catch (error) {
            console.error(`Error loading messages for ${chatId}:`, error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMessages(currentChatId);
    }, [currentChatId, loadMessages]);

    // 2. Switching between chats
    const switchChat = (chatId) => {
        setCurrentChatId(chatId);
    };

    // 3. Store new messages
    const sendNewMessage = async (content) => {
        if (!currentChatId || !content.trim()) return;

        const userMessage = {
            id: Date.now().toString(), // Temp ID for immediate display
            sender: 'user',
            content,
            timestamp: new Date().toISOString(),
        };

        // Optimistically update UI with user message
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await api.sendMessage(currentChatId, content);
            
            // Assuming response contains user_message and bot_message
            const newMessages = [
                response.user_message, 
                response.bot_message,
            ];

            // Replace temp user message and add bot response
            setMessages(prev => {
                const updated = prev.filter(msg => msg.id !== userMessage.id);
                return [...updated, ...newMessages];
            });
            // Re-fetch conversations to update title/snippet if the backend generates one
            loadConversations(); 

        } catch (error) {
            console.error('Error sending message:', error);
            // Revert optimistic update or show error
            setMessages(prev => prev.filter(msg => msg.id !== userMessage.id)); 
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Start a fresh conversation
    const startNewChat = async () => {
        try {
            const newChat = await api.createConversation();
            // Add to conversations list and make it active
            setConversations(prev => [newChat, ...prev]);
            setCurrentChatId(newChat.id);
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    };

    // 5. Delete a conversation
    const deleteChat = async (chatId) => {
        try {
            await api.deleteConversation(chatId);
            
            // Remove from state
            setConversations(prev => prev.filter(c => c.id !== chatId));

            // If the deleted chat was the active one, switch to the first remaining chat
            if (chatId === currentChatId) {
                const remaining = conversations.filter(c => c.id !== chatId);
                setCurrentChatId(remaining.length > 0 ? remaining[0].id : null);
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };


    const value = {
        conversations,
        currentChatId,
        messages,
        isLoading,
        switchChat,
        sendNewMessage,
        startNewChat,
        deleteChat,
        loadConversations,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};