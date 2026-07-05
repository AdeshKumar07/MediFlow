const mongoose = require('mongoose');

const hospitalImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true
    },
    filename: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [200, 'Caption cannot exceed 200 characters']
    },
    address: {
      type: String,
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    details: {
      type: String,
      trim: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HospitalImage', hospitalImageSchema);
