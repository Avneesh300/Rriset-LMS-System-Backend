const mongoose = require("mongoose");

const institutionTypoSchema =
    new mongoose.Schema(
        {
            institution_type: {
                type: String,
                required: true,
                unique: true,
                trim: true,
            },

            status: {
                type: Boolean,
                default: true,
            },
        },
        {
            timestamps: true,
        }
    );

module.exports = mongoose.model(
    "InstitutionTypo",
    institutionTypoSchema

);