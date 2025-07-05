const mongoose = require("mongoose");
const data = require("./data");
const Listing = require("../models/listing.js");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(mongo_url); 
}

const initDB = async () => {
  await Listing.deleteMany({});
  data.data = data.data.map((obj) => ({ ...obj, owner: "686573a8ce5957a1322c7534" }));
  await Listing.insertMany(data.data);
  console.log("New data inserted successfully");
};

initDB();
