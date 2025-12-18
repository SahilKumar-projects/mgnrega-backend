const express = require("express");
const router = express.Router();
const Nrega = require("../models/Nrega");

// Cache districts per state
const districtsCache = {};

router.get("/", async (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      return res.json([]);
    }

    // return cached districts if available
    if (districtsCache[state]) {
      return res.json(districtsCache[state]);
    }

    // first request for this state hits DB
    const districts = await Nrega.distinct("district_name", {
      state_name: state,
    });

    districtsCache[state] = districts; // cache it
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: "Failed to load districts" });
  }
});

module.exports = router;
