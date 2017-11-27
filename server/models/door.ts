import * as mongoose from 'mongoose';

const doorSchema = new mongoose.Schema({
  lab: String,
  block: String,
  floor: String,
  door: { type: String, unique: true, uppercase: true, trim: true},
  status: String,
  mac: { type: String, unique: true, uppercase: true, trim: true},
  isDeleted: String 
});

const Door = mongoose.model('Door', doorSchema);

export default Door;
