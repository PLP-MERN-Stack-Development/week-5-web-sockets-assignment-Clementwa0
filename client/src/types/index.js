export const User = {
  id: '',
  username: '',
  avatar: '',
  status: 'online', // 'online' | 'offline' | 'away'
  lastSeen: new Date(),
  currentRoom: undefined
};

export const Reaction = {
  userId: '',
  username: ''
};

export const FileAttachment = {
  filename: '',
  originalName: '',
  size: 0,
  url: ''
};

export const Message = {
  id: '',
  text: '',
  sender: User,
  timestamp: new Date(),
  roomId: undefined,
  recipient: undefined,
  reactions: {},
  readBy: [],
  file: undefined
};

export const Room = {
  id: '',
  name: '',
  description: '',
  users: [],
  messages: [],
  createdBy: undefined
};

export const TypingUser = {
  userId: '',
  username: ''
};
