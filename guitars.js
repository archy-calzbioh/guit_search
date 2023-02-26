// Import the required modules
const mongoose = require("mongoose");
const express = require("express");
const ejs = require("ejs");
const Guitar = require("/Users/zacharybolich/guitarshop/models/schema.js");
const guitars = require("/Users/zacharybolich/guitarshop/models/seeddata.js");
const app = express();
const path = require("path");
require("dotenv").config();
// Connect to the MongoDB database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// // Insert the guitars into the database
// Guitar.insertMany(guitars)
//   .then(() => console.log("Guitars inserted successfully!"))
//   .catch((err) => console.error(err));

//remove duplicates

Guitar.aggregate([
  {
    $group: {
      _id: "$model",
      uniqueIds: { $addToSet: "$_id" },
      count: { $sum: 1 },
    },
  },
  { $match: { count: { $gt: 1 } } },
])
  .then((result) => {
    result.forEach((group) => {
      group.uniqueIds.shift(); // keep the first document
      Guitar.deleteMany({ _id: { $in: group.uniqueIds } })
        .then((res) => {
          console.log(`${res.deletedCount} documents deleted`);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  })
  .catch((err) => {
    console.log(err);
  });

//set view engine add views to path
app.set("view engine", ejs);
app.set("views", path.join(__dirname, "views"));
//set static 
app.use(express.static('public'))
//render guitars make and model
app.get("/", (req, res) => {
  Guitar.find({}, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index.ejs", { guitars: docs });
    }
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
