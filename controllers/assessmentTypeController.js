const AssessmentType = require("../models/AssessmentType");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const asyncHandler = require("../middleware/asyncHandler");

const responseSuccess = require("../helpers/responseSuccess");

const responseError = require("../helpers/responseError");


exports.registerAssessmentType =
    asyncHandler(async (req, res) => {

        const {
            id,
            assessment_type_name,
            description,
            status,
        } = req.body;

        if (!assessment_type_name) {
            return responseError(
                res,
                "Assessment type name are required",
                400
            );
        }
        if (!description) {
            return responseError(
                res,
                "Description are required",
                400
            );
        }
        if (!status) {
            return responseError(
                res,
                "Status are required",
                400
            );
        }


        // ===================================================
        // UPDATE
        // ===================================================
        if (id) {
            const assessmenttype =
                await AssessmentType.findById(id);

            if (!assessmenttype) {
                return responseError(
                    res,
                    "Assessment Type not found",
                    404
                );
            }

            assessmenttype.assessment_type_name = assessment_type_name;
            assessmenttype.description = description;
            assessmenttype.status = status;

            await assessmenttype.save();
            return responseSuccess(
                res,
                "Assessment Type updated successfully",
                200
            );
        }

        // ===================================================
        // CREATE
        // ===================================================

        const existingAssessmentType =
            await AssessmentType.findOne({ assessment_type_name });

        if (existingAssessmentType) {
            return responseError(
                res,
                "Assessment Type already registered",
                400
            );
        }

        // create user
        const newAssessmentType =
            await AssessmentType.create({
                assessment_type_name,
                description,
                status,
            });

        await newAssessmentType.save();

        return responseSuccess(
            res,
            "Assessment Type registered successfully",
            201
        );
    });

// ===================================================
// GET ALL ASSESSMENT TYPE
// ===================================================

exports.getAllAssessmentType =
    asyncHandler(async (req, res) => {

        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const search = req.body.search || "";
        const skip = (page - 1) * limit;

        const filter = {
            assessment_type_name: {
                $regex: search,
                $options: "i",
            },
        };

        const total = await AssessmentType.countDocuments(filter);

        const assessmenttype = await AssessmentType.find(filter)
            .sort({ createdAt: -1, })
            .skip(skip)
            .limit(limit);

        const pagination = {
            total,
            currentPage: page,
            totalPages: Math.ceil(
                total / limit
            ),
            perPage: limit,
        };

        return responseSuccess(
            res,
            "Assessment type list fetched successfully",
            {
                assessmenttype,
                pagination,
            },
            200
        );
    });

// ===================================================
// DELETE ASSESSMENT TYPE
// ===================================================


exports.deleteAssessmentType =
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
            const assessmenttype =
                await AssessmentType.findById(id);

            if (!assessmenttype) {
                return responseError(
                    res,
                    "Assessment type not found",
                    404
                );
            }

            if (status === "A") {
                assessmenttype.status = 0;
            }
            if (status === "B") {
                assessmenttype.status = 1;
            }

            await assessmenttype.save();
            return responseSuccess(
                res,
                "Assessment type Updated successfully",
                200
            );
        }
    });