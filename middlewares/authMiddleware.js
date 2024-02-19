const { PrismaClient } = require("@prisma/client");
const { verifyJwt } = require("../utils/jwt");
const { authMessage, badRequestMessage } = require("../utils/message");

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).send(authMessage());
  }

  const parse = verifyJwt(authorization);
  if (!parse || !parse?.userId) {
    return res.status(401).send(
      badRequestMessage({
        messages: [
          {
            message: "Invalid token provided",
          },
        ],
      })
    );
  }

  const prisma = new PrismaClient();
  const findUser = await prisma.user.findFirst({
    where: {
      id: parse?.userId,
    },
  });

  if (!findUser) {
    return res.status(404).send(
      badRequestMessage({
        messages: [
          {
            field: "userId",
            message: "User not found",
          },
        ],
      })
    );
  }
  return next();
};

const authMiddlewareAdmin = async(req, res, next) => {
  const authorization = req.headers.authorization;

  try {
    if(!authorization) {
      return res.status(200).send(authMessage());
    }
  } catch (error) {
    
  }
}
module.exports = { authMiddleware };
