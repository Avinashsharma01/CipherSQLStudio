const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  tables_used: { type: [String], required: true },
  expected_hint: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Assignment', assignmentSchema);
