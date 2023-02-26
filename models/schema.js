const mongoose = require('mongoose')


// Create the schema
const guitarSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ["acoustic", "electric"], required: true },
});

//create model
const Guitar = mongoose.model("Guitar", guitarSchema);
module.exports = Guitar

