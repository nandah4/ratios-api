const { PrismaClient } = require("@prisma/client");
const { verifyJwt } = require("../utils/jwt");
const { successMessageWithData } = require("../utils/message");

const getWallet = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const prisma = new PrismaClient();

  const donation = await prisma.donation.findMany({
    where: {
      status: "SUCCESS",
      photo: {
        user: {
          id: parseToken?.userId,
        },
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const withDrawals = await prisma.withDrawals.findMany({
    where: {
      user: {
        id: parseToken?.userId,
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const amount =
    donation?.reduce((a, b) => a + b.amount, 0) - withDrawals?.reduce((a, b) => a + b.amount, 0);

  return res.send(
    successMessageWithData({
      amount,
      withDrawals,
      donation,
    })
  );
};

module.exports = { getWallet };
