const express = require("express");
const router = express.Router();
const Nrega = require("../models/Nrega");

let statesCache = null; //  in-memory cache

router.get("/", async (req, res) => {
  try {
    //  return cached data if available
    if (statesCache) {
      return res.json(statesCache);
    }

    //  first request hits DB
    const states = await Nrega.distinct("state_name");

    statesCache = states; // cache it
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: "Failed to load states" });
  }
});

module.exports = router;

