import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true,
    index: true,
  },
  targetRole: {
    type: String,
    required: true,
    maxlength: 100,
  },
  score: {
    type: Number,
    default: null,
    validate: {
      validator: (value) => value === null || (Number.isFinite(value) && value >= 0 && value <= 100),
      message: 'Score must be null or a number from 0 to 100.',
    },
  },
  verdict: {
    type: String,
    required: true,
  },
  skillsFound: {
    type: [String],
    required: true,
    default: [],
  },
  skillsMissing: {
    type: [String],
    required: true,
    default: [],
  },
  topFixes: {
    type: [String],
    required: true,
    default: [],
    validate: {
      validator: (fixes) => fixes.length <= 3,
      message: 'At most three improvement suggestions may be stored.',
    },
  },
  fallback: {
    type: Boolean,
    required: true,
  },
  inputTokens: {
    type: Number,
    required: true,
    min: 0,
  },
  outputTokens: {
    type: Number,
    required: true,
    min: 0,
  },
  costInr: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'analyses',
  strict: 'throw',
  versionKey: false,
});

analysisSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);
