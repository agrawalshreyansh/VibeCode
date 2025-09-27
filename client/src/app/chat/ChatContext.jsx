"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from "uuid";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// LocalStorage keys
const STORAGE_KEYS = {
    CONVERSATIONS: 'chat_conversations',
    MESSAGES: 'chat_messages',
    CURRENT_CHAT: 'current_chat_id',
    CONTEXT: 'chat_context',
    SUMMARY: 'chat_summary'
};

// localStorage utility functions
const localStorageUtils = {
    // Get all conversations
    getConversations() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading conversations from localStorage:', error);
            return [];
        }
    },

    // Save conversations
    saveConversations(conversations) {
        try {
            localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
        } catch (error) {
            console.error('Error saving conversations to localStorage:', error);
        }
    },

    // Get messages for a specific chat
    getMessages(chatId) {
        try {
            const key = `${STORAGE_KEYS.MESSAGES}_${chatId}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading messages from localStorage:', error);
            return [];
        }
    },

    // Save messages for a specific chat
    saveMessages(chatId, messages) {
        try {
            const key = `${STORAGE_KEYS.MESSAGES}_${chatId}`;
            localStorage.setItem(key, JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving messages to localStorage:', error);
        }
    },

    // Get context for a specific chat
    getContext(chatId) {
        try {
            const key = `${STORAGE_KEYS.CONTEXT}_${chatId}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading context from localStorage:', error);
            return null;
        }
    },

    // Save context for a specific chat
    saveContext(chatId, context) {
        try {
            const key = `${STORAGE_KEYS.CONTEXT}_${chatId}`;
            localStorage.setItem(key, JSON.stringify(context));
        } catch (error) {
            console.error('Error saving context to localStorage:', error);
        }
    },

    // Get summary for a specific chat
    getSummary(chatId) {
        try {
            const key = `${STORAGE_KEYS.SUMMARY}_${chatId}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading summary from localStorage:', error);
            return null;
        }
    },

    // Save summary for a specific chat
    saveSummary(chatId, summary) {
        try {
            const key = `${STORAGE_KEYS.SUMMARY}_${chatId}`;
            localStorage.setItem(key, JSON.stringify(summary));
        } catch (error) {
            console.error('Error saving summary to localStorage:', error);
        }
    },

    // Create a new conversation
    createConversation(title = null) {
        const chatId = uuidv4();
        const newConversation = {
            id: chatId,
            title: title || `Chat ${Date.now()}`,
            last_snippet: '',
            unread_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const conversations = this.getConversations();
        const updatedConversations = [newConversation, ...conversations];
        this.saveConversations(updatedConversations);

        // Initialize empty messages for this chat
        this.saveMessages(chatId, []);

        return newConversation;
    },

    // Update conversation (title, snippet, etc.)
    updateConversation(chatId, updates) {
        const conversations = this.getConversations();
        const updatedConversations = conversations.map(conv => 
            conv.id === chatId 
                ? { ...conv, ...updates, updated_at: new Date().toISOString() }
                : conv
        );
        this.saveConversations(updatedConversations);
        return updatedConversations.find(conv => conv.id === chatId);
    },

    // Delete a conversation and its messages
    deleteConversation(chatId) {
        // Remove from conversations list
        const conversations = this.getConversations();
        const filteredConversations = conversations.filter(conv => conv.id !== chatId);
        this.saveConversations(filteredConversations);

        // Remove messages, context, and summary
        try {
            const messageKey = `${STORAGE_KEYS.MESSAGES}_${chatId}`;
            const contextKey = `${STORAGE_KEYS.CONTEXT}_${chatId}`;
            const summaryKey = `${STORAGE_KEYS.SUMMARY}_${chatId}`;
            
            localStorage.removeItem(messageKey);
            localStorage.removeItem(contextKey);
            localStorage.removeItem(summaryKey);
        } catch (error) {
            console.error('Error removing chat data from localStorage:', error);
        }

        return filteredConversations;
    },

    // Generate a bot response from API
    async generateBotResponse(userMessage, chatId) {
        try {
            // Get previous summary and context from localStorage
            const previousSummary = this.getSummary(chatId) || "This is a new conversation.";
            const userContext = this.getContext(chatId) || "No previous context available.";

            const response = await fetch(`https://vibecode-ytth.onrender.com/send_prompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    prompt: userMessage, 
                    previous_summary: previousSummary, 
                    user_context: userContext 
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('API response data:', data);

            // Save new context and summary if provided
            if (data.new_context) {
                this.saveContext(chatId, data.new_context);
            }
            if (data.summary) {
                this.saveSummary(chatId, data.summary);
            }
            
            return {
                id: uuidv4(),
                sender: 'bot',
                content: data.response || data.message || "I'm sorry, I couldn't process that request.",
                timestamp: new Date().toISOString(),
                metadata: {
                    ...data.metadata,
                    new_context: data.new_context,
                    summary: data.summary
                }
            };
        } catch (error) {
            console.error('Error getting bot response from API:', error);
            
            // Fallback to local response if API fails
            const fallbackResponses = [
                "I'm sorry, I'm having trouble connecting right now. Please try again.",
                "There seems to be a connection issue. Let me try to help you anyway - could you rephrase that?",
                "I'm experiencing some technical difficulties. Please try your message again in a moment."
            ];
            
            return {
                id: uuidv4(),
                sender: 'bot',
                content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
                timestamp: new Date().toISOString(),
                isOffline: true
            };
        }
    },

    // Initialize with demo conversations if none exist
    initializeDemoData() {
        const conversations = this.getConversations();
        if (conversations.length === 0) {
            // Create a welcome conversation with sample messages
            const welcomeChat = this.createConversation("Welcome to MoodMate");
            
            const sampleMessages = [
                {
                    id: uuidv4(),
                    sender: 'bot',
                    content: "Hello! Welcome to MoodMate. I'm here to listen and support you. How are you feeling today?",
                    timestamp: new Date().toISOString(),
                },
            ];
            
            this.saveMessages(welcomeChat.id, sampleMessages);
            
            // Update conversation snippet
            this.updateConversation(welcomeChat.id, {
                last_snippet: "Hello! Welcome to MoodMate..."
            });
        }
    }
};

export const ChatProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiStatus, setApiStatus] = useState('unknown'); // 'online', 'offline', 'unknown'

    // 1. Load all existing conversations from localStorage
    const loadConversations = useCallback(() => {
        try {
            // Initialize demo data if needed
            localStorageUtils.initializeDemoData();
            
            const data = localStorageUtils.getConversations();
            setConversations(data);
            
            // Set current chat from localStorage or first available
            const savedChatId = localStorage.getItem(STORAGE_KEYS.CURRENT_CHAT);
            if (savedChatId && data.find(conv => conv.id === savedChatId)) {
                setCurrentChatId(savedChatId);
            } else if (data.length > 0 && !currentChatId) {
                setCurrentChatId(data[0].id);
                localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, data[0].id);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }, [currentChatId]);

    // Initial load
    useEffect(() => {
        loadConversations();
        checkApiStatus(); // Check API availability on load
    }, [loadConversations]);

    // Check API status
    const checkApiStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`, {
                method: 'GET',
                timeout: 5000
            });
            setApiStatus(response.ok ? 'online' : 'offline');
        } catch (error) {
            setApiStatus('offline');
            console.warn('API is offline, using fallback responses');
        }
    };

    // 2. Load messages for current chat
    const loadMessages = useCallback((chatId) => {
        if (!chatId) {
            setMessages([]);
            return;
        }
        setIsLoading(true);
        try {
            const data = localStorageUtils.getMessages(chatId);
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

    // 3. Switching between chats
    const switchChat = (chatId) => {
        setCurrentChatId(chatId);
        localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, chatId);
    };

    // 4. Send new message and get bot response from API
    const sendNewMessage = async (content) => {
        if (!currentChatId || !content.trim()) return;

        const userMessage = {
            id: uuidv4(),
            sender: 'user',
            content: content.trim(),
            timestamp: new Date().toISOString(),
        };

        // Immediately add user message to UI and localStorage
        const currentMessages = localStorageUtils.getMessages(currentChatId);
        const updatedMessagesWithUser = [...currentMessages, userMessage];
        localStorageUtils.saveMessages(currentChatId, updatedMessagesWithUser);
        setMessages(updatedMessagesWithUser);

        // Update conversation snippet
        const snippet = content.length > 50 ? content.substring(0, 50) + '...' : content;
        const updatedConv = localStorageUtils.updateConversation(currentChatId, {
            last_snippet: snippet,
            unread_count: 0
        });
        setConversations(prev => prev.map(conv => 
            conv.id === currentChatId ? updatedConv : conv
        ));

        // Show loading state
        setIsLoading(true);

        try {
            // Get bot response from API
            const botMessage = await localStorageUtils.generateBotResponse(content, currentChatId);
            
            // Add bot response to localStorage and UI
            const finalMessages = [...updatedMessagesWithUser, botMessage];
            localStorageUtils.saveMessages(currentChatId, finalMessages);
            setMessages(finalMessages);

            // Update conversation with bot's response snippet if it's more recent
            if (botMessage.content.length > 0) {
                const botSnippet = botMessage.content.length > 50 
                    ? botMessage.content.substring(0, 50) + '...' 
                    : botMessage.content;
                    
                const finalConv = localStorageUtils.updateConversation(currentChatId, {
                    last_snippet: `Bot: ${botSnippet}`,
                    unread_count: 0
                });
                setConversations(prev => prev.map(conv => 
                    conv.id === currentChatId ? finalConv : conv
                ));
            }
        } catch (error) {
            console.error('Error in sendNewMessage:', error);
            // Error handling is already done in generateBotResponse
        } finally {
            setIsLoading(false);
        }
    };

    // 5. Start a fresh conversation
    const startNewChat = () => {
        try {
            const newChat = localStorageUtils.createConversation();
            
            // Update state
            setConversations(prev => [newChat, ...prev]);
            setCurrentChatId(newChat.id);
            localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, newChat.id);
            setMessages([]);
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    };

    // 6. Delete a conversation
    const deleteChat = (chatId) => {
        try {
            const updatedConversations = localStorageUtils.deleteConversation(chatId);
            setConversations(updatedConversations);

            // If we deleted the current chat, switch to another one or clear
            if (currentChatId === chatId) {
                if (updatedConversations.length > 0) {
                    const newChatId = updatedConversations[0].id;
                    setCurrentChatId(newChatId);
                    localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, newChatId);
                } else {
                    setCurrentChatId(null);
                    localStorage.removeItem(STORAGE_KEYS.CURRENT_CHAT);
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    // 7. Update conversation title
    const updateChatTitle = (chatId, newTitle) => {
        try {
            const updatedConv = localStorageUtils.updateConversation(chatId, { title: newTitle });
            setConversations(prev => prev.map(conv => 
                conv.id === chatId ? updatedConv : conv
            ));
        } catch (error) {
            console.error('Error updating chat title:', error);
        }
    };

    // 8. Clear all data (for testing/reset purposes)
    const clearAllData = () => {
        if (window.confirm('Are you sure you want to delete ALL conversations and messages? This cannot be undone.')) {
            try {
                // Clear localStorage
                Object.values(STORAGE_KEYS).forEach(key => {
                    localStorage.removeItem(key);
                });
                
                // Clear all message, context, and summary keys
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(STORAGE_KEYS.MESSAGES) || 
                        key.startsWith(STORAGE_KEYS.CONTEXT) || 
                        key.startsWith(STORAGE_KEYS.SUMMARY)) {
                        localStorage.removeItem(key);
                    }
                });
                
                // Reset state
                setConversations([]);
                setCurrentChatId(null);
                setMessages([]);
                
                // Reinitialize with demo data
                localStorageUtils.initializeDemoData();
                loadConversations();
            } catch (error) {
                console.error('Error clearing data:', error);
            }
        }
    };

    // 9. Retry failed message (for offline scenarios)
    const retryMessage = async (messageId) => {
        const currentMessages = messages;
        const messageIndex = currentMessages.findIndex(msg => msg.id === messageId);
        
        if (messageIndex === -1) return;
        
        const userMessage = currentMessages[messageIndex];
        if (userMessage.sender !== 'user') return;

        setIsLoading(true);
        
        try {
            // Try to get bot response again
            const botMessage = await localStorageUtils.generateBotResponse(userMessage.content, currentChatId);
            
            // Replace or add the bot message
            const updatedMessages = [...currentMessages];
            if (messageIndex + 1 < currentMessages.length && currentMessages[messageIndex + 1].sender === 'bot') {
                // Replace existing bot response
                updatedMessages[messageIndex + 1] = botMessage;
            } else {
                // Add new bot response
                updatedMessages.splice(messageIndex + 1, 0, botMessage);
            }
            
            localStorageUtils.saveMessages(currentChatId, updatedMessages);
            setMessages(updatedMessages);
        } catch (error) {
            console.error('Error retrying message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 10. Export data for backup
    const exportData = () => {
        try {
            const conversations = localStorageUtils.getConversations();
            const messagesData = {};
            const contextData = {};
            const summaryData = {};
            
            conversations.forEach(conv => {
                messagesData[conv.id] = localStorageUtils.getMessages(conv.id);
                contextData[conv.id] = localStorageUtils.getContext(conv.id);
                summaryData[conv.id] = localStorageUtils.getSummary(conv.id);
            });
            
            const exportData = {
                conversations,
                messages: messagesData,
                context: contextData,
                summary: summaryData,
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `moodmate-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    const value = {
        conversations,
        currentChatId,
        messages,
        isLoading,
        apiStatus,
        switchChat,
        sendNewMessage,
        startNewChat,
        deleteChat,
        updateChatTitle,
        retryMessage,
        clearAllData,
        exportData,
        checkApiStatus,
        loadConversations,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};