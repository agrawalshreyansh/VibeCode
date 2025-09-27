// ChatSection.js (Full Dynamic Version)
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, CheckCircle, Headphones, Download, Mic, Image, Paperclip, Smile, Search, Plus, Trash2 } from 'lucide-react'; 
import { useChat } from './ChatContext'; // Import the context hook

// --- Custom Dynamic Content Components (Keep these for visual fidelity) ---
// (Omitted for brevity, assume EmotionScoreGraph and AudioMessage are defined here or imported)
const EmotionScoreGraph = () => (/* ... */ <div className="p-4 bg-gray-100 rounded-xl">Emotion Score Graph Placeholder</div>);
const AudioMessage = () => (/* ... */ <div className="p-3 bg-orange-600 text-white rounded-xl">Audio Message Placeholder</div>);


// --- Conversation List Item Component (Dynamic) ---
const ConversationItem = ({ item, isActive, switchChat, deleteChat }) => {
    return (
        <div 
            className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 group relative ${
                isActive 
                    ? 'bg-orange-100 border-l-4 border-orange-500 -ml-1' 
                    : 'hover:bg-gray-50'
            }`}
            onClick={() => switchChat(item.id)}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 text-sm font-semibold ${
                isActive ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'
            }`}>
                {item.title ? item.title.charAt(0) : 'N'}
            </div>

            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-orange-900' : 'text-gray-800'}`}>
                    {item.title || 'New Chat'}
                </p>
                <p className={`text-xs truncate ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
                    {item.last_snippet || 'No messages yet...'}
                </p>
            </div>
            
            {/* Delete Button - Appears on hover */}
            <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 bg-white rounded-full opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent switching chat when deleting
                    if (window.confirm(`Are you sure you want to delete "${item.title || 'this chat'}"?`)) {
                        deleteChat(item.id);
                    }
                }}
                title="Delete Chat"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

// --- Main Chat Component ---
export default function ChatSection() {
    const { 
        conversations, 
        currentChatId, 
        messages, 
        isLoading, 
        switchChat, 
        sendNewMessage, 
        startNewChat, 
        deleteChat 
    } = useChat();
    
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    const currentChat = conversations.find(c => c.id === currentChatId);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
    useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

    const handleSend = () => {
        if (!inputText.trim() || !currentChatId) return;
        sendNewMessage(inputText);
        setInputText('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Helper to render message content (kept from previous code)
    const renderMessageContent = (msg) => {
        if (msg.sender === 'dynamic') {
            if (msg.content === 'graph') return <EmotionScoreGraph />;
            if (msg.content === 'audio') return <AudioMessage />;
        }
        
        const isUser = msg.sender === 'user';
        const bubbleClasses = `max-w-xl p-3 rounded-2xl shadow-md ${
          isUser 
            ? 'bg-orange-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
        }`;
        
        return (
            <div className={bubbleClasses}>
                {!isUser && (
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-amber-800">MoodMate</span>
                  </div>
                )}
                <p className="whitespace-pre-line">{msg.content}</p>
                <p className={`text-xs mt-1 ${isUser ? 'text-white/80' : 'text-gray-400'} text-right`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </p>
            </div>
        );
    };

    return (
        <div className="flex h-full w-full">
            {/* Conversation List Sidebar (Left Panel) */}
            <div className="w-80 bg-white p-4 flex flex-col rounded-l-3xl shadow-xl border-r border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 mt-4">All Conversations</h2>
                
                <div className="mb-4 relative">
                    <input type="text" placeholder="Search..." className="w-full p-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-400 bg-gray-50"/>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                {/* Dynamic List of Conversations */}
                <div className="flex-1 overflow-y-auto space-y-2 pb-2">
                    {conversations.map((item) => (
                        <ConversationItem 
                            key={item.id} 
                            item={item} 
                            isActive={item.id === currentChatId}
                            switchChat={switchChat}
                            deleteChat={deleteChat}
                        />
                    ))}
                    {conversations.length === 0 && <p className="text-gray-500 text-center mt-8">No conversations started.</p>}
                </div>

                {/* New Conversation Button */}
                <div className="p-2 border-t border-gray-200 mt-4">
                    <button 
                        className="w-full bg-orange-600 text-white p-3 rounded-full flex items-center justify-center font-semibold hover:bg-orange-700 transition-colors shadow-md"
                        onClick={startNewChat}
                    >
                        <Plus className="w-5 h-5 mr-2" /> New Conversation
                    </button>
                </div>
            </div>

            {/* Main Chat Window (Right Panel) */}
            <div className="flex-1 flex flex-col bg-white rounded-r-3xl shadow-xl">
                {/* Chat Header */}
                <div className="bg-white p-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img src="/placeholder-avatar.png" alt="User" className="w-10 h-10 rounded-full border border-gray-300" />
                        <div>
                            <h2 className="font-semibold text-gray-800">{currentChat?.title || 'Welcome to MoodMate'}</h2>
                            <p className="text-xs text-gray-500">
                                {currentChatId ? `${messages.length} messages` : 'Select or start a chat'}
                            </p>
                        </div>
                    </div>
                    {/* Trash Button for Active Chat */}
                    {currentChatId && (
                        <div className="flex space-x-2">
                            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600">
                                <Headphones className="w-5 h-5"/>
                            </button>
                            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600">
                                <Settings className="w-5 h-5"/>
                            </button>
                            <button 
                                className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                                onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete the active chat "${currentChat?.title}"?`)) {
                                        deleteChat(currentChatId);
                                    }
                                }}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {currentChatId ? (
                        <>
                            <div className="flex justify-center my-4">
                                <span className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full uppercase">Today</span>
                            </div>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {renderMessageContent(msg)}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <p className="text-gray-500 italic flex items-center">
                                        MoodMate is thinking... 
                                        <span className="ml-2 animate-pulse text-xl">. . .</span>
                                    </p>
                                </div>
                            )}
                            <div ref={messagesEndRef}/>
                        </>
                    ) : (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            Please select a conversation or start a new chat.
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200 flex flex-col">
                    <div className="flex items-center space-x-4 mb-3 text-gray-500">
                        <Smile className="w-5 h-5 cursor-pointer hover:text-gray-700" />
                        <Image className="w-5 h-5 cursor-pointer hover:text-gray-700" />
                        <Paperclip className="w-5 h-5 cursor-pointer hover:text-gray-700" />
                    </div>
                    <div className="flex items-center space-x-3">
                        <Mic className="w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-700 p-1 rounded-full border border-gray-300"/>
                        <textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Send your message to MoodMate..."
                          className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-400 resize-none h-12 overflow-hidden"
                          rows={1}
                        />
                        <button 
                          onClick={handleSend} 
                          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-colors flex items-center justify-center w-10 h-10 shadow-lg disabled:opacity-50"
                          disabled={!inputText.trim() || !currentChatId}
                        >
                          <Send className="w-5 h-5 transform rotate-45 -mt-1 -mr-1"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}