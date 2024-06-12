const jwt = require('jsonwebtoken');
module.exports = async function (req, res, next) {
  try {
    if (!req.headers['authorization']) {
      return res.status(400).send({
        message: 'Token is required',
      });
    }
    const token = req.headers['authorization'];
    const decoded = jwt.verify(token, 'abcde');
    console.log(decoded);
    if(!decoded){
      return res.json({
        message:'Invalid token'
      });
    }
    console.log(decoded.email);
    const findUserQuery = 'SELECT email FROM User WHERE email = $1';
    const findUserParams = [decoded.email];
    const findUserResult = await sails.sendNativeQuery(findUserQuery, findUserParams);
    if(findUserResult.rows.length<=0){
      return res.status(400).json({
        message:'No User Found'
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Invalid or Expired', error: error.message });
  }
  next();
};
