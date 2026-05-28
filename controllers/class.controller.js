const User = require("../models/User");
const Class = require("../models/Class");
const Grade = require("../models/Grade");
const Section = require("../models/Section");
const Institution = require("../models/Institution");
const SchoolAdmin = require("../models/School");


const asyncHandler = require("../middleware/asyncHandler");

const responseSuccess = require("../helpers/responseSuccess");

const responseError = require("../helpers/responseError");


// ======================================
// Create Class
// ======================================
exports.registerClass =
    asyncHandler(async (req, res) => {
        const {
            id,
            class_name,
            section_name,
            school_id,
            grade_id,
            section_id,
            academic_year,
            student_capacity,
        } = req.body;

        if (
            !school_id
        ) {
            return responseError(
                res,
                "School are required",
                400
            );
        }

        if (
            !grade_id
        ) {
            return responseError(
                res,
                "Grade are required",
                400
            );
        }

        if (
            !section_id
        ) {
            return responseError(
                res,
                "Section are required",
                400
            );
        }

        if (
            !academic_year ||
            !student_capacity
        ) {
            return responseError(
                res,
                "Academic year are required",
                400
            );
        }

        if (
            !student_capacity
        ) {
            return responseError(
                res,
                "Student capacity are required",
                400
            );
        }

        // ===================================================
        // UPDATE
        // ===================================================
        if (id) {
            const classdata = await Class.findById(id);
            if (!classdata) {
                return responseError(
                    res,
                    "Class is not found",
                    404
                );
            }

            if (classdata.class_name) {
                classdata.class_name = class_name;
            }
            if (classdata.section_name) {
                classdata.section_name = section_name;
            }

            classdata.school_id = school_id;
            classdata.grade_id = grade_id;
            classdata.section_id = section_id;
            classdata.academic_year = academic_year;
            classdata.student_capacity = student_capacity;
            classdata.created_by = req.user.user.id;
            await classdata.save();
            return responseSuccess(
                res,
                "Class updated successfully",
                200
            );
        }

        // ===================================================
        // CREATE
        // ===================================================

        const existingClass = await User.findOne({ class_name });
        if (existingClass) {
            return responseError(
                res,
                "Class already registered",
                400
            );
        }

        const newClass =
            await Class.create({
                class_name,
                section_name,
                school_id,
                grade_id,
                section_id,
                academic_year,
                student_capacity,
                created_by: req.user.user.id,
            });

        await newClass.save();

        return responseSuccess(
            res,
            "Class registered successfully",
            201
        );
    });



exports.getAllClass =
    asyncHandler(async (req, res) => {

        if (
            req.user.user.role !== 5 &&
            req.user.user.role !== 3
        ) {
            return responseError(
                res,
                "Access denied",
                403
            );
        }

        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const search = req.body.search || "";
        const skip = (page - 1) * limit;

        const loginUser = await User.findById(req.user.user.id);
        if (!loginUser) {
            return responseError(
                res,
                "User not found",
                404
            );
        }

        let filter = {};
        if (search) {
            filter.class_name = {
                $regex: search,
                $options: "i",
            };
        }

        if (req.user.user.role === 5) {

            const schools =
                await SchoolAdmin.find({
                    institution_id:
                        loginUser.institution_id,
                }).select("_id");

            const schoolIds =
                schools.map(
                    (school) => school._id
                );

            filter.school_id = {
                $in: schoolIds,
            };
        }


        if (req.user.user.role === 3) {
            filter.school_id = loginUser.schooladmin_id;
        }
        const total = await Class.countDocuments(filter);
        const classes =
            await Class.find(filter)
                .populate({
                    path: "school_id",
                    select:
                        "school_name institution_id",
                    populate: {
                        path: "institution_id",
                        select:
                            "institution_name",
                    },
                })
                .populate({
                    path: "grade_id",
                    select: "gradeName"
                })
                .populate({
                    path: "section_id",
                    select: "sectionName"
                })

                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit);

        const pagination = {
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            perPage: limit,
        };

        const formattedData = classes.map((item) => ({
            id: item._id,
            class_name: item.class_name,
            section_name: item.section_name,
            school_id: item.school_id._id,
            school_name: item.school_id.school_name,
            institution_id: item.school_id.institution_id._id,
            institution_name: item.school_id.institution_id.institution_name,
            grade_id: item.grade_id._id,
            gradeName: item.grade_id.gradeName,
            section_id: item.section_id._id,
            sectionName: item.section_id.sectionName,
            academic_year: item.academic_year,
            student_capacity: item.student_capacity,
            created_by: item.created_by,
            status: item.status,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            paginations: pagination
        }))

        return responseSuccess(
            res,
            "Class list fetched successfully",
            formattedData

        );
    });



exports.deleteClass =
    asyncHandler(async (req, res) => {
        const {
            id,
            status
        } = req.body;

        if (!id) {
            return responseError(
                res,
                "Id is required",
                400
            );
        }

        if (!status) {
            return responseError(
                res,
                "status is required",
                400
            );
        }

        if (id) {
            const classdata = await Class.findById(id);
            if (!classdata) {
                return responseError(
                    res,
                    "Class not found",
                    404
                );
            }

            if (status === "A") {
                classdata.status = 0;
            }
            if (status === "B") {
                classdata.status = 1;
            }

            await classdata.save();
            return responseSuccess(
                res,
                "Class Status Updated successfully",
                200
            );
        }
    });
