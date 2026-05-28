const mongoose = require("mongoose");
const User = require("./User");

const studentSchema =
    new mongoose.Schema(
        {

            class_id: {
                type:mongoose.Schema.Types.ObjectId,
                ref: "Class",
                required: false,
                 default: null,
            },

            first_name: {
                type: String,
                required: true,
                trim: true,
            },

            last_name: {
                type: String,
                required: true,
                trim: true,
            },

            roll_number: {
                type: String,
                required: true,
                trim: true,
            },

            date_of_birth: {
                type: Date,
                required: true,
            },

            gender: {
                type: String,
                enum: [
                    "Male",
                    "Female",
                    "Other",
                ],
                required: true,
            },

            student_email: {
                type: String,
                default: "",
                lowercase: true,
                trim: true,
            },

            student_phone: {
                type: String,
                default: "",
                trim: true,
            },

            admission_date: {
                type: Date,
                required: true,
            },

            parent_name: {
                type: String,
                required: true,
                trim: true,
            },

            parent_phone: {
                type: String,
                required: true,
                trim: true,
            },

            parent_email: {
                type: String,
                required: true,
                lowercase: true,
                trim: true,
            },
              created_by: {
                    type:
                      mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    default: null,
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
    "Student",
    studentSchema
);