import React, { useState } from 'react';
import LoginForm from './components/LoginForm.jsx';
import ChatRoom from './components/ChatRoom.jsx';
import { ThemeProvider } from "./types/theme-provider.jsx"

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (username, avatar) => {
    setUser({ username, avatar });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <ThemeProvider>
    <div className="App">
      {user ? (
        <ChatRoom
          username={user.username}
          avatar={user.avatar}
          onLogout={handleLogout}
        />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
    </ThemeProvider>
  );
}

export default App;