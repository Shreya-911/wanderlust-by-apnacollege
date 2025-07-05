const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const { index } = require("../controllers/listings.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const { cloudinary, storage } = require("../cloud-config.js");
const upload = multer({ storage });

router.get("/new", isLoggedIn, listingController.new);

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('image'), validateListing, wrapAsync(listingController.create));

router.get("/search", wrapAsync(listingController.search));

router.route("/:id")
    .get(wrapAsync(listingController.show))
    .put(isLoggedIn, isOwner, upload.single('image'), validateListing, wrapAsync(listingController.update))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroy));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.edit));


module.exports = router;