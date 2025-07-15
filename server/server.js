<<<<<<< HEAD
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// In-memory storage (use database in production)
let users = new Map();
let rooms = new Map();
let messages = [];
let privateMessages = new Map();

// Default rooms
rooms.set('general', {
  id: 'general',
  name: 'General',
  description: 'General discussion',
  users: new Set(),
  messages: []
});

rooms.set('random', {
  id: 'random',
  name: 'Random',
  description: 'Random conversations',
  users: new Set(),
  messages: []
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', ({ username, avatar }) => {
    const user = {
      id: socket.id,
      username,
      avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=random`,
      status: 'online',
      lastSeen: new Date(),
      currentRoom: 'general'
    };
    
    users.set(socket.id, user);
    socket.join('general');
    
    // Add user to general room
    rooms.get('general').users.add(socket.id);
    
    // Notify all users about new user
    io.emit('user_joined', user);
    io.emit('users_update', Array.from(users.values()));
    
    // Send existing messages to new user
    socket.emit('room_messages', {
      roomId: 'general',
      messages: rooms.get('general').messages.slice(-50) // Last 50 messages
    });
    
    socket.emit('rooms_update', Array.from(rooms.values()).map(room => ({
      ...room,
      users: Array.from(room.users)
    })));
  });

  socket.on('send_message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: uuidv4(),
      text: data.text,
      sender: user,
      timestamp: new Date(),
      roomId: data.roomId,
      reactions: {},
      readBy: [socket.id]
    };

    if (data.file) {
      message.file = data.file;
    }

    // Add message to room
    if (rooms.has(data.roomId)) {
      rooms.get(data.roomId).messages.push(message);
      io.to(data.roomId).emit('new_message', message);
    }
  });

  socket.on('send_private_message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: uuidv4(),
      text: data.text,
      sender: user,
      recipient: data.recipient,
      timestamp: new Date(),
      reactions: {},
      readBy: [socket.id]
    };

    if (data.file) {
      message.file = data.file;
    }

    // Store private message
    const conversationId = [socket.id, data.recipient].sort().join('-');
    if (!privateMessages.has(conversationId)) {
      privateMessages.set(conversationId, []);
    }
    privateMessages.get(conversationId).push(message);

    // Send to both users
    socket.emit('new_private_message', message);
    socket.to(data.recipient).emit('new_private_message', message);
  });

  socket.on('typing', ({ roomId, username }) => {
    socket.to(roomId).emit('user_typing', { username, userId: socket.id });
  });

  socket.on('stop_typing', ({ roomId, username }) => {
    socket.to(roomId).emit('user_stop_typing', { username, userId: socket.id });
  });

  socket.on('join_room', ({ roomId }) => {
    const user = users.get(socket.id);
    if (!user) return;

    // Leave current room
    if (user.currentRoom) {
      socket.leave(user.currentRoom);
      if (rooms.has(user.currentRoom)) {
        rooms.get(user.currentRoom).users.delete(socket.id);
      }
    }

    // Join new room
    socket.join(roomId);
    user.currentRoom = roomId;
    
    if (rooms.has(roomId)) {
      rooms.get(roomId).users.add(socket.id);
      
      // Send room messages to user
      socket.emit('room_messages', {
        roomId,
        messages: rooms.get(roomId).messages.slice(-50)
      });
    }

    io.emit('users_update', Array.from(users.values()));
  });

  socket.on('create_room', ({ name, description }) => {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      name,
      description,
      users: new Set([socket.id]),
      messages: [],
      createdBy: socket.id
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    
    const user = users.get(socket.id);
    if (user) {
      user.currentRoom = roomId;
    }

    io.emit('rooms_update', Array.from(rooms.values()).map(room => ({
      ...room,
      users: Array.from(room.users)
    })));
  });

  socket.on('add_reaction', ({ messageId, reaction, roomId }) => {
    const user = users.get(socket.id);
    if (!user) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const message = room.messages.find(msg => msg.id === messageId);
    if (!message) return;

    if (!message.reactions[reaction]) {
      message.reactions[reaction] = [];
    }

    const existingReaction = message.reactions[reaction].find(r => r.userId === socket.id);
    if (existingReaction) {
      // Remove reaction
      message.reactions[reaction] = message.reactions[reaction].filter(r => r.userId !== socket.id);
    } else {
      // Add reaction
      message.reactions[reaction].push({
        userId: socket.id,
        username: user.username
      });
    }

    io.to(roomId).emit('message_reaction', {
      messageId,
      reactions: message.reactions
    });
  });

  socket.on('mark_read', ({ messageId, roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const message = room.messages.find(msg => msg.id === messageId);
    if (message && !message.readBy.includes(socket.id)) {
      message.readBy.push(socket.id);
      io.to(roomId).emit('message_read', { messageId, readBy: message.readBy });
    }
  });

  socket.on('search_messages', ({ query, roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const results = room.messages.filter(msg => 
      msg.text.toLowerCase().includes(query.toLowerCase()) ||
      msg.sender.username.toLowerCase().includes(query.toLowerCase())
    );

    socket.emit('search_results', results);
  });

  socket.on('get_private_messages', ({ userId }) => {
    const conversationId = [socket.id, userId].sort().join('-');
    const messages = privateMessages.get(conversationId) || [];
    socket.emit('private_messages', { userId, messages });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const user = users.get(socket.id);
    if (user) {
      // Remove user from rooms
      rooms.forEach(room => {
        room.users.delete(socket.id);
      });
      
      // Update user status
      user.status = 'offline';
      user.lastSeen = new Date();
      
      io.emit('user_left', user);
      io.emit('users_update', Array.from(users.values()));
      
      // Remove user after broadcast
      setTimeout(() => {
        users.delete(socket.id);
      }, 5000);
    }
  });
});

=======
// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
    };
    
    messages.push(message);
    
    // Limit stored messages to prevent memory issues
    if (messages.length > 100) {
      messages.shift();
    }
    
    io.emit('receive_message', message);
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      
      io.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
>>>>>>> f9f0f0473e5b4f489f60fb8cf27ff7c97ac06675
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

<<<<<<< HEAD
// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
=======
module.exports = { app, server, io }; 
>>>>>>> f9f0f0473e5b4f489f60fb8cf27ff7c97ac06675
