import React from 'react';
import { X, MessageCircle, Circle } from 'lucide-react';

const UserList = ({
  users,
  currentUser,
  onClose,
  onStartPrivateChat
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

    const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Users ({users.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-3 rounded-lg border transition-colors ${
                user.id === currentUser?.id
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                    user.status === 'online' ? 'bg-green-500' :
                    user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </h3>
                    {user.id === currentUser?.id && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Circle className={`w-2 h-2 ${getStatusColor(user.status)}`} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getStatusText(user.status)}
                    </span>
                  </div>
                  {user.status === 'offline' && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Last seen: {new Date(user.lastSeen).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                {user.id !== currentUser?.id && onStartPrivateChat && (
                  <button
                    onClick={() => onStartPrivateChat(user)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserList;