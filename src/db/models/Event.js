import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [100, 'Event title cannot exceed 100 characters']
    },
    time: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
eventSchema.index({ userId: 1, date: 1 });

// Remove sensitive fields from JSON output
eventSchema.methods.toJSON = function() {
    const eventObject = this.toObject();
    return eventObject;
};

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;
