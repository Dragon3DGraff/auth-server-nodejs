import { model, Schema } from 'mongoose';

const RoomSchema = new Schema({
  id: String,
  name: {
    type: String,
    unique: true,
  },
  owner: String,
  users: [String],
  messages: {
    type: [{
      id: String,
      author: String,
      text: String,
      time: Date,
    }],
  },

}, { collection: 'room' });

export default model('RoomSchema', RoomSchema);
