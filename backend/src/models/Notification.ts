import mongoose, {Model, Schema} from 'mongoose';
import {INotification, NotificationType} from "../types";

const notificationSchema = new Schema<INotification>(
    {
        deduplicationKey: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(NotificationType),
            required: true,
        },
        payload: {
            type: Schema.Types.Mixed,
            required: true,
            default: {},
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        sentAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
        collection: 'notifications',
    }
);

notificationSchema.index({userId: 1, sentAt: -1});
notificationSchema.index({userId: 1, isRead: 1});

const Notification: Model<INotification> =
    mongoose.model<INotification>(
        'Notification',
        notificationSchema
    );

export default Notification;