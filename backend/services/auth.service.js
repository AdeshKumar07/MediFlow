const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const tokenRepository = require('../repositories/token.repository');
const ApiError = require('../utils/apiError');
const ROLES = require('../constants/roles');

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );
  }

  async register(userData) {
    const emailExists = await userRepository.existsByEmail(userData.email);
    if (emailExists) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const usernameExists = await userRepository.existsByUsername(userData.username);
    if (usernameExists) {
      throw new ApiError(400, 'Username is already taken');
    }

    // Allow role-wise self-registration, but enforce security:
    // Only Patients (PATIENT) are active by default.
    // All other roles (DOCTOR, RECEPTIONIST, etc.) require Super Admin verification.
    if (!userData.role) {
      userData.role = ROLES.PATIENT;
    }

    if (userData.role === ROLES.PATIENT) {
      userData.isActive = true;
    } else {
      userData.isActive = false;
    }

    const user = await userRepository.create(userData);
    
    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

  async login(emailOrUsername, password) {
    // Try finding user by email, fallback to username
    let user;
    if (emailOrUsername.includes('@')) {
      user = await userRepository.findByEmail(emailOrUsername);
    } else {
      user = await userRepository.findByUsername(emailOrUsername);
    }

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      if (user.role !== ROLES.PATIENT) {
        throw new ApiError(403, 'Your account is pending verification by a Super Admin. Please contact administration.');
      }
      throw new ApiError(403, 'Your account is deactivated. Please contact administration.');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshTokenString = this.generateRefreshToken(user);

    // Save refresh token in DB
    const decodedRefresh = jwt.verify(refreshTokenString, process.env.JWT_REFRESH_SECRET);
    const expiresAt = new Date(decodedRefresh.exp * 1000);

    await tokenRepository.create({
      user: user._id,
      token: refreshTokenString,
      expiresAt
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      accessToken,
      refreshToken: refreshTokenString
    };
  }

  async refresh(refreshTokenStr) {
    if (!refreshTokenStr) {
      throw new ApiError(401, 'Refresh token is missing');
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshTokenStr, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    // Look up token in repository
    const storedToken = await tokenRepository.findByToken(refreshTokenStr);
    if (!storedToken || storedToken.isRevoked) {
      throw new ApiError(401, 'Refresh token is invalid or has been revoked');
    }

    const user = await userRepository.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'User account is inactive or not found');
    }

    // Revoke current refresh token (rotation policy)
    await tokenRepository.deleteByToken(refreshTokenStr);

    // Generate fresh pair of tokens
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    const newDecodedRefresh = jwt.verify(newRefreshToken, process.env.JWT_REFRESH_SECRET);
    const expiresAt = new Date(newDecodedRefresh.exp * 1000);

    await tokenRepository.create({
      user: user._id,
      token: newRefreshToken,
      expiresAt
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  async logout(refreshTokenStr) {
    if (refreshTokenStr) {
      await tokenRepository.deleteByToken(refreshTokenStr);
    }
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User with this email does not exist');
    }

    // Generate a simple hex reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set token & expiry (10 minutes)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // In a real application, we would email this. For this module, we return it to the user.
    return resetToken;
  }

  async resetPassword(token, newPassword) {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    
    // Invalidate all active sessions on password change for safety
    await tokenRepository.deleteByUser(user._id);

    return true;
  }
}

module.exports = new AuthService();
