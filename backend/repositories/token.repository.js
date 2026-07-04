const Token = require('../models/token.model');

class TokenRepository {
  async create(tokenData) {
    const token = new Token(tokenData);
    return await token.save();
  }

  async findByToken(token) {
    return await Token.findOne({ token }).populate('user');
  }

  async revokeToken(token) {
    return await Token.findOneAndUpdate({ token }, { isRevoked: true }, { new: true });
  }

  async deleteByUser(userId) {
    return await Token.deleteMany({ user: userId });
  }

  async deleteByToken(token) {
    return await Token.deleteOne({ token });
  }
}

module.exports = new TokenRepository();
