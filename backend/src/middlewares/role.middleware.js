// Role-based access control middlewares

exports.adminOnly = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

exports.businessOnly = (req, res, next) => {
  if (!req.user || (!req.user.isBusiness && !req.user.isAdmin)) {
    return res.status(403).json({ 
      message: 'Access denied. Business privileges required.' 
    });
  }
  next();
};

exports.ownerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    const resourceId = req.params[paramName];
    
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Admin can access anything
    if (req.user.isAdmin) {
      return next();
    }
    
    // Check if user is the owner
    if (req.user._id.toString() === resourceId) {
      return next();
    }
    
    return res.status(403).json({ 
      message: 'Access denied. You can only access your own resources.' 
    });
  };
};
