const jwt = require("jsonwebtoken");
const { SECRET_KEY_JWT } = require("../environtment");

const signJwt = (userId) => {
  const token = jwt.sign({ userId: userId }, SECRET_KEY_JWT);
  return token;
};

const verifyJwt = (token) => {

  if (!token || typeof token !== 'string') {
    return false;
  };

  if (!token.includes("Bearer")) {
    return false;
  }

  const tokenParse = token.split(" ");
  if (tokenParse.length !== 2 || !tokenParse[1]){
    return false;
  }

  try {
    const parse = jwt.verify(tokenParse[1], SECRET_KEY_JWT);
    return parse;
  } catch (error) {
    console.log("Error verifying JWT");
    return false;
  }
};

module.exports = { signJwt, verifyJwt };
