const mongoose = require('mongoose');

const AccessLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  path: {
    type: String,
    required: true,
    index: true,
  },
  targetProjectId: {
    type: Number,
    default: null,
    index: true,
  },
  ipAddress: {
    type: String,
    required: true,
    default: '127.0.0.1',
  },
  userAgent: {
    type: String,
    default: 'Unknown',
  },
  responseTimeMs: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: false,
  collection: 'access_logs',
});

// Index for analytics queries
AccessLogSchema.index({ timestamp: -1 });
AccessLogSchema.index({ targetProjectId: 1, timestamp: -1 });

module.exports = mongoose.model('AccessLog', AccessLogSchema);
