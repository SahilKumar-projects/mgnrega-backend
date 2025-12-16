const express = require("express");
const router = express.Router();
const Nrega = require("../models/Nrega");

router.get("/", async (req, res) => {
  try {
    const { state, district, sortOrder } = req.query;

    let filter = {};
    let sort = {};

    if (state) {
      filter.state_name = state;
    }

    if (district) {
      filter.district_name = district;
    }

    // Sort by Total Workers
    sort["Total No. of Workers"] = sortOrder === "desc" ? -1 : 1;

    const data = await Nrega.find(filter).sort(sort).limit(100);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Filter failed" });
  }
});

module.exports = router;
