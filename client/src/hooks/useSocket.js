import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (serverUrl) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [currentUser, setCurrentUser] = useState(null);
  const typingTimeoutRef = useRef({});
  const currentRoomRef = useRef(currentRoom);

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  useEffect(() => {
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
    });
    newSocket.on('disconnect', () => setConnected(false));

    newSocket.on('users_update', (users) => setUsers(users));
    newSocket.on('rooms_update', (rooms) => setRooms(rooms));

    newSocket.on('room_messages', ({ roomId, messages: roomMessages }) => {
      if (roomId === currentRoomRef.current) setMessages(roomMessages);
    });

    newSocket.on('new_message', (message) => {
      if (message.roomId === currentRoomRef.current) {
        setMessages((prev) => [...prev, message]);
      }
    });

    newSocket.on('user_typing', ({ username, userId }) => {
      setTypingUsers((prev) => {
        if (!prev.some((u) => u.userId === userId)) {
          return [...prev, { username, userId }];
        }
        return prev;
      });

      if (typingTimeoutRef.current[userId]) {
        clearTimeout(typingTimeoutRef.current[userId]);
      }

      typingTimeoutRef.current[userId] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
        delete typingTimeoutRef.current[userId];
      }, 3000);
    });

    return () => newSocket.disconnect();
  }, [serverUrl]);

  const joinChat = (username, avatar) => {
    if (socket) {
      socket.emit('join', { username, avatar });
      setCurrentUser({
        id: socket.id,
        username,
        avatar,
        status: 'online',
        lastSeen: new Date(),
      });
    }
  };

  const sendMessage = (text, file = null) => {
    if (socket && currentRoom) {
      socket.emit('send_message', { text, roomId: currentRoom, file });
    }
  };

  const sendTyping = (username) => {
    if (socket && currentRoom) {
      socket.emit('typing', { roomId: currentRoom, username });
    }
  };

  const stopTyping = (username) => {
    if (socket && currentRoom) {
      socket.emit('stop_typing', { roomId: currentRoom, username });
    }
  };

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', { roomId });
      setCurrentRoom(roomId);
    }
  };

  const createRoom = (name, description) => {
    if (socket) {
      socket.emit('create_room', { name, description });
    }
  };

  const addReaction = (messageId, reaction) => {
    if (socket && currentRoom) {
      socket.emit('add_reaction', { messageId, reaction, roomId: currentRoom });
    }
  };

  const markAsRead = (messageId) => {
    if (socket && currentRoom) {
      socket.emit('mark_read', { messageId, roomId: currentRoom });
    }
  };

  const searchMessages = (query) => {
    if (socket && currentRoom) {
      socket.emit('search_messages', { query, roomId: currentRoom });
    }
  };
  const deleteMessage = (messageId) => {
  if (socket && currentRoom) {
    socket.emit('delete_message', { messageId, roomId: currentRoom });
  }
};

  return {
    socket,
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
    searchMessages,
    deleteMessage,
  };
};