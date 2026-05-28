const mongoose = require("mongoose");
const User = require('./User.js');
const Teacher = require('./Teacher.js');
const Class = require('./Class.js');

const teacherClassAssignSchema = new mongoose.Schema(
    {
        teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true,
        },

        class_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
        },

        assigned_by: {
            type: mongoose.Schema.Types.ObjectId,
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

teacherClassAssignSchema.index(
    {
        teacher_id: 1,
        class_id: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model(
    "TeacherClassAssign",
    teacherClassAssignSchema
);