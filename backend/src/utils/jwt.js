const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
  const payload = {
    _id: user._id,
    email: user.email,
    isAdmin: user.isAdmin || false,
    isBusiness: user.isBusiness || false
  };
  
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
