import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');

  // Check if token exists
  if (!authHeader) {
    return res.status(401).json({
      error: 'No token provided',
      solution: 'Please login to get an access token'
    });
  }

  // Validate token format: Bearer <token>
  const tokenParts = authHeader.split(' ');

  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Invalid token format',
      solution: 'Token should be in format: Bearer <token>'
    });
  }

  const token = tokenParts[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure required fields exist in token
    if (!decoded.userId || !decoded.role) {
      throw new Error('Invalid token payload');
    }

    // Attach user info to request object
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      hotelId: decoded.hotelId || null // for SUPERADMIN it may be undefined
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    let errorMessage = 'Invalid token';
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expired';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Malformed token';
    }

    res.status(401).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;



    if (!userRole || !allowedRoles.includes(userRole)) {
      console.warn(
        `Unauthorized access attempt by ${req.user?.email || 'unknown'} (${userRole})`
      );
      return res.status(403).json({
        error: 'Forbidden',
        message: `Requires one of roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
