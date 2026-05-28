const UploadPaper = require("../models/UploadPaper.js");

const asyncHandler = require("../middleware/asyncHandler");

const responseSuccess = require("../helpers/responseSuccess");

const responseError = require("../helpers/responseError");
const cloudinaryUpload = require("../utils/cloudinaryUpload");


exports.registerUploadPaper =

    asyncHandler(async (req, res) => {

        const {
            id,
            assessment_type_id,
            paper_title,
            status,
        } = req.body;

        // ===========================================
        // VALIDATION
        // ===========================================

        if (!assessment_type_id) {

            return responseError(
                res,
                "Assessment type is required",
                400
            );
        }

        if (!paper_title) {

            return responseError(
                res,
                "Paper title is required",
                400
            );
        }

        if (!status) {

            return responseError(
                res,
                "Status is required",
                400
            );
        }

        // ===========================================
        // UPDATE
        // ===========================================

        if (id) {

            const uploadpaper =

                await UploadPaper.findById(id);

            if (!uploadpaper) {

                return responseError(
                    res,
                    "Paper not found",
                    404
                );
            }

            let fileUrl =
                uploadpaper.file;

            // =======================================
            // NEW FILE UPLOAD
            // =======================================

            if (req.file) {

                const uploadedFile =

                    await cloudinaryUpload(
                        req.file.path
                    );

                fileUrl =
                    uploadedFile.secure_url;
            }

            uploadpaper.assessment_type_id =
                assessment_type_id;

            uploadpaper.paper_title =
                paper_title;

            uploadpaper.file =
                fileUrl;

            uploadpaper.status =
                status;

            await uploadpaper.save();

            return responseSuccess(
                res,
                "Upload paper updated successfully",
                200
            );
        }

        // ===========================================
        // CREATE
        // ===========================================

        const existingUploadPaper =

            await UploadPaper.findOne({
                paper_title,
            });

        if (existingUploadPaper) {

            return responseError(
                res,
                "Upload paper already exists",
                400
            );
        }

        // ===========================================
        // FILE REQUIRED
        // ===========================================

        if (!req.file) {

            return responseError(
                res,
                "File is required",
                400
            );
        }

        // ===========================================
        // CLOUDINARY UPLOAD
        // ===========================================

        const uploadedFile =

            await cloudinaryUpload(
                req.file.path
            );

        // ===========================================
        // FILE URL
        // ===========================================
        // console.log("File is ", uploadedFile);

        const fileUrl =
            uploadedFile.secure_url;

        // ===========================================
        // CREATE DATA
        // ===========================================

        const newUploadPaper =

            await UploadPaper.create({

                assessment_type_id,

                paper_title,

                file: fileUrl,
                  uploaded_by:
      req.user.id,

                status,
            });

        return responseSuccess(
            res,
            "Upload paper registered successfully",
            newUploadPaper,
            201
        );
    });

// ===================================================
// GET ALL 
// ===================================================

exports.getAllUploadPaper =
    asyncHandler(async (req, res) => {

        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const search = req.body.search || "";
        const skip = (page - 1) * limit;

        const filter = {
            paper_title: {
                $regex: search,
                $options: "i",
            },
        };

        if (req.body.assessment_type_id) {
            filter.assessment_type_id = req.body.assessment_type_id;
        }

        const total = await UploadPaper.countDocuments(filter);

        const uploadpaper = await UploadPaper.find(filter)
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
            "Upload paper list fetched successfully",
            {
                uploadpaper,
                pagination,
            },
            200
        );
    });

// ===================================================
// DELETE 
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
            const uploadpaper =
                await UploadPaper.findById(id);

            if (!uploadpaper) {
                return responseError(
                    res,
                    "Upload paper not found",
                    404
                );
            }

            if (status === "A") {
                uploadpaper.status = 0;
            }
            if (status === "B") {
                uploadpaper.status = 1;
            }

            await uploadpaper.save();
            return responseSuccess(
                res,
                "Upload paper Updated successfully",
                200
            );
        }
    });