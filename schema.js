const joi = require("joi");

const listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required(),
        location: joi.string().required(),
        country: joi.string().required(),
        price: joi.number().required().min(0),
        image: joi.object({
            url: joi.string().uri().required(),
            filename: joi.string().required()
        }).optional(),
        category: joi.string().valid(
            "Beach",
            "Mountain",
            "City",
            "Historic",
            "Treehouse",
            "Cabin",
            "Luxury",
            "Ski",
            "Safari"
        ).required()
    }).required()
});

const reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required(),
    }).required()
});

module.exports = { listingSchema, reviewSchema };
