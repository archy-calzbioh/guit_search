// Import the required modules
const mongoose = require("mongoose");
const express = require("express");
const ejs = require("ejs");
const Guitar = require("./models/schema.js");
const guitars = require("./models/seeddata.js");
const app = express();
const path = require("path");
const GoogleImages = require("google-images");

require("dotenv").config();
// Set up Google Custom Search client
const { google } = require("googleapis");
const customsearch = google.customsearch("v1");
// Set up Google Images client
const client = new GoogleImages(
  process.env.GOOGLE_CSE_ID,
  process.env.GOOGLE_API_KEY
);



// Connect to the MongoDB database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//set view engine add views to path
app.set("view engine", ejs);
app.set("views", path.join(__dirname, "views"));
//set static 
app.use(express.static('public'))

//redirect from /
app.get("/", (req, res) => {
  res.redirect("/resources");
});

//Lists all instances of guitar. Index route
app.get("/resources", (req, res) => {
  Guitar.find({}, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index.ejs", { guitars: docs });
    }
  });
});

//create show route
app.get("/resources/:id", (req, res) =>{
  Guitar.findById(req.params.id).lean().exec((err, foundGuitar)=> {
  if(err){
    console.log(err)
  }else{
    
    delete foundGuitar.__v;
    delete foundGuitar._id;
    res.render("show.ejs", {guitar: foundGuitar})
  }
})
})



// //First, Insert the guitars into the database
// Guitar.insertMany(guitars)
//   .then(() => console.log("Guitars inserted successfully!"))
//   .catch((err) => console.error(err));

// Then remove duplicates

// Guitar.aggregate([
//   {
//     $group: {
//       _id: "$model",
//       uniqueIds: { $addToSet: "$_id" },
//       count: { $sum: 1 },
//     },
//   },
//   { $match: { count: { $gt: 1 } } },
// ])
//   .then((result) => {
//     result.forEach((group) => {
//       group.uniqueIds.shift(); // keep the first document
//       Guitar.deleteMany({ _id: { $in: group.uniqueIds } })
//         .then((res) => {
//           console.log(`${res.deletedCount} documents deleted`);
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });



// // Finally google images for db entries. Comment out the seed and this function so it //doesnt query forever
// Guitar.find()
//   .then(guitars => {
//     // Iterate through each guitar document
//     guitars.forEach((guitar, index) => {
//       // Perform Google image search with make and model
//       const query = `${guitar.make} ${guitar.model}`;
//       setTimeout(() => {
//         client.search(query)
//           .then(images => {
//             // Update the guitar document's img field with the first image URL
//             guitar.img = images[0].url;
//             guitar.save();
//             console.log(guitar.img);
//           })
//           .catch(err => console.error('Error searching for images:', err));
//       }, index * 2000); // Add a delay of 1 second for each iteration
//     });
//   })
//   .catch(err => console.error('Error retrieving guitars:', err));

// make a cart 
app.get('/add-to-wishlist/:id', function(req, res){
  var itemId = req.params.id;
  var cart = req.session.cart || {};

  //check if item is already in cart
  if (cart[itemId]){
    cart[itemId].qty++;

  }else{
    Guitar.findById(itemId, function(err, item){
      if (err) return res.status(500).send('Error finding item');
      if (!item) return res.status(404).send('Item not found');
      cart[itemId] = {
        item: item,
        qty: 1
      }
    })
  }

  req.session.cart = cart;
  res.redirect('/wishlist.ejs')
})


app.listen(3000, () => {
  console.log("Server started on port 3000");
});
