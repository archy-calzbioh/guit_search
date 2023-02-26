// Import the required modules
const mongoose = require("mongoose");
const express = require("express");
const ejs = require("ejs");
const Guitar = require("/Users/zacharybolich/guitarshop/models/schema.js");
const guitars = require("/Users/zacharybolich/guitarshop/models/seeddata.js");
const app = express();
const path = require("path");
const GoogleImages = require("google-images");
require("dotenv").config();
// Connect to the MongoDB database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set up Google Images client
const client = new GoogleImages(
  process.env.GOOGLE_CSE_ID,
  process.env.GOOGLE_API_KEY
);


// // Insert the guitars into the database
// Guitar.insertMany(guitars)
//   .then(() => console.log("Guitars inserted successfully!"))
//   .catch((err) => console.error(err));

//remove duplicates

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

// Set up Google Custom Search client
const { google } = require("googleapis");
const customsearch = google.customsearch("v1");

// // Perform Google Custom Search with site restriction and make/model query
// const query = `${Guitar.make} ${Guitar.model}`;
// customsearch.cse
//   .list({
//     auth: process.env.GOOGLE_API_KEY,
//     cx: process.env.GOOGLE_CSE_ID,
//     q: query,
//     siteSearch: "https://www.sweetwater.com/",
//   })
//   .then((response) => {
//     // Update the guitar document's img field with the first image URL
//     Guitar.img = response.data.items[0].link;

//     console.log(
//       "Remaining queries:",
//       response.data.searchInformation.queries.remainingQuota
//     );
//   })
//   .catch((err) => {
//     console.error("Error searching for images:", err);
//   });

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

// // Retrieve all documents from the database
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
//             console.log('Remaining queries:', images.quotaRemaining);
//           })
//           .catch(err => console.error('Error searching for images:', err));
//       }, index * 2000); // Add a delay of 1 second for each iteration
//     });
//   })
//   .catch(err => console.error('Error retrieving guitars:', err));


// Retrieve all documents from the database
Guitar.find()
  .then((guitars) => {
    // Iterate through each guitar document
    guitars.forEach((guitar, index) => {
      // Perform Google Custom Search with site restriction and make/model query
      const query = `${guitar.make} ${guitar.model}`;
      setTimeout(() => {
        customsearch.cse
          .list({
            auth: process.env.GOOGLE_API_KEY,
            cx: process.env.GOOGLE_CSE_ID,
            q: query,
            siteSearch: "https://www.sweetwater.com/",
          })
          .then((response) => {
            // Update the guitar document's img field with the first image URL
            guitar.img = response.data.items[0].link;
            console.log(guitar.img)
            guitar.save();


          })
          .catch((err) => {
            console.error("Error searching for images:", err);
          });
      }, index * 2000); // Add a delay of 2 seconds for each iteration
    });
  })
  .catch((err) => console.error("Error retrieving guitars:", err));


app.listen(3000, () => {
  console.log("Server started on port 3000");
});
