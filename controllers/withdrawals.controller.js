const { PrismaClient } = require("@prisma/client");
const {
  successCreateMessageWithData,
  successMessageWithData,
  badRequestMessage,
} = require("../utils/message");
const { matchPassword } = require("../utils/password");

const createWithdrawal = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const amount = req.body?.amount;
  const password = req.body?.password;

  const prisma = new PrismaClient();

  const user = await prisma.user.findFirst({
    where: {
      id: parseToken?.userId,
    },
  });

  const isPasswordValid = await matchPassword(password, user.password);

  if (isPasswordValid) {
    const prisma = new PrismaClient();

    const withDrawal = prisma.withDrawals.create({
      data: {
        amount: amount,
        userId: parseToken?.id,
      },
    });

    return res.send(successMessageWithData(withDrawal));
  }

  return res.status(400).send(badRequestMessage([]));
};

module.exports = { createWithdrawal };
