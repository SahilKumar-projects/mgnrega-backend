const mongoose = require("mongoose");

const nregaSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Nrega", nregaSchema, "records");
