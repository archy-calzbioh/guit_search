// Import the required modules
const mongoose = require("mongoose");
const express = require("express");
const ejs = require("ejs").__express;
const Guitar = require("./models/schema.js");
const guitars = require("./models/seeddata.js");
const app = express();
const path = require("path");
const GoogleImages = require("google-images");
const ejsLint = import("ejs-lint");
const cookieParser = require("cookie-parser");

//set view engine add views to path
app.set("view engine", ejs);
app.set("views", path.join(__dirname, "views"));
//set static 
app.use(express.static('public'))

require("dotenv").config();
// Set up Google Custom Search client
const { google } = require("googleapis");
const customsearch = google.customsearch("v1");
// Set up Google Images client
const client = new GoogleImages(
  process.env.GOOGLE_CSE_ID,
  process.env.GOOGLE_API_KEY
);

// Add cookie-parser middleware
app.use(cookieParser());

//initilize cookie middleware
app.use((req, res, next) => {
  if (!req.cookies.wishlist) {
    res.cookie("wishlist", []);
  }
  next();
});


// Connect to the MongoDB database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



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
    
   
    res.render("show.ejs", {guitar: foundGuitar})
  }
})
})

//new route
app.get("/new", (req, res) => {
  res.render("new.ejs");
});

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

//wishlist route
app.get("/wishlist", async (req, res) => {
  const wishlist = req.cookies.wishlist;
  const guitarIds = wishlist.map((item) => item.id);

  try {
    const guitars = await Guitar.find({ _id: { $in: guitarIds } }).lean();
    res.render("wishlist.ejs", { wishlist: wishlist, guitars: guitars });
  } catch (err) {
    console.log(err);
    res.send("Error retrieving guitars from database.");
  }
});
//add-to-wishlist route
app.get("/add-to-wishlist/:id", async (req, res) => {
  const itemId = req.params.id;

  try {
    const guitar = await Guitar.findById(itemId).lean();
    if (!guitar) {
      res.status(404).send("Guitar not found");
      return;
    }

    const itemIndex = req.cookies.wishlist.findIndex(
      (item) => item.id === itemId
    );
    if (itemIndex !== -1) {
      req.cookies.wishlist[itemIndex].quantity += 1;
    } else {
      const item = {
        id: itemId,
        quantity: 1,
        price: guitar.price,
      };
      req.cookies.wishlist.push(item);
    }
    res.cookie("wishlist", req.cookies.wishlist);
    res.redirect(`/wishlist`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

//empty wishlist 
app.get("/empty-wishlist", (req, res) => {
  res.cookie("wishlist", []);
  res.redirect("/wishlist");
});



//post route add a guitar
app.post("/resources", (req, res) => {
  const guitar = new Guitar({
    make: req.body.make,
    model: req.body.model,
    price: req.body.price,
    img: req.body.img,
  });

  guitar.save((err, doc) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error creating guitar");
    } else {
      res.redirect("/resources");
    }
  });
});




app.listen(3000, () => {
  console.log("Server started on port 3000");
});
