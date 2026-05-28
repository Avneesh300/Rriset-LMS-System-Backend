const Rriset = require("../models/Rriset");
const Program = require("../models/Program");
const SchoolAdmin = require("../models/School");
const Class = require("../models/Class");
const asyncHandler = require("../middleware/asyncHandler");
const responseSuccess = require("../helpers/responseSuccess");
const responseError = require("../helpers/responseError");

exports.registerRriset =
    asyncHandler(async (req, res) => {
        let {
            id,
            program_id,
            rriset_name,
            description,
            treatment_group,
            control_group,
        } = req.body;

        if (typeof treatment_group === "string") {
            treatment_group = JSON.parse(treatment_group);
        }

        if (typeof control_group === "string") {
            control_group = JSON.parse(control_group);
        }


        if (!program_id) {
            return responseError(
                res,
                "Program id is required",
                400
            );
        }

        if (!rriset_name) {
            return responseError(
                res,
                "Rriset name is required",
                400
            );
        }

        if (
            !treatment_group ||
            !Array.isArray(treatment_group) ||
            treatment_group.length === 0
        ) {
            return responseError(
                res,
                "Treatment group is required",
                400
            );
        }

        if (!control_group || !Array.isArray(control_group) || control_group.length === 0) {
            return responseError(
                res,
                "Control group is required",
                400
            );
        }

        const programExists = await Program.findById(program_id);
        if (!programExists) {
            return responseError(
                res,
                "Invalid program id",
                400
            );
        }
        const treatmentSet = new Set();

        for (const item of treatment_group) {
            if (!item.school_id) {
                return responseError(
                    res,
                    "School id is required in treatment group",
                    400
                );
            }

            const duplicateKey = `${item.school_id}-${item.class_id || "null"}`;
            if (
                treatmentSet.has(duplicateKey
                )
            ) {
                return responseError(
                    res,
                    "Duplicate school/class in treatment group",
                    400
                );
            }

            treatmentSet.add(duplicateKey);

            const schoolExists = await SchoolAdmin.findById(item.school_id);
            if (!schoolExists) {
                return responseError(
                    res,
                    "Invalid school id in treatment group",
                    400
                );
            }
            if (item.class_id) {
                const classExists = await Class.findById(item.class_id);
                if (!classExists) {
                    return responseError(
                        res,
                        "Invalid class id in treatment group",
                        400
                    );
                }
            }
        }

        const controlSet = new Set();
        for (const item of control_group) {
            if (!item.school_id) {
                return responseError(
                    res,
                    "School id is required in control group",
                    400
                );
            }
            const duplicateKey = `${item.school_id}-${item.class_id || "null"}`;
            if (controlSet.has(duplicateKey)) {
                return responseError(
                    res,
                    "Duplicate school/class in control group",
                    400
                );
            }
            controlSet.add(duplicateKey);
            const schoolExists = await SchoolAdmin.findById(item.school_id);
            if (!schoolExists) {
                return responseError(
                    res,
                    "Invalid school id in control group",
                    400
                );
            }

            if (item.class_id) {
                const classExists = await Class.findById(item.class_id);
                if (!classExists) {
                    return responseError(
                        res,
                        "Invalid class id in control group",
                        400
                    );
                }
            }
        }

        // ======================================
        // UPDATE
        // ======================================

        if (id) {
            const rrisetData = await Rriset.findById(id);
            if (!rrisetData) {
                return responseError(
                    res,
                    "Rriset not found",
                    404
                );
            }

            const duplicateName =
                await Rriset.findOne({
                    rriset_name,
                    _id: { $ne: id },
                });

            if (duplicateName) {
                return responseError(
                    res,
                    "Rriset name already exists",
                    400
                );
            }

            rrisetData.program_id = program_id;
            rrisetData.rriset_name = rriset_name;
            rrisetData.description = description || "";
            rrisetData.treatment_group = treatment_group;
            rrisetData.control_group = control_group;
            await rrisetData.save();
            return responseSuccess(
                res,
                "Rriset updated successfully",
                200
            );
        }

        const existingRriset = await Rriset.findOne({ rriset_name, });
        if (existingRriset) {
            return responseError(
                res,
                "Rriset already exists",
                400
            );
        }

        const newRriset =
            await Rriset.create({
                program_id,
                rriset_name,
                description: description || "",
                treatment_group,
                control_group,
                created_by: req.user.user.id,
            });
        await newRriset.save();
        return responseSuccess(
            res,
            "Rriset registered successfully",
            201
        );
    });


exports.getOverviewData =
    asyncHandler(async (req, res) => {
        const { program_id } = req.body;
        if (!program_id) {
            return responseError(
                res,
                "Program id is required",
                400
            );
        }

        const programData = await Program.findById(program_id);
        if (!programData) {
            return responseError(
                res,
                "Program not found",
                404
            );
        }

        const rriSets =
            await Rriset.find({ program_id, status: true, })
                .populate({
                    path: "treatment_group.school_id",
                    select: "school_name",
                })
                .populate({
                    path: "control_group.school_id",
                    select: "school_name",
                })
                .sort({
                    createdAt: -1,
                });

        const formattedRriSets =
            rriSets.map((item) => ({
                rriset_id: item._id,
                rriset_name: item.rriset_name,
                description: item.description,
                treatment_group: item.treatment_group.map(
                    (group) => ({
                        school_id: group.school_id?._id || null,
                        school_name: group.school_id?.school_name || "",
                        class_id: group.class_id || null,
                    })
                ),
                control_group:
                    item.control_group.map(
                        (group) => ({
                            school_id: group.school_id?._id || null,
                            school_name: group.school_id?.school_name || "",
                            class_id: group.class_id || null,
                        })
                    ),
            }));

        const responseData = {
            program_id: programData._id,
            program_name: programData.program_name,
            start_date: programData.start_date,
            end_date: programData.end_date,
            duration: programData.duration,
            rri_sets: formattedRriSets,
        };

        return responseSuccess(
            res,
            "Overview data fetched successfully",
            responseData
        );
    });

exports.getRrisetList =
    asyncHandler(async (req, res) => {
        const { program_id } = req.body;
        if (!program_id) {
            return responseError(
                res,
                "Program id is required",
                400
            );
        }

        const programExists =
            await Program.findById(
                program_id
            );

        if (!programExists) {
            return responseError(
                res,
                "Program not found",
                404
            );
        }


        const rriSets =
            await Rriset.find({
                program_id,
                status: true,
            })
                .populate({
                    path: "treatment_group.school_id",
                    select: "school_name",
                })
                .populate({
                    path: "control_group.school_id",
                    select: "school_name",
                })
                .sort({ createdAt: -1, });


        const treatment_rri_sets =
            rriSets.map((item) => ({
                rriset_id: item._id,
                rriset_name: item.rriset_name,
                description: item.description,
                total_entries: item.treatment_group.length,
                added_on: item.createdAt,
                schools: item.treatment_group.map(
                    (group) => ({
                        school_id: group.school_id?._id || null,
                        school_name: group.school_id?.school_name || "",
                        class_id: group.class_id || null,
                    })
                ),
            }));


        const control_rri_sets =
            rriSets.map((item) => ({
                rriset_id: item._id,
                rriset_name: item.rriset_name,
                description: item.description,
                total_entries: item.control_group.length,
                added_on: item.createdAt,
                schools: item.control_group.map(
                    (group) => ({
                        school_id: group.school_id?._id || null,
                        school_name: group.school_id?.school_name || "",
                        class_id: group.class_id || null,
                    })
                ),
            }));


        const responseData = {
            program_id: programExists._id,
            program_name: programExists.program_name,
            treatment_rri_sets,
            control_rri_sets,
        };

        return responseSuccess(
            res,
            "RRI set list fetched successfully",
            responseData
        );
    });


exports.getRrisetSchoolList =
    asyncHandler(async (req, res) => {
        const { program_id } = req.body;
        if (!program_id) {
            return responseError(
                res,
                "Program id is required",
                400
            );
        }

        const programExists = await Program.findById(program_id);
        if (!programExists) {
            return responseError(
                res,
                "Program not found",
                404
            );
        }

        const rriSets =
            await Rriset.find({ program_id, status: true, })
                .populate({
                    path: "treatment_group.school_id",
                    select: "school_name city total_students",
                })
                .populate({
                    path: "control_group.school_id",
                    select: "school_name city total_students",
                })
                .sort({ createdAt: -1, });

        const schoolList = [];
        rriSets.forEach((item) => {
            item.treatment_group.forEach(
                (group) => {
                    if (group.school_id) {
                        schoolList.push({
                            rriset_id: item._id,
                            rriset_name: item.rriset_name,
                            group_type: "treatment",
                            school_id: group.school_id._id,
                            school_name: group.school_id.school_name,
                            city: group.school_id.city || "",
                            total_students: group.school_id.total_students || 0,
                            class_id: group.class_id || null,
                        });
                    }
                }
            );

            item.control_group.forEach(
                (group) => {
                    if (group.school_id) {
                        schoolList.push({
                            rriset_id: item._id,
                            rriset_name: item.rriset_name,
                            group_type: "control",
                            school_id: group.school_id._id,
                            school_name: group.school_id.school_name,
                            city: group.school_id.city || "",
                            total_students: group.school_id.total_students || 0,
                            class_id: group.class_id || null,
                        });
                    }
                }
            );
        });

        const responseData = {
            program_id: programExists._id,
            program_name: programExists.program_name,
            total_schools: schoolList.length,
            schools: schoolList,
        };
        return responseSuccess(
            res,
            "RRI set school list fetched successfully",
            responseData
        );
    });