const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
};

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res
        .status(201)
        .json(new ApiResponse(201, user, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { emailOrUsername, password } = req.body;
      const data = await authService.login(emailOrUsername, password);

      // Set cookie options
      res.cookie('accessToken', data.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000 // 15 mins
      });

      res.cookie('refreshToken', data.refreshToken, cookieOptions);

      res
        .status(200)
        .json(new ApiResponse(200, data, 'Logged in successfully'));
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const data = await authService.refresh(refreshToken);

      res.cookie('accessToken', data.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000 // 15 mins
      });

      res.cookie('refreshToken', data.refreshToken, cookieOptions);

      res
        .status(200)
        .json(new ApiResponse(200, data, 'Token refreshed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      await authService.logout(refreshToken);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res
        .status(200)
        .json(new ApiResponse(200, null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const resetToken = await authService.forgotPassword(email);

      res.status(200).json(
        new ApiResponse(
          200,
          { resetToken },
          'Password reset token generated successfully (Mock flow)'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);

      res
        .status(200)
        .json(new ApiResponse(200, null, 'Password reset successfully'));
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const user = req.user.toObject();
      delete user.password;
      res
        .status(200)
        .json(new ApiResponse(200, user, 'Current user details retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = req.user;
      const { firstName, lastName, password } = req.body;

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (password) {
        user.password = password; // Will be hashed automatically by userSchema pre-save hook
      }

      await user.save();
      const updatedUser = user.toObject();
      delete updatedUser.password;

      res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async uploadProfileImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const user = req.user;
      user.profileImage = `/uploads/profiles/${req.file.filename}`;
      await user.save();

      const updatedUser = user.toObject();
      delete updatedUser.password;

      res.status(200).json(new ApiResponse(200, updatedUser, 'Profile image uploaded successfully'));
    } catch (error) {
      next(error);
    }
  }

  async removeProfileImage(req, res, next) {
    try {
      const user = req.user;
      user.profileImage = undefined;
      await user.save();

      const updatedUser = user.toObject();
      delete updatedUser.password;

      res.status(200).json(new ApiResponse(200, updatedUser, 'Profile image removed successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
