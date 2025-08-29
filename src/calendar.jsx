import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import toast, { Toaster } from 'react-hot-toast';
import { createEvent, getUserEvents, getEventsByDate, deleteEvent } from './services/eventServiceAPI';

function CalendarApp() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
      loadAllEvents(token);
    } else {
      toast.error('Please log in to manage your events');
    }
  }, []);

  // Load all events from the server
  const loadAllEvents = async (token = authToken) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const result = await getUserEvents(token);
      if (result.success) {
        // Convert events array to the format expected by the calendar
        const eventsMap = {};
        result.events.forEach(event => {
          const dateKey = new Date(event.date).toDateString();
          if (!eventsMap[dateKey]) {
            eventsMap[dateKey] = [];
          }
          eventsMap[dateKey].push({
            id: event._id,
            title: event.title,
            time: event.time,
            date: new Date(event.date),
            isCompleted: event.isCompleted
          });
        });
        setEvents(eventsMap);
      } else {
        toast.error(result.error || 'Failed to load events');
      }
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // Load events for a specific date
  const loadEventsForDate = async (date) => {
    if (!authToken) return;
    
    try {
      const dateString = date.toISOString().split('T')[0];
      const result = await getEventsByDate(authToken, dateString);
      if (result.success) {
        const dateKey = date.toDateString();
        const formattedEvents = result.events.map(event => ({
          id: event._id,
          title: event.title,
          time: event.time,
          date: new Date(event.date),
          isCompleted: event.isCompleted
        }));
        
        setEvents(prev => ({
          ...prev,
          [dateKey]: formattedEvents
        }));
      }
    } catch (error) {
      console.error('Failed to load events for date:', error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowEventForm(true);
  };

  const addEvent = async () => {
    if (!eventTitle.trim()) {
      toast.error('Please enter an event title');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please log in to create events');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        title: eventTitle.trim(),
        date: selectedDate.toISOString()
      };

      // Only include time if it's not empty
      if (eventTime && eventTime.trim()) {
        eventData.time = eventTime.trim();
      }

      console.log('Sending event data:', eventData); // Debug log

      const result = await createEvent(authToken, eventData);
      
      if (result.success) {
        // Add the new event to local state
        const dateKey = selectedDate.toDateString();
        const newEvent = {
          id: result.event._id,
          title: result.event.title,
          time: result.event.time,
          date: new Date(result.event.date),
          isCompleted: result.event.isCompleted
        };

        setEvents(prev => ({
          ...prev,
          [dateKey]: [...(prev[dateKey] || []), newEvent]
        }));

        setEventTitle('');
        setEventTime('');
        setShowEventForm(false);
        toast.success('Event saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (dateKey, eventId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to delete events');
      return;
    }

    try {
      const result = await deleteEvent(authToken, eventId);
      
      if (result.success) {
        setEvents(prev => ({
          ...prev,
          [dateKey]: prev[dateKey].filter(event => event.id !== eventId)
        }));
        toast.success('Event deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateKey = date.toDateString();
      const dayEvents = events[dateKey];
      if (dayEvents && dayEvents.length > 0) {
        return (
          <div className="event-indicator">
            <div className="event-dot"></div>
          </div>
        );
      }
    }
    return null;
  };

  const selectedDateEvents = events[selectedDate.toDateString()] || [];

  return (
    <div className="calendar-container">
      <h1>My Calendar</h1>
      
      <div className="calendar-wrapper">
        <Calendar
          onChange={handleDateChange}
          onClickDay={handleDateClick}
          value={selectedDate}
          tileContent={tileContent}
          className="react-calendar"
        />
        
        <div className="events-panel">
          <h3>Events for {selectedDate.toDateString()}</h3>
          
          {selectedDateEvents.length > 0 ? (
            <div className="events-list">
              {selectedDateEvents.map(event => (
                <div key={event.id} className="event-item">
                  <div className="event-details">
                    <strong>{event.title}</strong>
                    {event.time && <span className="event-time"> at {event.time}</span>}
                  </div>
                  <button 
                    onClick={() => handleDeleteEvent(selectedDate.toDateString(), event.id)}
                    className="delete-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events">No events for this date</p>
          )}
          
          <button 
            onClick={() => setShowEventForm(!showEventForm)}
            className="add-event-btn"
          >
            {showEventForm ? 'Cancel' : 'Add Event'}
          </button>
          
          {showEventForm && (
            <div className="event-form">
              <input
                type="text"
                placeholder="Event title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="event-input"
              />
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="event-input"
              />
              <button onClick={addEvent} className="save-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Toaster position="top-right" />
      
      <style jsx>{`
        .calendar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        
        h1 {
          text-align: center;
          color: white;
          margin-bottom: 40px;
          font-size: 2.5rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .calendar-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          align-items: start;
        }
        
        .react-calendar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        
        .react-calendar:hover {
          transform: translateY(-5px);
        }
        
        .react-calendar__navigation {
          margin-bottom: 20px;
        }
        
        .react-calendar__navigation button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 15px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .react-calendar__navigation button:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .react-calendar__tile {
          background: none;
          border: none;
          border-radius: 10px;
          padding: 15px 5px;
          margin: 2px;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .react-calendar__tile:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: scale(1.1);
        }
        
        .react-calendar__tile--active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white;
          font-weight: bold;
        }
        
        .react-calendar__tile--now {
          background: rgba(102, 126, 234, 0.2);
          font-weight: bold;
        }
        
        .events-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: none;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        
        .events-panel:hover {
          transform: translateY(-5px);
        }
        
        .events-panel h3 {
          margin-top: 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          padding-bottom: 15px;
          border-bottom: 3px solid transparent;
          border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;
        }
        
        .event-indicator {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          position: absolute;
          top: 2px;
          right: 2px;
        }
        
        .event-dot {
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(238, 90, 36, 0.4);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .events-list {
          margin: 25px 0;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .events-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .events-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .events-list::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }
        
        .event-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          margin: 15px 0;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 15px;
          border-left: 5px solid transparent;
          border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .event-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .event-item:hover::before {
          opacity: 1;
        }
        
        .event-item:hover {
          transform: translateX(5px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
        }
        
        .event-details strong {
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .event-time {
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
          background: rgba(102, 126, 234, 0.1);
          padding: 4px 8px;
          border-radius: 8px;
          margin-left: 10px;
        }
        
        .delete-btn {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white;
          border: none;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }
        
        .delete-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
        }
        
        .no-events {
          color: #888;
          font-style: italic;
          text-align: center;
          margin: 40px 0;
          font-size: 1.1rem;
          padding: 30px;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 15px;
          border: 2px dashed rgba(102, 126, 234, 0.2);
        }
        
        .add-event-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 15px 25px;
          border-radius: 15px;
          cursor: pointer;
          width: 100%;
          margin: 25px 0;
          font-size: 1.1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .add-event-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
        }
        
        .event-form {
          margin-top: 20px;
          padding: 25px;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 15px;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .event-input {
          width: 100%;
          padding: 15px;
          margin: 10px 0;
          border: 2px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          box-sizing: border-box;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }
        
        .event-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
        }
        
        .save-btn {
          background: linear-gradient(135deg, #10ac84 0%, #00d2d3 100%);
          color: white;
          border: none;
          padding: 15px 25px;
          border-radius: 12px;
          cursor: pointer;
          width: 100%;
          margin-top: 15px;
          font-size: 1.1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(16, 172, 132, 0.3);
        }
        
        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(16, 172, 132, 0.4);
        }
        
        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        
        @media (max-width: 768px) {
          .calendar-wrapper {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          .react-calendar,
          .events-panel {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default CalendarApp;
