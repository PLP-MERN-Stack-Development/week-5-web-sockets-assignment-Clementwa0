import React, { useState } from 'react';
import { Plus, Hash, Users, X } from 'lucide-react';


const RoomList = ({ rooms, currentRoom, onRoomSelect, onCreateRoom, onDeleteRoom }) => {
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');

  const handleCreate = () => {
    if (roomName.trim()) {
      onCreateRoom(roomName.trim(), roomDescription.trim());
      setRoomName('');
      setRoomDescription('');
      setShowModal(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rooms</h3>
        <button onClick={() => setShowModal(true)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              currentRoom === room.id
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => onRoomSelect(room.id)}
          >
            <div className="flex items-center space-x-3">
              <Hash className="w-4 h-4" />
              <div>
                <div className="font-semibold truncate">{room.name}</div>
                <div className="text-xs opacity-75 truncate">{room.description}</div>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span className="text-xs">{room.users.length}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this room?')) {
                  onDeleteRoom(room.id);
                }
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded transition-colors"
            >
              <X className="w-3 h-3 text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Room</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Room name"
              />
              <textarea
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Description"
              />

              <button
                onClick={handleCreate}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
