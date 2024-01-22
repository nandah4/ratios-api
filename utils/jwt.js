const jwt = require("jsonwebtoken");
const { SECRET_KEY_JWT } = require("../environtment");

const signJwt = (userId) => {
  const token = jwt.sign({ userId: userId }, SECRET_KEY_JWT);
  return token;
};

const verifyJwt = (token) => {
  const parse = jwt.verify(token, SECRET_KEY_JWT);
  return parse;
};

module.exports = { signJwt, verifyJwt };
