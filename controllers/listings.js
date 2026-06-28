const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
console.log("MAP TOKEN:", mapToken);

const geocodingClient = mbxGeocoding({
    accessToken: mapToken,
});

// =======================
// INDEX
// =======================
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index", { allListings });
};

// =======================
// NEW FORM
// =======================
module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

// =======================
// SHOW LISTING
// =======================
module.exports.showListings = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        });

    if (!listing) {
        req.flash("error", "Listing doesn't exist.");
        return res.redirect("/listings");
    }

    res.render("./listings/show.ejs", {
        listing,
        currUser: res.locals.currUser,
    });
};

// =======================
// CREATE LISTING
// =======================
module.exports.createListing = async (req, res) => {
    try {
        const response = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1,
            })
            .send();

        console.log("========== MAPBOX RESPONSE ==========");
        console.log(JSON.stringify(response.body, null, 2));
        console.log("=====================================");

        if (
            !response.body.features ||
            response.body.features.length === 0
        ) {
            req.flash("error", "Location not found.");
            return res.redirect("/listings/new");
        }

        const { path: url, filename } = req.file;

        const newListing = new Listing(req.body.listing);

        newListing.owner = req.user._id;
        newListing.image = {
            url,
            filename,
        };

        newListing.geometry = response.body.features[0].geometry;

        await newListing.save();

        console.log("Listing saved successfully");
        console.log(newListing.geometry);

        req.flash("success", "New Listing Created!");
        return res.redirect("/listings");

    } catch (err) {
        console.log(err);

        req.flash("error", err.message);
        return res.redirect("/listings/new");
    }
};

// =======================
// EDIT FORM
// =======================
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    const originalImageUrl = listing.image.url.replace(
        "/upload",
        "/upload/h_250,w_250"
    );

    res.render("listings/edit", {
        listing,
        originalImageUrl,
    });
};

// =======================
// UPDATE LISTING
// =======================
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const updatedListing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    if (req.file) {
        updatedListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };

        await updatedListing.save();
    }

    req.flash("success", "Listing Updated!");
    return res.redirect(`/listings/${id}`);
};

// =======================
// DELETE LISTING
// =======================
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    return res.redirect("/listings");
};
console.log(module.exports);