const express = require("express");
const { ENV_PORT } = require("./environtment");
const bodyParser = require("body-parser");
const cors = require("cors");
const { usersRoutes } = require("./routes/users.routes");
const { fileRoutes } = require("./routes/files.routes");
const { photosRoutes } = require("./routes/photos.routes");
const { albumRoutes } = require("./routes/album.routes");
const { adminRoutes } = require("./routes/admin.routes");

const app = express();
const multer = require("multer");
const { donationRoutes } = require("./routes/donation.routes");
const { walletRoutes } = require("./routes/wallet.routes");
const { withDrawalRoutes } = require("./routes/withdrawal.routes");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use((req, res, next) => {
  console.log(`${req.method} | ${req.url}`);
  next();
});

app.get("/", (_, res) => {
  return res.send("Say Hi to 🙌 Ratio App Web Service");
});

app.use("/users", usersRoutes);
app.use("/files", fileRoutes);
app.use("/photos", photosRoutes);
app.use("/albums", albumRoutes);
app.use("/donation", donationRoutes);
app.use("/admin", adminRoutes);
app.use("/wallet", walletRoutes);
app.use("/withDrawals", withDrawalRoutes);

app.listen(ENV_PORT, () => {
  console.log(`ratio service listening on http://localhost:${ENV_PORT}`);
});
