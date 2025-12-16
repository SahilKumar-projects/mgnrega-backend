const express = require("express");
const router = express.Router();
const Nrega = require("../models/Nrega");

router.get("/", async (req, res) => {
  const states = await Nrega.distinct("state_name");
  res.json(states);
});

module.exports = router;
