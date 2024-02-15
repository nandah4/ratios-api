const midtrans = require("midtrans-client");
const { MIDTRANS_SERVER_KEY } = require("../environtment");
const { successMessageWithData, authMessage } = require("../utils/message");
const { verifyJwt } = require("../utils/jwt");
const { PrismaClient } = require("@prisma/client");
const { v4 } = require("uuid");

const createDonation = async (req, res) => {
  const { photoId } = req.params;
  const amount = req.body?.amount;
  const parseToken = verifyJwt(req.headers?.authorization);

  if (!parseToken) {
    return res.status(401).send(authMessage());
  }

  const prisma = new PrismaClient();

  const uuid = v4();

  const user = await prisma.user.findFirst({
    where: {
      id: parseToken.id,
    },
  });

  const photo = await prisma.photo.findFirst({
    where: {
      id: photoId,
    },
  });

  const snap = new midtrans.Snap({
    isProduction: false,
    serverKey: MIDTRANS_SERVER_KEY,
  });

  const payload = {
    transaction_details: {
      order_id: `DONATION-${uuid}`,
      gross_amount: amount,
    },
    customer_details: {
      email: user.email,
    },
  };

  const createTransaction = await snap.createTransaction(payload);

  return res.send(
    successMessageWithData({
      token: createTransaction?.token,
      redirectUrl: createTransaction?.redirect_url,
    })
  );
};

module.exports = { createDonation };
