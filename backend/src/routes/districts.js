const express = require("express");
const router = express.Router();
const Nrega = require("../models/Nrega");

router.get("/", async (req, res) => {
  const { state } = req.query;
  const districts = await Nrega.distinct("district_name", {
    state_name: state
  });
  res.json(districts);
});

module.exports = router;
