const jwt = require("jsonwebtoken");
const { SECRET_KEY_JWT } = require("../environtment");

const signJwt = (userId) => {
  const token = jwt.sign({ userId: userId }, SECRET_KEY_JWT);
  return token;
};

const verifyJwt = (token) => {
  if (!token.includes("Bearer")) return false;

  const tokenParse = token.split(" ");
  if (tokenParse[1] != null) {
    const parse = jwt.verify(tokenParse[1], SECRET_KEY_JWT);
    return parse;
  }
};

module.exports = { signJwt, verifyJwt };
