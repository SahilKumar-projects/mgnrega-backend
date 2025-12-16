const express = require("express");
const router = express.Router();
const Nrega = require("../models/Nrega");

router.get("/", async (req, res) => {
  const data = await Nrega.findOne();
  res.json(data);
});

module.exports = router;
