import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Search, Users, Moon, Sun, Menu, X, Hash } from 'lucide-react';import { useSocket } from '../hooks/useSocket';
import MessageList from './MessageList.jsx';
import UserList from './UserList.jsx';
import RoomList from './RoomList.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import FileUpload from './FileUpload.jsx';
import EmojiPicker from './EmojiPicker.jsx';
import SearchBar from './SearchBar.jsx';
import { UserButton } from '@clerk/clerk-react';

const ChatRoom = ({ username, avatar }) => {
  const [message, setMessage] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuTab, setMobileMenuTab] = useState('rooms');
  const messageinputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    connected,
    users,
    rooms,
    messages,
    typingUsers,
    currentRoom,
    currentUser,
    joinChat,
    sendMessage,
    sendTyping,
    stopTyping,
    joinRoom,
    createRoom,
    addReaction,
    markAsRead,
    searchMessages
  } = useSocket('https://week-5-web-sockets-assignment-clementwa0.onrender.com');

  useEffect(() => {
    joinChat(username, avatar);
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [joinChat, username, avatar]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
      setIsTyping(false);
      stopTyping(username);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    } else {
      if (!isTyping) {
        setIsTyping(true);
        sendTyping(username);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        stopTyping(username);
      }, 1000);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    messageinputRef.current?.focus();
  };

  const handleFileUpload = (file) => {
    sendMessage(`Shared a file: ${file.originalName}`, file);
    setShowFileUpload(false);
  };

  const toggleUserList = () => {
    setShowUserList((prev) => !prev);
  };
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };
  const handleRoomSelect = (roomId) => {
    joinRoom(roomId);
    closeMobileMenu();
  };

  const currentRoomData = rooms.find((room) => room.id === currentRoom);

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''} bg-white dark:bg-gray-800`}>
      {/* Mobile Header - Sticky */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Hash className="w-5 h-5 text-gray-500" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentRoomData?.name || 'Chat'}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-80 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-col">
          {/* Desktop Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={avatar}
                  alt={username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{username}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {connected ? 'Online' : 'Connecting...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-red-500"
                >
                  <UserButton/>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Room List */}
          <div className="flex-1 overflow-y-auto">
            <RoomList
              rooms={rooms}
              currentRoom={currentRoom}
              onRoomSelect={joinRoom}
              onCreateRoom={createRoom}
            />
          </div>

          {/* Desktop User List Toggle */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowUserList(!showUserList)}
              className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Users ({users.length})</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu} />
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl">
              {/* Mobile Menu Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={avatar}
                      alt={username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">{username}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {connected ? 'Online' : 'Connecting...'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Mobile Menu Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setMobileMenuTab('rooms')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${mobileMenuTab === 'rooms'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  Rooms
                </button>
                <button
                  onClick={() => setMobileMenuTab('users')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${mobileMenuTab === 'users'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  Users ({users.length})
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex-1 overflow-y-auto">
                {mobileMenuTab === 'rooms' ? (
                  <RoomList
                    rooms={rooms}
                    currentRoom={currentRoom}
                    onRoomSelect={handleRoomSelect}
                    onCreateRoom={createRoom}
                  />
                ) : (
                  <div className="p-4">
                    <UserList
                      users={users}
                      currentUser={currentUser}
                      onClose={() => { }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop Header */}
          <div className="hidden lg:block p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentRoomData?.name || 'Chat'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentRoomData?.description || 'Welcome to the chat room'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="border-b border-gray-200 dark:border-gray-700">
              <SearchBar onSearch={searchMessages} />
            </div>
          )}

          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 pb-2">
            <MessageList
              messages={messages}
              currentUser={currentUser}
              onReaction={addReaction}
              onMarkRead={markAsRead}
            />
            <TypingIndicator users={typingUsers} />
          </div>

          {/* Message Input - Sticky Bottom */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                <Smile className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <input
                  ref={messageinputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop User List Sidebar */}
        {showUserList && (
          <div className="hidden lg:block w-80 bg-gray-100 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
            <UserList
              users={users}
              currentUser={currentUser}
              onClose={() => setShowUserList(false)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {showFileUpload && (
        <FileUpload
          onFileUpload={handleFileUpload}
          onClose={() => setShowFileUpload(false)}
        />
      )}
    </div>
  );
};

export default ChatRoom;
