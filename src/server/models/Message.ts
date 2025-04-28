import mongoose, { Document, Schema } from "mongoose";
import { UserDocument } from "./User";

export interface IMessage {
  user: UserDocument["_id"];
  username: string;
  text: string;
  time: Date;
}

export interface MessageDocument extends IMessage, Document {}

const MessageSchema = new Schema<MessageDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model<MessageDocument>("Message", MessageSchema);

export default Message;
