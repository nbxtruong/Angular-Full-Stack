import * as mongoose from 'mongoose';

const catSchema = new mongoose.Schema({
  userid: String,
  username: String,
  name: String,
  room: String,
  role: String
});

const Cat = mongoose.model('Cat', catSchema);

export default Cat;
