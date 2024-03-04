const midtrans = require("midtrans-client");
const { MIDTRANS_SERVER_KEY } = require("../environtment");
const { successMessageWithData, authMessage } = require("../utils/message");
const { verifyJwt } = require("../utils/jwt");
const { PrismaClient } = require("@prisma/client");
const { v4 } = require("uuid");
const { default: axios } = require("axios");
const { log } = require("console");
const Buffer = require("buffer").Buffer;

const getDonation = async (req, res) => {
  const prisma = new PrismaClient();

  const { currentPage = 1 } = req.query;

  try {
    const per_page = parseInt(req.query.page);
    const offset = (currentPage - 1) * per_page;

    const total_donation = await prisma.donation.count({
      where: {
        user: {
          role: "USER",
        },
      },
    });

    const total_page = Math.ceil(total_donation / per_page);

    let getAllDonation;

    if (currentPage && per_page) {
      getAllDonation = await prisma.donation.findMany({
        where: {
          user: {
            role: "USER",
          },
        },
        skip: offset,
        take: per_page,
        orderBy: {
          createdAt: "desc",
        },
      });

      const responseData = {
        page: currentPage,
        per_page: per_page,
        total_donation: total_donation,
        total_all_page: total_page,
        data: [...getAllDonation],
      };
      return res.send(successMessageWithData(responseData));
    } else {
      getAllDonation = await prisma.donation.findMany({
        where: {
          user: {
            role: "USER",
          },
        },
        take: 8,
        orderBy: {
          createdAt: "desc",
        },
      });

      const responseData = {
        page: currentPage,
        per_page: per_page,
        total_donation: total_donation,
        total_all_page: total_page,
        data: [...getAllDonation],
      };
      return res.send(successMessageWithData(responseData));
    }
  } catch (error) {
    console.log(error);
  }
};

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

  const adminFee = await prisma.adminFee.create({
    data: {
      amount: 1000,
      donation: {
        create: {
          id: id,
          amount: parseInt(amount),
          userId: user.id,
          photoId: photo.id,
        },
      },
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
      donationId: id,
      token: createTransaction?.token,
      redirectUrl: createTransaction?.redirect_url,
    })
  );
};

const checkStatus = async (req, res) => {
  const { orderId } = req.params;
  const prisma = new PrismaClient();

  const tokenMidtrans = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64");

  const getStatus = await axios.get(`https://api.sandbox.midtrans.com/v2/${orderId}/status`, {
    headers: {
      Authorization: `Basic ${tokenMidtrans}`,
    },
  });

  const response = {};

  switch (getStatus.data?.transaction_status) {
    case "capture":
    case "settlement": {
      const donation = await prisma.donation.update({
        where: {
          id: orderId,
        },
        data: {
          status: "SUCCESS",
        },
      });
      response.status = donation.status;
      break;
    }
    case "deny":
    case "cancel":
    case "expire": {
      const donation = await prisma.donation.update({
        where: {
          id: orderId,
        },
        data: {
          status: "FAILED",
        },
      });
      response.status = donation.status;
      break;
    }
    default:
      response.status = "PENDING";
      break;
  }

  return res.send(successMessageWithData(response));
};

module.exports = { createDonation, checkStatus, getDonation };
