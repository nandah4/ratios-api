require("dotenv").config();
const ENV_PORT = process.env.PORT;
const SECRET_KEY_JWT = process.env.SECRET_KEY_JWT;
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

module.exports = { ENV_PORT, SECRET_KEY_JWT, MIDTRANS_SERVER_KEY };
