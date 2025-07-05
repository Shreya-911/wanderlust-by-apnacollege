const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");
const reviewsController = require("../controllers/reviews.js");

// Post review route
router.post("/", validateReview, isLoggedIn, wrapAsync(reviewsController.create));

// Delete review route
router.delete( "/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewsController.destroy));

module.exports = router;