const mongoose = require("mongoose");
const SchoolAdmin = require("./School.js")
const Class = require("./Class.js")
const User = require("./User.js")

const groupSchema = new mongoose.Schema({

    school_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SchoolAdmin",
        required: true,
    },

    class_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        default: null,
    },

}, {
    _id: false,
});

const rrisetSchema = new mongoose.Schema({

    program_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program",
        required: true,
    },

    rriset_name: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        default: "",
        trim: true,
    },

    treatment_group: {
        type: [groupSchema],
        validate: {
            validator: function (value) {
                return value.length > 0;
            },
            message: "At least one treatment group is required",
        },
    },

    control_group: {
        type: [groupSchema],
        validate: {
            validator: function (value) {
                return value.length > 0;
            },
            message: "At least one control group is required",
        },
    },

    status: {
        type: Boolean,
        default: true,
    },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

},
    {
        timestamps: true,
    });


rrisetSchema.index({
    rriset_name: 1,
});

rrisetSchema.index({
    "treatment_group.school_id": 1,
});

rrisetSchema.index({
    "control_group.school_id": 1,
});

const Rriset = mongoose.model("Rriset", rrisetSchema);
module.exports = Rriset;