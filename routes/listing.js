const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listings.js");
console.log("Listing Controller:");
console.log(listingController);

const {
    validateListing,
    isLoggedIn,
    saveRedirectUrl
} = require("../middleware.js");
console.log({
    validateListing,
    isLoggedIn,
    saveRedirectUrl
});

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// INDEX & CREATE
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

// NEW
router.get(
    "/new",
    isLoggedIn,
    saveRedirectUrl,
    wrapAsync(listingController.renderNewForm)
);

// SHOW, UPDATE, DELETE
router.route("/:id")
    .get(wrapAsync(listingController.showListings))
    .put(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        wrapAsync(listingController.destroyListing)
    );

// EDIT
router.get(
    "/:id/edit",
    isLoggedIn,
    wrapAsync(listingController.renderEditForm)
);

module.exports = router;