const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // Password is optional to support OAuth-created users
  password: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
