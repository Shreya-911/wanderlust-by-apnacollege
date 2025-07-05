const mongoose = require("mongoose");
const Listing = require("../models/listing");
const axios = require('axios');
const GEOAPIFY_KEY = 'c91fa710f96d4e7ba45d4348267299b3';

module.exports.index = async(req, res) => {
    const all_listings = await Listing.find({});
    res.render("listings/index.ejs", { all_listings });
};

module.exports.new = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.show = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    // Geocode the location string
    let listing_lat = 22.5744, listing_lon = 88.3629; // fallback values
    try {
        const geoRes = await axios.get(
            `https://api.geoapify.com/v1/geocode/search`,
            {
                params: {
                    text: `${listing.location}, ${listing.country}`,
                    apiKey: GEOAPIFY_KEY
                }
            }
        );
        if (
            geoRes.data.features &&
            geoRes.data.features.length > 0
        ) {
            listing_lon = geoRes.data.features[0].geometry.coordinates[0];
            listing_lat = geoRes.data.features[0].geometry.coordinates[1];
        }
    } catch (e) {
        console.error("Geoapify geocoding failed:", e.message);
    }

    res.render("listings/show.ejs", { listing, listing_lat, listing_lon });
};

module.exports.create = async (req, res, next) => {
    try {
        const listing = new Listing(req.body.listing);
        if (req.file) {
            listing.image = { url: req.file.path, filename: req.file.filename };
        }
        listing.owner = req.user._id;
        await listing.save();

        req.flash('success', 'Successfully created a new listing!');
        res.redirect(`/listings`);
    } catch (err) {
        next(err);
    }
};

module.exports.edit = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid listing ID!");
        return res.redirect("/listings");
    }
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalUrl = listing.image.url;
    originalUrl = originalUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalUrl });
};

module.exports.update = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid listing ID!");
        return res.redirect("/listings");
    }
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You do not have permission to edit");
        return res.redirect(`/listings/${id}`);
    }

    // Update text fields
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Update image if a new file was uploaded
    if (req.file) {
        listing.image = { url: req.file.path, filename: req.file.filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroy = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid listing ID!");
        return res.redirect("/listings");
    }
    let deleted = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};


module.exports.search = async (req, res) => {
    const { query, filter, sort } = req.query;

    if (!query && filter == 'All' && sort == 'default') {
        req.flash("error", "Search query or filter cannot be empty!");
        return res.redirect("/listings");
    }

    const searchQuery = {};

    if (query) {
        searchQuery.$or = [
            { title: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
        ];
    }

    if (filter && filter !== "All") {
        searchQuery.category = filter;
    }

    let sortQuery = {};
    if (sort === "price_asc") sortQuery = { price: 1 };
    else if (sort === "price_desc") sortQuery = { price: -1 };
    else if (sort === "title_asc") sortQuery = { title: 1 };
    else if (sort === "title_desc") sortQuery = { title: -1 };

    try {
        const listings = await Listing.find(searchQuery).sort(sortQuery);
        res.render("listings/search.ejs", { all_listings: listings });
    } catch (err) {
        req.flash("error", "Error occurred while searching listings.");
        res.redirect("/listings");
    }
};