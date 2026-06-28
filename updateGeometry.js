require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("./models/listing");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN,
});

async function updateGeometry() {
    try {
        await mongoose.connect(process.env.ATLASDB_URL);

        console.log("✅ Database Connected");

        const listings = await Listing.find({});

        for (let listing of listings) {

            if (
                listing.geometry &&
                listing.geometry.coordinates &&
                listing.geometry.coordinates.length > 0
            ) {
                console.log(`Skipping: ${listing.title}`);
                continue;
            }

            console.log(`Updating: ${listing.title}`);

            const response = await geocodingClient.forwardGeocode({
                query: listing.location,
                limit: 1,
            }).send();

            if (
                response.body.features &&
                response.body.features.length > 0
            ) {

                listing.geometry = response.body.features[0].geometry;

                await listing.save();

                console.log(`✅ Updated ${listing.title}`);

            } else {

                console.log(`❌ Location not found: ${listing.location}`);

            }
        }

        console.log("🎉 All listings processed.");

        mongoose.connection.close();

    } catch (err) {

        console.log(err);

        mongoose.connection.close();

    }
}

updateGeometry();