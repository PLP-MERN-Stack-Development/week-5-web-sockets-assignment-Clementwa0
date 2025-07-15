import React, { useEffect, useRef } from 'react';
import { Eye, Download, Trash2 } from 'lucide-react';

const MessageList = ({ messages, currentUser, onReaction, onMarkRead, onDeleteMessage  }) => {

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const messageId = entry.target.getAttribute('data-message-id');
          if (messageId) onMarkRead(messageId);
        }
      });
    }, { threshold: 0.5 });

    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [messages, onMarkRead]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const isOwn = msg.sender.id === currentUser?.id;
        const isRead = msg.readBy.length > 1;

        return (
          <div
            key={msg.id}
            data-message-id={msg.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-sm ${isOwn ? 'order-2 text-right' : 'order-1'}`}>
              {!isOwn && (
                <div className="flex items-center space-x-2 mb-1">
                  <img src={msg.sender.avatar} alt={msg.sender.username} className="w-6 h-6 rounded-full" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {msg.sender.username}
                  </span>
                </div>
              )}

              <div className={`px-4 py-2 rounded-lg shadow ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                {msg.file && (
                  <div className="mb-2 p-2 bg-black bg-opacity-10 rounded flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span className="text-sm">{msg.file.originalName}</span>
                    <span className="text-xs opacity-75">({(msg.file.size / 1024).toFixed(1)}KB)</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-75">{formatTime(msg.timestamp)}</span>
                  {isOwn && isRead && <Eye className="w-3 h-3 opacity-75" />}
                </div>
                {isOwn && (
                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;