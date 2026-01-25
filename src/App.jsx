import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import app from './firebase';
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

import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';
import Matches from './Matches';

function App() {
  useEffect(() => {
    console.log("Firebase initialized:", app);
  }, []);

  return (
    <Router>
      <div className="App font-display">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/events" element={<Events />} />
          <Route path="/edit-event" element={<EditEvent />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
          <Route path="/event-details/:id" element={<EventDetails />} />
          <Route path="/profile/:uid" element={<ProfileView />} />

          <Route path="/matches" element={<Matches />} />
          <Route path="/messages" element={<ChatList />} />
          <Route path="/chat/:uid" element={<Chat />} />

          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
