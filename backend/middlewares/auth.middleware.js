const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const userRepository = require('../repositories/user.repository');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new ApiError(401, 'Not authorized to access this resource'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      // Select fields and attach user to request object
      const user = await userRepository.findById(decoded.id);
      if (!user || !user.isActive) {
        return next(new ApiError(401, 'User account is deactivated or deleted'));
      }

      req.user = user;
      next();
    } catch (err) {
      return next(new ApiError(401, 'Token verification failed, login again'));
    }
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role '${req.user.role}' is not authorized to access this path`
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
