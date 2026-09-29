const mongoose = require('mongoose');

const CATEGORIES = ['Nature', 'Animals', 'City', 'Travel', 'People', 'Food', 'Other'];

const photoSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, enum: CATEGORIES, default: 'Other' },
    date: { type: Date, default: Date.now },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Photo', photoSchema);
module.exports.CATEGORIES = CATEGORIES;
