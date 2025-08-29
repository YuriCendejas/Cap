// Frontend API service that makes HTTP requests to the backend server
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

// User registration
export const registerUser = async (userData) => {
    return await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

// User login
export const loginUser = async (email, password) => {
    return await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

// Get user profile
export const getUserProfile = async (token) => {
    return await apiRequest('/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

// Update user profile
export const updateUserProfile = async (token, userData) => {
    return await apiRequest('/profile', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });
};

// Delete user account
export const deleteUserAccount = async (token) => {
    return await apiRequest('/profile', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};

// Verify token
export const verifyToken = async (token) => {
    return await apiRequest('/verify-token', {
        method: 'POST',
        body: JSON.stringify({ token })
    });
};

// Health check
export const checkServerHealth = async () => {
    return await apiRequest('/health');
};
