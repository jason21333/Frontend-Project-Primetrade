const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Active', 'Pending', 'Inactive'],
    default: 'Pending'
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Entity', EntitySchema);

