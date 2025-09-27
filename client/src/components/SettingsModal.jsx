'use client';
import React, { useState } from 'react';
import { X, Download, Trash2, Upload } from 'lucide-react';
import { useChat } from '@/app/chat/ChatContext';

const SettingsModal = ({ isOpen, onClose }) => {
    const { clearAllData, exportData, conversations, loadConversations } = useChat();
    const [importFile, setImportFile] = useState(null);

    if (!isOpen) return null;

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.conversations && data.messages) {
                // Clear existing data first
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('chat_')) {
                        localStorage.removeItem(key);
                    }
                });
                
                // Import conversations
                localStorage.setItem('chat_conversations', JSON.stringify(data.conversations));
                
                // Import messages
                Object.keys(data.messages).forEach(chatId => {
                    localStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(data.messages[chatId]));
                });
                
                // Import context data if available
                if (data.context) {
                    Object.keys(data.context).forEach(chatId => {
                        if (data.context[chatId]) {
                            localStorage.setItem(`chat_context_${chatId}`, JSON.stringify(data.context[chatId]));
                        }
                    });
                }
                
                // Import summary data if available
                if (data.summary) {
                    Object.keys(data.summary).forEach(chatId => {
                        if (data.summary[chatId]) {
                            localStorage.setItem(`chat_summary_${chatId}`, JSON.stringify(data.summary[chatId]));
                        }
                    });
                }
                
                // Reload data
                loadConversations();
                alert('Data imported successfully!');
                onClose();
            } else {
                alert('Invalid backup file format');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing data');
        }
        
        // Reset file input
        event.target.value = '';
    };

    const getStorageSize = () => {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && 
                (key.startsWith('chat_conversations') || 
                 key.startsWith('chat_messages_') ||
                 key.startsWith('chat_context_') ||
                 key.startsWith('chat_summary_') ||
                 key.startsWith('current_chat_id'))) {
                total += localStorage[key].length;
            }
        }
        return (total / 1024).toFixed(2); // KB
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Chat Settings</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Storage Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Storage Information</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>Conversations: {conversations.length}</p>
                            <p>Storage Used: {getStorageSize()} KB</p>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900">Data Management</h3>
                        
                        {/* Export Button */}
                        <button
                            onClick={exportData}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export Backup</span>
                        </button>

                        {/* Import Button */}
                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <button className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors">
                                <Upload className="w-4 h-4" />
                                <span>Import Backup</span>
                            </button>
                        </div>

                        {/* Clear All Data */}
                        <button
                            onClick={clearAllData}
                            className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Clear All Data</span>
                        </button>
                    </div>

                    <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
                        <strong>Note:</strong> All data is stored locally in your browser. 
                        Make regular backups to avoid losing your conversations.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;