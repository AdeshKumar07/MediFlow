const User = require('../models/user.model');

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findByUsername(username) {
    return await User.findOne({ username }).select('+password');
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByResetToken(token) {
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async existsByEmail(email) {
    return await User.exists({ email });
  }

  async existsByUsername(username) {
    return await User.exists({ username });
  }
}

module.exports = new UserRepository();
