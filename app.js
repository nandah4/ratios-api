const express = require("express");
const { ENV_PORT } = require("./environtment");
const bodyParser = require("body-parser");
const cors = require("cors");
const { usersRoutes } = require("./routes/users.routes");
const { fileRoutes } = require("./routes/files.routes");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (_, res) => {
  return res.send("Say Hi to 🙌 Ratio App Web Service");
});

app.use("/users", usersRoutes);
app.use("/files", fileRoutes);

app.listen(ENV_PORT, () => {
  console.log(`ratio service listening on http://localhost:${ENV_PORT}`);
});
