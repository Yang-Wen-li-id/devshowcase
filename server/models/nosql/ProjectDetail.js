const mongoose = require('mongoose');

const ChangelogSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    trim: true,
  },
  releaseDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    required: true,
  },
}, { _id: false });

const ProjectDetailSchema = new mongoose.Schema({
  projectId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  markdownContent: {
    type: String,
    required: true,
    default: '',
  },
  architectureDiagramUrl: {
    type: String,
    default: '',
  },
  systemSpecs: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  changelog: {
    type: [ChangelogSchema],
    default: [],
  },
}, {
  timestamps: true,
  collection: 'project_details',
});

module.exports = mongoose.model('ProjectDetail', ProjectDetailSchema);
