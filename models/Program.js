const mongoose = require("mongoose");
const User = require("./User");

const programSchema = new mongoose.Schema({

    program_name: {
        type: String,
        required: true,
    },

    discription: {
        type: String,
        required: true,
    },

    duration: {
        type: String,
        required: true,
    },

    start_date: {
        type: Date,
        required: true,
    },

    end_date: {
        type: Date,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },

    created_by: {
        type:
            mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },

},
    {
        timestamps: true,
    }
)

const Program = mongoose.model("Program", programSchema);

module.exports = Program;
