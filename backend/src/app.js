const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "NREGA Backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});


app.get("/", (req, res) => {
  res.send("NREGA Backend is running");
});


app.use("/api/data", require("./routes/data"));
app.use("/api/states", require("./routes/states"));
app.use("/api/districts", require("./routes/districts"));
app.use("/api/ai", require("./routes/ai"));

module.exports = app;
