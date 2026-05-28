const asyncHandler = require("../middleware/asyncHandler");

const responseSuccess = require("../helpers/responseSuccess");
const Grade = require("../models/Grade");
const Section = require("../models/Section");
const Institution = require("../models/Institution");
const InstitutionTypo = require("../models/InstitutionTypo");
const SchoolAdmin = require("../models/School");
const Class = require("../models/Class");
const responseError = require("../helpers/responseError");

exports.getGradeDropdown =
    asyncHandler(async (req, res) => {
        const grades = await Grade.find();

        return responseSuccess(
            res,
            "Grade dropdown fetched successfully",
            grades,

        );
    });

exports.getSectionDropdown =
    asyncHandler(async (req, res) => {
        const sections = await Section.find();
        return responseSuccess(
            res,
            "Section dropdown fetched successfully",
            sections,

        );
    });


exports.getInstitutionTypeDropdown =
    asyncHandler(async (req, res) => {
        const institutiontypes = await InstitutionTypo.find();
        return responseSuccess(
            res,
            "Institution type dropdown fetched successfully",
            institutiontypes,

        );
    });

exports.getSchoolDropdown =
    asyncHandler(async (req, res) => {
        const schools = await SchoolAdmin.find();
        return responseSuccess(
            res,
            "Schoole dropdown fetched successfully",
            schools,

        );
    });

exports.getClassDropdown = asyncHandler(async (req, res) => {

    const user = req.user.user;

    let filter = { status: true };
    if (user.schooladmin_id) {
        filter.school_id = user.schooladmin_id;
    }

    if (user.institution_id) {

        const schools = await SchoolAdmin.find({
            institution_id: user.institution_id,
            status: true,
        }).select("_id");

        const schoolIds = schools.map((school) => school._id);

        filter.school_id = { $in: schoolIds };
    }

    const classes = await Class.find(filter)
        .populate({
            path: "school_id",
            select: "school_name institution_id",
            populate: {
                path: "institution_id",
                select: "institution_name",
            },
        })
        .populate("grade_id", "gradeName")
        .populate("section_id", "sectionName");

    const dropdown = classes.map((item) => ({
        id: item._id,
        grade_id: item.grade_id?._id,
        gradeName: item.grade_id?.gradeName,
        section_id: item.section_id?._id,
        sectionName: item.section_id?.sectionName,
        class_name: item.class_name,
        status: item.status,
    }));

    return responseSuccess(
        res,
        "Class dropdown fetched successfully",
        dropdown
    );
});
