const { PrismaClient } = require("@prisma/client");
const { verifyJwt } = require("../utils/jwt");
const { authMessage } = require("../utils/message");

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (authorization) {
    const parse = verifyJwt(authorization);
    if (parse?.userId) {
      const prisma = new PrismaClient();
      const findUser = await prisma.user.findFirst({
        where: {
          id: parse?.userId,
        },
      });
      if (findUser) {
        return next();
      }
    }
  }

  return res.send(authMessage());
};

module.exports = { authMiddleware };
