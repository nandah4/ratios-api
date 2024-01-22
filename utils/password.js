const bycrypt = require("bcrypt");
const hashPassword = async (password) => {
  const salt = await bycrypt.genSalt(10);

  const hash = await bycrypt.hash(password, salt);
  return hash;
};

const matchPassword = async (password, savePassword) => {
  const isMatch = await bycrypt.compare(password, savePassword);
  return isMatch;
};

module.exports = { hashPassword, matchPassword };
