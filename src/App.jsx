import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import app, { auth } from './firebase';
import Login from './Login';
import Home from './Home';
import SignUp from './SignUp';
import Events from './Events';
import EditEvent from './EditEvent';
import EventDetails from './EventDetails';
import ProfileView from './ProfileView';
import Chat from './Chat';
import ChatList from './ChatList';
import EditProfile from './EditProfile';
import Settings from './Settings';
import ContactUs from './ContactUs';

import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';
import Matches from './Matches';

function App() {
  useEffect(() => {
    console.log("Firebase initialized:", app);

    // Check local storage or system preference for theme
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    }, []);

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center bg-white">
          <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  return (
    <Router>
      <div className="App font-display">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />
          <Route path="/edit-event" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
          <Route path="/edit-event/:id" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
          <Route path="/event-details/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
          <Route path="/profile/:uid" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />

          <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
          <Route path="/chat/:uid" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
