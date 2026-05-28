const User = require("../models/User");
const Institution = require("../models/Institution");
const asyncHandler = require("../middleware/asyncHandler");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const responseSuccess = require("../helpers/responseSuccess");
const mongoose = require("mongoose");
const responseError = require("../helpers/responseError");
const Student = require("../models/Student");

exports.registerStudent = asyncHandler(
    async (req, res) => {
        const {
            id,
            class_id,
            first_name,
            last_name,
            roll_number,
            date_of_birth,
            gender,
            student_email,
            student_phone,
            admission_date,
            parent_name,
            parent_phone,
            parent_email,

        } = req.body;
        if (req.user.user.role === 3 && !class_id) {
            return responseError(res, "Class Id is rquired", 400);
        }
        if (!first_name) {
            return responseError(res, "First name Id is rquired", 400);
        }
        if (!last_name) {
            return responseError(res, "First name is rquired", 400);
        }
        if (!roll_number) {
            return responseError(res, "Role Number  is rquired", 400);
        }
        if (!date_of_birth) {
            return responseError(res, "Date of birth  is rquired", 400);
        }
        if (!gender) {
            return responseError(res, "Gender  is rquired", 400);
        }
        if (!student_email) {
            return responseError(res, "Student email  is rquired", 400);
        }
        if (!student_phone) {
            return responseError(res, "Student phone  is rquired", 400);
        }
        if (!admission_date) {
            return responseError(res, "Admission date  is rquired", 400);
        }
        if (!parent_name) {
            return responseError(res, "Parent name  is rquired", 400);
        }
        if (!parent_phone) {
            return responseError(res, "Parent phone  is rquired", 400);
        }
        if (!parent_email) {
            return responseError(res, "Parent email  is rquired", 400);
        }

        if (id) {
            const studentdata = await Student.find(id);
            if (!studentdata) {
                return responseError(res, "Student not found", 404);
            }

            studentdata.class_id = class_id,
                studentdata.first_name = first_name,
                studentdata.last_name = last_name,
                studentdata.roll_number = roll_number,
                studentdata.date_of_birth = date_of_birth,
                studentdata.gender = gender,
                studentdata.student_email = student_email,
                studentdata.admission_date = admission_date,
                studentdata.parent_name = parent_name,
                studentdata.first_name = first_name,
                studentdata.parent_phone = parent_phone,
                studentdata.parent_email = parent_email,
                studentdata.created_by = req.user.user.id,
                await studentdata.save();
            return responseSuccess(res, "Student updated successfully", 200);
        };

        const existingStudent = await Student.findOne({ student_email });
        if (existingStudent) {
            return responseError(res, "Student with this eamil already exists", 400);
        }

        const studentdata = await Student.create({
            class_id,
            first_name,
            last_name,
            roll_number,
            date_of_birth,
            gender,
            student_email,
            student_phone,
            admission_date,
            parent_name,
            parent_phone,
            parent_email,
            created_by: req.user.user.id,
        });

        await studentdata.save();
        return responseSuccess(res, "Student registered successfully", 201);
    }
);

exports.getStudents = asyncHandler(async (req, res) => {
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const search = req.body.search || "";
    const classid = req.body.class_id || "";
    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
        filter.$or = [
            {
                first_name: {
                    $regex: search,
                    $options: "i",
                }
            },
            {
                last_name: {
                    $regex: search,
                    $options: "i",
                }
            }
        ]
    }

    if (classid) {
        filter.class_id = classid
    }

    const totalStudents = await Student.countDocuments(filter);
    const students = await Student.find(filter)
        .populate({
            path: "class_id",
            select:
                "class_name section_name grade_id section_id academic_year",

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
        })

    const totalActiveStudents =
        students.filter(
            (student) => student.status === true
        ).length;

    const totalInactiveStudents =
        students.filter(
            (student) => student.status === false
        ).length;

    if (students.length === 0) {
        return responseError(
            res,
            "No students found",
            404
        );
    }

    const pagination = {
        total: totalStudents,
        currentPage: page,
        totalPages: Math.ceil(totalStudents / limit),
        perPage: limit,
    }

    const formatedStudents = students.map((student) => ({
        id: student._id,
        class_id: student.class_id._id,
        class_name: student.class_id.class_name,
        section_name: student.class_id.section_name,
        grade_id: student.class_id.grade_id._id,
        gradeName: student.class_id.grade_id.gradeName,
        section_id: student.class_id.section_id._id,
        sectionName: student.class_id.section_id.sectionName,
        first_name: student.first_name,
        last_name: student.last_name,
        roll_number: student.roll_number,
        date_of_birth: student.data_of_birth,
        gender: student.gender,
        student_email: student.student_email,
        student_phone: student.student_phone,
        admission_date: student.admission_date,
        parent_name: student.parent_name,
        parent_phone: student.parent_phone,
        parent_email: student.parent_email,
        status: student.status,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        total_active_students: totalActiveStudents,
        total_inactive_students: totalInactiveStudents,
        pagination: pagination,
    }))

    if (!students) {

        return responseError(res, "No students found", 404);
    }
    return responseSuccess(res, "Students fetched successfully", formatedStudents)

});
exports.deleteStudent = asyncHandler(async (req, res) => {
    const { id, status } = req.body;
    if (!id) {
        return responseError(res, "Student id is required", 400);
    }
    if (!status) {
        return responseError(res, "Status is required", 400);
    }

    const students = await Student.findById(id);
    if (!students) {
        return responseError(res, "Student not found", 404);
    }

    if (status === "A") {
        students.status = false;

    }
    if (status === "B") {
        students.status = true;;

    }
    await students.save();
    return responseSuccess(res, "Student status updated successfully", 200);

});

exports.importStudents = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (req.user.user.role !== 3) {
            await session.abortTransaction();
            return responseError(res, "You are not authorized to impport students", 403);
        }
        if (!req.file) {
            await session.abortTransaction();
            return responseError(res, "CSV file is required", 400);
        }

        const workbook = xlsx.readFile(req.file.path, {
            cellDates: true,
        });
        const sheetname = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetname];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, {
            defval: "",
            raw: false,
            dateNF: "yyyy-mm-dd",
        });

        if (!jsonData || jsonData.length === 0) {
            await session.abortTransaction();
            return responseError(res, "CSV file is empty", 400);
        }

        const insertToStudent = [];
        const validationErrors = [];

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (let index = 0; index < jsonData.length; index++) {

            const error = [];
            const row = jsonData[index];
            const rowNumber = index + 2;
            const first_name = String(row.first_name).trim();
            const last_name = String(row.last_name).trim();
            const roll_number = String(row.roll_number).trim();
            //const date_of_birth = new Date(row.date_of_birth);
            const gender = String(row.gender).trim().toLowerCase();
            const formattedGender =
                gender === "male"
                    ? "Male"
                    : gender === "female"
                        ? "Female"
                        : gender === "other"
                            ? "Other"
                            : "";
            const student_email = String(row.student_email).trim();
            const student_phone = String(row.student_phone).trim();
            //const admission_date = new Date(row.admission_date);
            const parent_name = String(row.parent_name).trim();
            const parent_phone = String(row.parent_phone).trim();
            const parent_email = String(row.parent_email).trim();
            const dobValue = String(row.date_of_birth).trim();

            let date_of_birth = null;

            if (dobValue) {

                // support both 15-05-10 and 15/05/10
                const parts = dobValue.split(/[-/]/);

                if (parts.length === 3) {

                    const day = parts[0];
                    const month = parts[1];
                    const year =
                        parts[2].length === 2
                            ? `20${parts[2]}`
                            : parts[2];

                    date_of_birth = new Date(
                        `${year}-${month}-${day}`
                    );
                }
            }

            if (!date_of_birth || isNaN(date_of_birth.getTime())) {
                error.push("Invalid date of birth");
            }

            const admissionValue = String(row.admission_date).trim();

            let admission_date = null;

            if (admissionValue) {

                // support both 01-04-23 and 01/04/23
                const parts = admissionValue.split(/[-/]/);

                if (parts.length === 3) {

                    const day = parts[0];
                    const month = parts[1];
                    const year =
                        parts[2].length === 2
                            ? `20${parts[2]}`
                            : parts[2];

                    admission_date = new Date(
                        `${year}-${month}-${day}`
                    );
                }
            }

            if (!admission_date || isNaN(admission_date.getTime())) {
                error.push("Invalid admission date");
            }

            if (!first_name) {
                error.push("First name is required");
            }
            if (!last_name) {
                error.push("Last name is required");
            }
            if (!roll_number) {
                error.push("Roll Number is required");
            }

            if (!gender) {
                error.push("Gender is required");
            }
            if (!student_email) {
                error.push("Student Email is required");
            }
            if (student_email && !emailRegex.test(student_email)) {
                error.push("Invalid student email format");
            }
            if (!student_phone) {
                error.push("Student Phone is required");
            }
            if (!/^\d{10}$/.test(student_phone)) {
                error.push("Student phone number must be exactly 10 digits");
            }

            if (!parent_name) {
                error.push("Parent name is required");
            }
            if (!parent_phone) {
                error.push("Parent phone is required");
            }
            if (!/^\d{10}$/.test(parent_phone)) {
                error.push("Parent phone number must be exactly 10 digits");
            }
            if (!parent_email) {
                error.push("Parent email is required");
            }
            if (parent_email && !emailRegex.test(parent_email)) {
                error.push("Invalid parent email format");
            }
            const existingEmail = await Student.findOne({ student_email });
            if (existingEmail) {
                error.push("Student with this email already exists");
            }
            const existingPhone = await Student.findOne({ student_phone });
            if (existingPhone) {
                error.push("Student with this phone number already exists");
            }
            const duplicateFirstName = await insertToStudent.find((student) => student.first_name === first_name);
            if (duplicateFirstName) {
                error.push("Duplicate first name in CSV file at row" + first_name);
            }
            const duplicateLastName = await insertToStudent.find((student) => student.last_name === last_name);
            if (duplicateLastName) {
                error.push("Duplicate last name in CSV file at row" + last_name);
            }

            const duplicateRollNumber = await insertToStudent.find((student) => student.roll_number === roll_number);
            if (duplicateRollNumber) {
                error.push("Duplicate roll number in CSV file at row" + rowNumber);
            }

            const duplicateStudentEmail = await insertToStudent.find((student) => student.student_email === student_email);
            if (duplicateStudentEmail) {
                error.push("Duplicate Student Email in CSV file at row" + student_email);
            }
            const duplicateStudentPhone = await insertToStudent.find((student) => student.student_phone === student_phone);
            if (duplicateStudentPhone) {
                error.push("Duplicate Student Phone in CSV file at row" + student_phone);
            }

            if (error.length > 0) {
                validationErrors.push({
                    row: rowNumber,
                    student_email: student_email,
                    errors: error,
                })
            }

            insertToStudent.push({
                first_name: first_name,
                last_name: last_name,
                roll_number: roll_number,
                date_of_birth: date_of_birth,
                gender: formattedGender,
                student_email: student_email,
                student_phone: student_phone,
                admission_date: admission_date,
                parent_name: parent_name,
                parent_phone: parent_phone,
                parent_email: parent_email,
            })
        }

        if (validationErrors.length > 0) {
            await session.abortTransaction();

            if (
                req.file &&
                fs.existsSync(req.file.path)
            ) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                status: "error",
                message: "Validation errors in CSV file",
                total_errors: validationErrors.length,
                errors: validationErrors,
            })
        }

        await Student.insertMany(insertToStudent, { session });
        await session.commitTransaction();
        session.endSession();
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return responseSuccess(res, "Students imported successfully", 201);

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return responseError(res, error.message || "Failed to import students", 500);
    }
})

exports.exportStudents = asyncHandler(async (req, res) => {
    try {

        if (req.user.user.role !== 3) {
            return responseError(
                res,
                "You are not authorized to export students",
                403
            );
        }

        const students = await Student.find({})
            .sort({ createdAt: -1 });

        if (!students || students.length === 0) {
            return responseError(
                res,
                "No students found",
                404
            );
        }

        const data = students.map((student) => ({
            first_name: student.first_name || "",
            last_name: student.last_name || "",
            roll_number: student.roll_number || "",

            date_of_birth: student.date_of_birth
                ? new Date(student.date_of_birth)
                    .toISOString()
                    .split("T")[0]
                : "",

            gender: student.gender || "",

            student_email: student.student_email || "",
            student_phone: student.student_phone || "",

            admission_date: student.admission_date
                ? new Date(student.admission_date)
                    .toISOString()
                    .split("T")[0]
                : "",

            parent_name: student.parent_name || "",
            parent_phone: student.parent_phone || "",
            parent_email: student.parent_email || "",
        }));

        const worksheet = xlsx.utils.json_to_sheet(data);

        const workbook = xlsx.utils.book_new();

        xlsx.utils.book_append_sheet(
            workbook,
            worksheet,
            "Students"
        );

        // uploads folder path
        const uploadDir = path.join(
            __dirname,
            "../uploads"
        );

        // create folder if not exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, {
                recursive: true,
            });
        }

        const fileName =
            `students_${Date.now()}.xlsx`;

        const filePath = path.join(
            uploadDir,
            fileName
        );

        xlsx.writeFile(workbook, filePath);

        // file url
        const fileUrl =
            `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

        return res.status(200).json({
            success: true,
            message: "Students exported successfully",
            file_url: fileUrl,
        });

        setTimeout(() => {

            if (
                filePath &&
                fs.existsSync(filePath)
            ) {
                fs.unlinkSync(filePath);

                console.log(
                    "Export file deleted"
                );
            }

        }, 5000);


    } catch (error) {
        if (
            filePath &&
            fs.existsSync(filePath)
        ) {
            fs.unlinkSync(filePath);
        }

        return responseError(
            res,
            error.message || "Failed to export students",
            500
        );
    }
});