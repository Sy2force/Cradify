const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
  const payload = {
    _id: user._id,
    email: user.email,
    isAdmin: user.isAdmin,
    isBusiness: user.isBusiness
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
