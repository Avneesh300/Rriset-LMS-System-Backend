const Teacher = require("../models/Teacher");
const User = require("../models/User");
const Subject = require("../models/Subject");
const Class = require("../models/Class");
const SchoolAdmin = require("../models/School");
const TeacherClassAssign = require("../models/TeacherClassAssign");
const asyncHandler = require("../middleware/asyncHandler");
const responseSuccess = require("../helpers/responseSuccess");
const responseError = require("../helpers/responseError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

exports.createTeacher = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {
            id,
            school_id,
            first_name,
            last_name,
            email,
            mobile,
            primary_subject,
            experience_years,
            qualification,
        } = req.body;
        if (req.user.user.role === 3 && !school_id) {
            await session.abortTransaction();
            return responseError(res, "School Id is required when teacher is created by school admin", 400);
        }
        if (!first_name) {
            await session.abortTransaction();
            return responseError(res, "First name is required", 400);
        }
        if (!last_name) {
            await session.abortTransaction();
            return responseError(res, "Last name is required", 400);
        }
        if (!email) {
            await session.abortTransaction();
            return responseError(res, "Email is required", 400);
        }
        if (!mobile) {
            await session.abortTransaction();
            return responseError(res, "Mobile is required", 400);
        }
        if (!primary_subject) {
            await session.abortTransaction();
            return responseError(res, "Primary subject is required", 400);
        }

        if (experience_years === undefined || experience_years === null) {
            await session.abortTransaction();
            return responseError(res, "Experience year is required", 400);
        }
        if (!qualification) {
            await session.abortTransaction();
            return responseError(res, "Qualification is required", 400);
        }

        if (id) {
            const existingUser = await User.findById(id).session(session);
            if (!existingUser) {
                await session.abortTransaction();
                return responseError(res, "User not found", 404);
            }
            const existingTeacher = await Teacher.findById(existingUser.teacher_id).session(session);
            if (!existingTeacher) {
                await session.abortTransaction();
                return responseError(res, "Teacher not found", 404);
            }

            const existingEmail = await User.findOne({ email: email, _id: { $ne: existingUser._id } }).session(session);
            if (existingEmail) {
                await session.abortTransaction();
                return responseError(res, "Teacher with this email is already exists", 400);
            }

            existingTeacher.school_id = school_id;
            existingTeacher.first_name = first_name;
            existingTeacher.last_name = last_name;
            existingTeacher.primary_subject = primary_subject;
            existingTeacher.experience_years = experience_years;
            existingTeacher.qualification = qualification;
            existingTeacher.created_by = req.user.user.id;
            await existingTeacher.save({ session });

            existingUser.username = `${first_name}${last_name}`;
            existingUser.email = email;
            existingUser.mobile = mobile;
            const hashedPassword = await bcrypt.hash(existingUser.mobile, 10);
            existingUser.password = hashedPassword;
            await existingUser.save({ session });
            await session.commitTransaction();
            session.endSession();
            return responseSuccess(res, "Teacher updated successfully", 200);
        }

        const existingTeacher = await User.findOne({ email: email }).session(session);
        if (existingTeacher) {
            await session.abortTransaction();
            return responseError(res, "Teacher with this email already exists", 400);
        }
        const hashedPassword = await bcrypt.hash(mobile, 10);
        const users = await User.create([{
            username: `${first_name}${last_name}`,
            email: email,
            mobile: mobile,
            password: hashedPassword,
            role: 4,
        }], { session })

        const newUser = users[0];
        const teacher = await Teacher.create([{
            school_id: school_id || req.user.user.schooladmin_id,
            first_name: first_name,
            last_name: last_name,
            primary_subject: primary_subject,
            experience_years: experience_years,
            qualification: qualification,
            created_by: req.user.user.id,
        }], { session });
        const newTeacher = teacher[0];
        newUser.teacher_id = newTeacher._id;
        await newUser.save({ session });
        if (!newUser || !newTeacher) {
            return responseError(res, "Failed to create teacher", 500);
        }
        await session.commitTransaction();
        session.endSession();
        return responseSuccess(res, "Teacher created successfully", 201)


    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return responseError(res, error.message || "Failed to create teacher", 500);
    }

})

exports.getAllTeacher = asyncHandler(async (req, res) => {
    const page = parseInt(req.body.page);
    const limit = parseInt(req.body.limit);
    const skip = (page - 1) * limit;
    const school_id = req.body.schooladmin_id;
    const class_id = req.body.class_id;

    const filter = {};
    const userfilter = {
        role: 4
    }

    const schoolefilter = {
        role: 3
    }


    if (req.user.user.role === 3) {
        filter.school_id = req.user.user.schooladmin_id;
    } else {
        filter.school_id = schooladmin_id;
    }



    const totalTeacher = await User.countDocuments({ role: 4 });

    const teachers = await User.find(userfilter)
        .select("-refreshToken -accessToken")
        .populate({
            path: "teacher_id",
            match: filter,
            model: "Teacher",

            populate: [
                {
                    path: "school_id",
                    model: "SchoolAdmin",

                    populate: {
                        path: "institution_id",
                        model: "Institution",
                    },
                },

                {
                    path: "primary_subject",
                    model: "Subject",
                },
            ],
        })
        .skip(skip)
        .limit(limit);

    const pagination = {
        total: totalTeacher,
        current_page: page,
        total_page: Math.ceil(totalTeacher / limit),
        par_page: limit
    }


    const teacherIds = teachers
        .filter((item) => item.teacher_id)
        .map((item) => item.teacher_id._id);


    const assignedClasses =
        await TeacherClassAssign.find({
            teacher_id: { $in: teacherIds },
            status: true,
        })
            .populate({
                path: "teacher_id",
                select: "primary_subject",
                populate: {
                    path: "primary_subject",
                    select: "subject_name",
                },
            })
            .populate({
                path: "class_id",
                populate: [
                    {
                        path: "grade_id",
                        select: "gradeName",
                    },
                    {
                        path: "section_id",
                        select: "sectionName",
                    },
                ],
            });


    const classMap = {};

    assignedClasses.forEach((item) => {
        const teacherId = item.teacher_id._id.toString();
        if (!classMap[teacherId]) {
            classMap[teacherId] = [];
        }

        classMap[teacherId].push({
            class_id: item.class_id?._id,
            class_name: item.class_id?.class_name,
            section_name: item.class_id?.section_name,
            grade_id: item.class_id?.grade_id?._id,
            gradeName: item.class_id?.grade_id?.gradeName,
            section_id: item.class_id?.section_id?._id,
            sectionName: item.class_id?.section_id?.sectionName,
            subject:  item.teacher_id
                    ?.primary_subject
                    ?.subject_name,
        });
    });


    const formattedData = teachers.map((teacher) => ({
        id: teacher._id,
        email: teacher.email,
        mobile: teacher.mobile,
        teacher_id: teacher.teacher_id._id,
        school_id: teacher.teacher_id.school_id._id,
        first_name: teacher.teacher_id.first_name,
        last_name: teacher.teacher_id.last_name,
        primary_subject: teacher.teacher_id.primary_subject.subject_name,
        primary_subject_id: teacher.teacher_id.primary_subject._id,
        experience_years: teacher.teacher_id.experience_years,
        qualification: teacher.teacher_id.qualification,
        school_type: teacher.teacher_id.school_id.school_type,
        school_name: teacher.teacher_id.school_id.school_name,
        institution_name: teacher.teacher_id.school_id.institution_id.institution_name,
        status: teacher.status,
        classes: classMap[teacher.teacher_id._id.toString()] || [],
        paginations: pagination
    }))

    return responseSuccess(res, "Teacher Fetch successfully", formattedData);
})

exports.deleteTeacher = asyncHandler(async (req, res) => {
    const { id, status } = req.body;
    console.log("teacher_id =>", id);
    if (!id) {
        return responseError(res, "Teacher id is required", 400);
    }
    if (status === undefined || status === null) {
        return responseError(res, "Status is required", 400);
    }
    if (!["A", "B"].includes(status)) {
        return responseError(res, "Invalid status", 400);
    }
    const user = await User.findOne({
        teacher_id: id
    });
    console.log("user data is ", user);
    if (!user) {
        return responseError(res, "User not found", 404);
    }
    const teacher = await Teacher.findById(id);
    if (!teacher) {
        return responseError(res, "Teacher not found", 404);
    }

    if (status === "A") {

        user.status = false;
        teacher.status = false;
    }

    if (status === "B") {

        user.status = true;
        teacher.status = true;
    }

    await user.save();
    await teacher.save();

    return responseSuccess(
        res,
        "Teacher status updated successfully",

    );

});

exports.assignTeacherClass = asyncHandler(async (req, res) => {

    const { teacher_id, class_id } = req.body;
    if (!teacher_id) {
        return responseError(res, "Teacher id is required", 400);
    }
    if (!class_id) {
        return responseError(res, "Class id is required", 400);
    }
    const teacherExists = await Teacher.findById(teacher_id);
    if (!teacherExists) {
        return responseError(res, "Teacher not found", 404);
    }
    const classExists = await Class.findById(class_id);
    if (!classExists) {
        return responseError(res, "Class not found", 404);
    }

    const alreadyAssigned =
        await TeacherClassAssign.findOne({ teacher_id, class_id, });

    if (alreadyAssigned) {
        return responseError(
            res,
            "Teacher already assigned to this class",
            400
        );
    }

    await TeacherClassAssign.create({
        teacher_id,
        class_id,
        assigned_by: req.user.user.id,
    });

    return responseSuccess(
        res,
        "Teacher assigned successfully"
    );
});

