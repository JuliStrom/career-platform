import {NotificationType} from "../types";
import Notification from "../models/Notification";
import {Types} from "mongoose";

export async function createNotification(data: {
    userId: Types.ObjectId;
    type: NotificationType;
    payload: Record<string, unknown>;
    deduplicationKey: string;
}) {
    return Notification.updateOne(
        { deduplicationKey: data.deduplicationKey },
        {
            $setOnInsert: {
                ...data,
                isRead: false,
                sentAt: new Date(),
            },
        },
        { upsert: true }
    );
}