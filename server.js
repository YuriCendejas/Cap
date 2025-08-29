import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './src/db/connection.js';
import { registerUser, loginUser, getUserProfile, updateUserProfile, verifyToken, deleteUserAccount } from './src/services/userService.js';
import { createEvent, getUserEvents, getEventsByDate, updateEvent, deleteEvent, getEventById, toggleEventCompletion } from './src/services/eventService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB on server start
connectToDatabase().catch(console.error);

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const result = await registerUser(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }

    const result = verifyToken(token);
    if (!result.success) {
        return res.status(403).json({ success: false, error: result.error });
    }

    req.userId = result.userId;
    req.userEmail = result.email;
    next();
};

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const result = await getUserProfile(req.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update user profile
app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const result = await updateUserProfile(req.userId, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete user account
app.delete('/api/profile', authenticateToken, async (req, res) => {
    try {
        const result = await deleteUserAccount(req.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify token endpoint
app.post('/api/verify-token', (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, error: 'Token is required' });
        }
        
        const result = verifyToken(token);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Event endpoints
// Create a new event
app.post('/api/events', authenticateToken, async (req, res) => {
    try {
        const result = await createEvent(req.body, req.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all events for the authenticated user
app.get('/api/events', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const result = await getUserEvents(req.userId, startDate, endDate);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get events for a specific date
app.get('/api/events/date/:date', authenticateToken, async (req, res) => {
    try {
        const { date } = req.params;
        const result = await getEventsByDate(req.userId, date);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get a specific event by ID
app.get('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getEventById(id, req.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update an event
app.put('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await updateEvent(id, req.body, req.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete an event
app.delete('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteEvent(id, req.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Toggle event completion status
app.patch('/api/events/:id/toggle', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await toggleEventCompletion(id, req.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
