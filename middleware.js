const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

const { listingSchema, reviewSchema } = require("./schema.js");

const ExpressError = require("./utils/ExpressError.js");

const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You ain't author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    next();
};

const validateListing = (req, res, next) => {

    const { error } = listingSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    next();
};

const saveRedirectUrl = (req, res, next) => {

    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }

    next();
};

const isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {

        req.session.redirectUrl = req.originalUrl;

        req.flash("error", "You must log in");

        return res.redirect("/login");
    }

    next();
};

module.exports = {
    validateListing,
    validateReview,
    isLoggedIn,
    saveRedirectUrl,
    isReviewAuthor
};