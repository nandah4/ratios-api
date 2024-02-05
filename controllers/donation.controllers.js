const midtrans = require("midtrans-client");
const { MIDTRANS_SERVER_KEY } = require("../environtment");
const { successMessageWithData } = require("../utils/message");

const createDonation = async (req, res) => {
  const { orderId } = req.body;
  const snap = new midtrans.Snap({
    isProduction: false,
    serverKey: MIDTRANS_SERVER_KEY,
  });

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: 10000,
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
