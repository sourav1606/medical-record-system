const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String,
    required: true
  },
  doctor: {
    type: String,
    required: true
  },
  blockHash: {
    type: String
  },
  previousHash: {
    type: String
  },
  blockIndex: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Patient', PatientSchema);