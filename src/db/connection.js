//My MongoDB connection file ! 🫶🏼


import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not defined');
}

let isConnected = false;

export const connectToDatabase = async () => {
    if (isConnected) {
        console.log('Already connected to MongoDB');
        return;
    }

    try {
        await mongoose.connect(MONGO_URI);
        
        isConnected = true;
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

export const disconnectFromDatabase = async () => {
    if (!isConnected) {
        return;
    }

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('MongoDB disconnection error:', error);
        throw error;
    }
};

export default mongoose;
