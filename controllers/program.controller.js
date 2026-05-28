const User = require("../models/User");
const Program = require("../models/Program");
const asyncHandler = require("../middleware/asyncHandler");
const responseSuccess = require("../helpers/responseSuccess");
const responseError = require("../helpers/responseError");

exports.registerProgram =
    asyncHandler(async (req, res) => {
        const {
            id,
            program_name,
            discription,
            duration,
            start_date,
            end_date,
        } = req.body;

        if (!program_name) {
            return responseError(
                res,
                "Program name is required",
                400
            );
        }

        if (!discription) {
            return responseError(
                res,
                "Discription is required",
                400
            );
        }

        if (!duration) {
            return responseError(
                res,
                "Duration is required",
                400
            );
        }

        if (!start_date) {
            return responseError(
                res,
                "Start date is required",
                400
            );
        }

        if (!end_date) {
            return responseError(
                res,
                "End date is required",
                400
            );
        }

        if (id) {
            const programData = await Program.findById(id);
            if (!programData) {
                return responseError(
                    res,
                    "Program not found",
                    404
                );
            }

            programData.program_name = program_name;
            programData.discription = discription;
            programData.duration = duration;
            programData.start_date = start_date;
            programData.end_date = end_date;
            programData.created_by =  req.user.user.id;
            await programData.save();
            return responseSuccess(
                res,
                "Program updated successfully",
                200
            );
        }

        // CREATE
        const existingProgram =
            await Program.findOne({
                program_name
            });

        if (existingProgram) {
            return responseError(
                res,
                "Program already exists",
                400
            );
        }

        const newProgram =
            await Program.create({
                program_name,
                discription,
                duration,
                start_date,
                end_date,
                created_by:  req.user.user.id,
            });

        await newProgram.save();
        return responseSuccess(
            res,
            "Program registered successfully",
            201
        );
    });




// Get All Program
exports.getAllProgram =
    asyncHandler(async (req, res) => {
        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const search =  req.body.search || "";
        const skip = (page - 1) * limit;
        let filter = {};
        if (search) {
            filter.program_name = {
                $regex: search,
                $options: "i",
            };
        }

        const total = await Program.countDocuments(filter);
        const programs = await Program.find(filter)
                .populate({
                    path: "created_by",
                    select: "name email"
                })
                .sort({  createdAt: -1, })
                .skip(skip)
                .limit(limit);

        const pagination = {
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            perPage: limit,
        };

        const formattedData =
            programs.map((item) => ({
                id: item._id,
                program_name: item.program_name,
                discription: item.discription,
                duration: item.duration,
                start_date: item.start_date,
                end_date: item.end_date,
                status: item.status,
                created_by: item.created_by,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                paginations: pagination,
            }));

        return responseSuccess(
            res,
            "Program list fetched successfully",
            formattedData
        );
    });

// Delete Program
exports.deleteProgram =
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
                "Status is required",
                400
            );
        }

        const programData = await Program.findById(id);
        if (!programData) {
            return responseError(
                res,
                "Program not found",
                404
            );
        }

        if (status === "A") {
            programData.status = 0;
        }

        if (status === "B") {
            programData.status = 1;
        }

        await programData.save();

        return responseSuccess(
            res,
            "Program status updated successfully",
            200
        );
    });