require("dotenv").config();
const ENV_PORT = process.env.PORT;
const SECRET_KEY_JWT = process.env.SECRET_KEY_JWT;

module.exports = { ENV_PORT, SECRET_KEY_JWT };
