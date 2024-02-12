const express = require("express");
const { ENV_PORT } = require("./environtment");
const bodyParser = require("body-parser");
const cors = require("cors");
const { usersRoutes } = require("./routes/users.routes");
const { fileRoutes } = require("./routes/files.routes");
const { photosRoutes } = require("./routes/photos.routes");
const { albumRoutes } = require("./routes/album.routes");

const app = express();
const multer = require("multer");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (_, res) => {
  console.log(_.protocol);
  return res.send("Say Hi to 🙌 Ratio App Web Service");
});

app.use("/users", usersRoutes);
app.use("/files", fileRoutes);
app.use("/photos", photosRoutes);
app.use("/albums", albumRoutes);

app.listen(ENV_PORT, () => {
  console.log(`ratio service listening on http://localhost:${ENV_PORT}`);
});

