import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import toast, { Toaster } from 'react-hot-toast';

function CalendarApp() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowEventForm(true);
  };

  const addEvent = () => {
    if (!eventTitle.trim()) {
      toast.error('Please enter an event title');
      return;
    }

    const dateKey = selectedDate.toDateString();
    const newEvent = {
      id: Date.now(),
      title: eventTitle,
      time: eventTime,
      date: selectedDate
    };

    setEvents(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newEvent]
    }));

    setEventTitle('');
    setEventTime('');
    setShowEventForm(false);
    toast.success('Event added successfully!');
  };

  const deleteEvent = (dateKey, eventId) => {
    setEvents(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(event => event.id !== eventId)
    }));
    toast.success('Event deleted successfully!');
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
                    onClick={() => deleteEvent(selectedDate.toDateString(), event.id)}
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
              <button onClick={addEvent} className="save-btn">
                Save Event
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Toaster position="top-right" />
      
      <style jsx>{`
        .calendar-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 30px;
        }
        
        .calendar-wrapper {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;
        }
        
        .react-calendar {
          flex: 1;
          min-width: 300px;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .events-panel {
          flex: 1;
          min-width: 300px;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .events-panel h3 {
          margin-top: 0;
          color: #333;
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
        }
        
        .event-indicator {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
        
        .event-dot {
          width: 6px;
          height: 6px;
          background-color: #007bff;
          border-radius: 50%;
        }
        
        .events-list {
          margin: 20px 0;
        }
        
        .event-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          margin: 10px 0;
          background: #f8f9fa;
          border-radius: 5px;
          border-left: 4px solid #007bff;
        }
        
        .event-details strong {
          color: #333;
        }
        
        .event-time {
          color: #666;
          font-size: 0.9em;
        }
        
        .delete-btn {
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 50%;
          width: 25px;
          height: 25px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .delete-btn:hover {
          background: #c82333;
        }
        
        .no-events {
          color: #666;
          font-style: italic;
          text-align: center;
          margin: 20px 0;
        }
        
        .add-event-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          width: 100%;
          margin: 20px 0;
        }
        
        .add-event-btn:hover {
          background: #0056b3;
        }
        
        .event-form {
          margin-top: 15px;
        }
        
        .event-input {
          width: 100%;
          padding: 10px;
          margin: 5px 0;
          border: 1px solid #ddd;
          border-radius: 5px;
          box-sizing: border-box;
        }
        
        .save-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          width: 100%;
          margin-top: 10px;
        }
        
        .save-btn:hover {
          background: #218838;
        }
        
        @media (max-width: 768px) {
          .calendar-wrapper {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default CalendarApp;
