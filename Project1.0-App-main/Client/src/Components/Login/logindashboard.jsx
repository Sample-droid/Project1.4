import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './logindashboard.css';
import {jwtDecode} from "jwt-decode";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const LoginDashboard = () => {
  const [activeSection, setActiveSection] = useState('userInfo');
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      }
    } catch (error) {
      console.error("Invalid token", error);
      // Optionally logout user here if token invalid
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  useEffect(() => {
    if (activeSection === 'userInfo' && userId) {
      setLoading(true);
      axios.get(`${API_BASE_URL}/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      })
      .then(response => {
        setUserData(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Error fetching user data');
        setLoading(false);
      });
    }
  }, [activeSection, userId]);

  useEffect(() => {
    if (activeSection === 'events') {
      setLoading(true);
      axios.get(`${API_BASE_URL}/api/events/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      })
      .then(response => {
        setEvents(response.data.events || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Error fetching events');
        setLoading(false);
      });
    }
  }, [activeSection]);

  const renderUserInfo = () => (
    <div className="content-section">
      <h2>User Information</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      {userData && !loading && !error && (
        <div className="user-details">
          <p><strong>Name:</strong> {userData.username}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Role:</strong> {userData.role}</p> 
          <p><strong>Joined:</strong> {userData.createdAt.slice(0,10)}</p>
        </div>
      )}
    </div>  
  );

  const renderEvents = () => (
    <div className="content-section">
      <h2>Events Hosted by You</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      {events.length > 0 && !loading && !error ? (
        <ul className="events-list">
          {events.map((event) => (
            <li key={event._id} className="event-item">
              <p><strong>{event.name}</strong></p>
              <p>Date: {new Date(event.date).toLocaleDateString()}</p>
              <p>Location: {event.location}</p>
              <p>Description: {event.description || 'No description provided'}</p>
            </li>
          ))}
        </ul>
      ) : (
        !loading && !error && <p>No events found.</p>
      )}
    </div>
  );

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <h1>Dashboard</h1>
        <nav>
          <button
            className={activeSection === 'userInfo' ? 'active' : ''}
            onClick={() => setActiveSection('userInfo')}
          >
            User Info
          </button>
          <button
            className={activeSection === 'events' ? 'active' : ''}
            onClick={() => setActiveSection('events')}
          >
            Events
          </button>
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>
      <div className="main-content">
        {activeSection === 'userInfo' ? renderUserInfo() : renderEvents()}
      </div>
    </div>
  );
};

export default LoginDashboard;