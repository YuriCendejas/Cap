import { connectToDatabase } from '../db/connection.js';
import Event from '../db/models/Event.js';

// Create a new event
export const createEvent = async (eventData, userId) => {
    try {
        await connectToDatabase();
        
        const event = new Event({
            ...eventData,
            userId
        });
        
        await event.save();
        
        return {
            success: true,
            event: event.toJSON()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Get events for a specific user
export const getUserEvents = async (userId, startDate = null, endDate = null) => {
    try {
        await connectToDatabase();
        
        let query = { userId };
        
        // Add date range filter if provided
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const events = await Event.find(query).sort({ date: 1, time: 1 });
        
        return {
            success: true,
            events
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Get events for a specific date
export const getEventsByDate = async (userId, date) => {
    try {
        await connectToDatabase();
        
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const events = await Event.find({
            userId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).sort({ time: 1 });
        
        return {
            success: true,
            events
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Update an event
export const updateEvent = async (eventId, eventData, userId) => {
    try {
        await connectToDatabase();
        
        const event = await Event.findOneAndUpdate(
            { _id: eventId, userId },
            eventData,
            { new: true, runValidators: true }
        );
        
        if (!event) {
            throw new Error('Event not found or you do not have permission to update it');
        }
        
        return {
            success: true,
            event: event.toJSON()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Delete an event
export const deleteEvent = async (eventId, userId) => {
    try {
        await connectToDatabase();
        
        const event = await Event.findOneAndDelete({ _id: eventId, userId });
        
        if (!event) {
            throw new Error('Event not found or you do not have permission to delete it');
        }
        
        return {
            success: true,
            message: 'Event deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Get event by ID
export const getEventById = async (eventId, userId) => {
    try {
        await connectToDatabase();
        
        const event = await Event.findOne({ _id: eventId, userId });
        
        if (!event) {
            throw new Error('Event not found');
        }
        
        return {
            success: true,
            event: event.toJSON()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Mark event as completed/uncompleted
export const toggleEventCompletion = async (eventId, userId) => {
    try {
        await connectToDatabase();
        
        const event = await Event.findOne({ _id: eventId, userId });
        
        if (!event) {
            throw new Error('Event not found');
        }
        
        event.isCompleted = !event.isCompleted;
        await event.save();
        
        return {
            success: true,
            event: event.toJSON()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};
