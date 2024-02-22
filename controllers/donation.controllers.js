const midtrans = require("midtrans-client");
const { MIDTRANS_SERVER_KEY } = require("../environtment");
const { successMessageWithData, authMessage } = require("../utils/message");
const { verifyJwt } = require("../utils/jwt");
const { PrismaClient } = require("@prisma/client");
const { v4 } = require("uuid");
const { default: axios } = require("axios");
const Buffer = require("buffer").Buffer;

const prisma = new PrismaClient();

const createDonation = async (req, res) => {
  const { photoId } = req.params;
  const amount = req.body?.amount;
  const parseToken = verifyJwt(req.headers?.authorization);

  if (!parseToken) {
    return res.status(401).send(authMessage());
  }

  const prisma = new PrismaClient();

  const uuid = v4();

  const id = `DONATION-${uuid}`;

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
      order_id: id,
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

const checkStatus = async (req, res) => {
  const { orderId } = req.params;

  const tokenMidtrans = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64");

  console.log(tokenMidtrans);

  const getStatus = await axios.get(`https://api.sandbox.midtrans.com/v2/${orderId}/status`, {
    headers: {
      Authorization: `Basic ${tokenMidtrans}`,
    },
  });

  const response = {};

  // switch (getStatus.data?.transaction_status) {
  //   case "capture":
  //   case "settlement":
  //     const donation = await prisma.donation.update({
  //       where: {
  //         id: orderId,
  //       },
  //       data: {
  //         status: "SUCCESS",
  //       },
  //     });
  //     response.status = donation.status;
  //     break;
  //   case "deny":
  //   case "cancel":
  //   case "expire":
  //     const donation = await prisma.donation.update({
  //       where: {
  //         id: orderId,
  //       },
  //       data: {
  //         status: "SUCCESS",
  //       },
  //     });
  //     response.status = donation.status;
  //     break;
  //   default:
  //     break;
  // }

  return res.send(successMessageWithData(response));
};

module.exports = { createDonation, checkStatus };
