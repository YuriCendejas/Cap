import { connectToDatabase } from '../db/connection.js';
import User from '../db/models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'fallback-secret-key';

// User registration
export const registerUser = async (userData) => {
    try {
        await connectToDatabase();
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: userData.email },
                { username: userData.username }
            ]
        });
        
        if (existingUser) {
            throw new Error('User with this email or username already exists');
        }
        
        // Create new user
        const user = new User(userData);
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            TOKEN_SECRET,
            { expiresIn: '7d' }
        );
        
        return {
            success: true,
            user: user.toJSON(),
            token
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// User login
export const loginUser = async (email, password) => {
    try {
        await connectToDatabase();
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            TOKEN_SECRET,
            { expiresIn: '7d' }
        );
        
        return {
            success: true,
            user: user.toJSON(),
            token
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Get user profile
export const getUserProfile = async (userId) => {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        return {
            success: true,
            user: user.toJSON()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Update user profile
export const updateUserProfile = async (userId, updateData) => {
    try {
        await connectToDatabase();
        
        // Check if username is being updated and if it's already taken
        if (updateData.username) {
            const existingUser = await User.findOne({ 
                username: updateData.username,
                _id: { $ne: userId }
            });
            
            if (existingUser) {
                throw new Error('Username is already taken');
            }
        }
        
        // Check if email is being updated and if it's already taken
        if (updateData.email) {
            const existingUser = await User.findOne({ 
                email: updateData.email,
                _id: { $ne: userId }
            });
            
            if (existingUser) {
                throw new Error('Email is already taken');
            }
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!user) {
            throw new Error('User not found');
        }
        
        return {
            success: true,
            user: user.toJSON()
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Delete user account
export const deleteUserAccount = async (userId) => {
    try {
        await connectToDatabase();
        
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        return {
            success: true,
            message: 'Account deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Verify JWT token
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, TOKEN_SECRET);
        return {
            success: true,
            userId: decoded.userId,
            email: decoded.email
        };
    } catch (error) {
        return {
            success: false,
            error: 'Invalid or expired token'
        };
    }
};

// Change password
export const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        return {
            success: true,
            message: 'Password updated successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Search users (for admin purposes or friend features)
export const searchUsers = async (query, limit = 10) => {
    try {
        await connectToDatabase();
        
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } }
            ]
        })
        .limit(limit)
        .select('firstName lastName username profilePicture');
        
        return {
            success: true,
            users
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Get user statistics
export const getUserStats = async (userId) => {
    try {
        await connectToDatabase();
        
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        const stats = {
            memberSince: user.createdAt,
            lastUpdated: user.updatedAt,
            isVerified: user.isVerified,
            profileComplete: !!(user.firstName && user.lastName && user.username && user.profilePicture)
        };
        
        return {
            success: true,
            stats
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};
