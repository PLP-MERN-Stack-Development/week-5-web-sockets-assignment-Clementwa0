import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useUser, SignInButton, SignedOut, SignedIn, UserButton } from '@clerk/clerk-react';

const LoginForm = ({ onLogin }) => {
  const { isSignedIn, user, isLoaded } = useUser();

  const handleJoinChat = () => {
    if (isSignedIn && user) {
      const username = user.fullName || user.username || user.primaryEmailAddress?.emailAddress || 'Guest';
      const avatar = user.imageUrl;
      onLogin(username, avatar);
    }
  };

  if (!isLoaded) return null; // Wait until Clerk loads

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-500 rounded-full shadow-lg">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to ChatHub</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Connect with friends and colleagues in real-time
          </p>
        </div>

        <SignedOut>
          <div className="rounded-lg shadow-lg bg-white dark:bg-gray-800 p-6 text-center">
            <SignInButton afterSignInUrl="/" mode="modal">
              <button className="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                Sign In with Clerk
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          {user ? (
            <div className="rounded-lg shadow-lg bg-white dark:bg-gray-800 p-6 space-y-4 text-center">
              <p className="text-gray-800 dark:text-white">
                Signed in as <strong>{user.fullName || user.username || user.primaryEmailAddress?.emailAddress}</strong>
              </p>
              <UserButton afterSignOutUrl="/" />
              <button
                onClick={handleJoinChat}
                className="w-full py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Join Chat
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500">Loading user...</div>
          )}
        </SignedIn>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            By joining, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
