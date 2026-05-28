const mongoose = require("mongoose");

const gradeSchema =
    new mongoose.Schema(
        {
            gradeName: {
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
    "Grade",
    gradeSchema
);