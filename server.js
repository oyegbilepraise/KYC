const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "*",
};

// middlewaress

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// routes
const kycRoute = require("./routes/kycRoutes");
const more_widget = require("./routes/more.widget");
const advancly = require("./routes/advancly.routes");
const bolt = require("./routes/bolt.routes");
const opsflow = require("./routes/opsflow.routes");

app.use("/api", kycRoute);
app.use("/api/more-widget", more_widget);
app.use("/api/advancly", advancly);
app.use("/api/bolt", bolt);
app.use("/api/opsflow", opsflow);

// testing...

app.get("/", (req, res) => {
  res.json({ message: "Hello APi" });
});

const PORT = process.env.PORT || 1000;

app.listen(PORT, () => {
  console.log("server is listening to port " + PORT);
});