import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import app from './firebase';
import Login from './Login';
import SignUp from './SignUp';
import Events from './Events';
import EditEvent from './EditEvent';
import EventDetails from './EventDetails';
import EditProfile from './EditProfile';

function App() {
  useEffect(() => {
    console.log("Firebase initialized:", app);
  }, []);

  return (
    <Router>
      <div className="App font-display">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/events" element={<Events />} />
          <Route path="/edit-event" element={<EditEvent />} />
          <Route path="/event-details/:id" element={<EventDetails />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
