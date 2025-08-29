// Frontend API service for event operations
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();
        return data;
    } catch (error) {
        return {
            success: false,
            error: 'Network error: Unable to connect to server'
        };
    }
};

// Create a new event
export const createEvent = async (token, eventData) => {
    return await apiRequest('/events', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
    });
};

// Get all events for the authenticated user
export const getUserEvents = async (token, startDate = null, endDate = null) => {
    let endpoint = '/events';
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
        endpoint += `?${params.toString()}`;
    }
    
    return await apiRequest(endpoint, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

// Get events for a specific date
export const getEventsByDate = async (token, date) => {
    return await apiRequest(`/events/date/${date}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

// Get a specific event by ID
export const getEventById = async (token, eventId) => {
    return await apiRequest(`/events/${eventId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

// Update an event
export const updateEvent = async (token, eventId, eventData) => {
    return await apiRequest(`/events/${eventId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
    });
};

// Delete an event
export const deleteEvent = async (token, eventId) => {
    return await apiRequest(`/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

// Toggle event completion status
export const toggleEventCompletion = async (token, eventId) => {
    return await apiRequest(`/events/${eventId}/toggle`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};
