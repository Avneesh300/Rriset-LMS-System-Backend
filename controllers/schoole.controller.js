const SchoolAdmin = require("../models/School");
const User = require("../models/User");
const Class = require("../models/Class");
const Grade = require("../models/Grade");
const Section = require("../models/Section");


const xlsx = require("xlsx");
const fs = require("fs");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const asyncHandler = require("../middleware/asyncHandler");

const responseSuccess = require("../helpers/responseSuccess");

const responseError = require("../helpers/responseError");

const mongoose = require("mongoose");

exports.registerSchoole =
  asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let {
        schooladmin_id,
        institution_id,
        school_type,
        school_name,
        school_udise_code,
        area_type,
        state,
        district,
        town_name,
        principal_name,
        principal_email,
        principal_mobile,
        category_name,
        grades_id,
        sections_id,
      } = req.body;

      if (req.user.user.role !== 5) {
        await session.abortTransaction();
        return responseError(
          res,
          "Access denied. Only Institution can Create",
          403
        );
      }

      if (Array.isArray(category_name)) {
        category_name = category_name[0];
      }
      category_name = String(category_name).trim();
      let parsedGrades = [];
      if (Array.isArray(grades_id)) {
        parsedGrades = grades_id;
      } else if (
        typeof grades_id === "string"
      ) {
        if (grades_id.startsWith("[")) {
          parsedGrades =
            JSON.parse(grades_id);
        } else {
          parsedGrades = [grades_id];
        }
      }
      let parsedSection = null;

      if (sections_id) {
        parsedSection = sections_id;
      }
      if (!institution_id) {
        await session.abortTransaction();
        return responseError(
          res,
          "Institution is required",
          400
        );
      }

      if (!school_type) {
        await session.abortTransaction();
        return responseError(
          res,
          "School type is required",
          400
        );
      }

      if (!school_name) {
        await session.abortTransaction();
        return responseError(
          res,
          "School name is required",
          400
        );
      }

      if (!school_udise_code) {
        await session.abortTransaction();
        return responseError(
          res,
          "School udise code is required",
          400
        );
      }

      if (!area_type) {
        await session.abortTransaction();
        return responseError(
          res,
          "Area type is required",
          400
        );
      }

      if (!state) {
        await session.abortTransaction();
        return responseError(
          res,
          "State is required",
          400
        );
      }

      if (!district) {
        await session.abortTransaction();
        return responseError(
          res,
          "District is required",
          400
        );
      }

      if (!town_name) {
        await session.abortTransaction();
        return responseError(
          res,
          "Town name is required",
          400
        );
      }

      if (!principal_name) {
        await session.abortTransaction();
        return responseError(
          res,
          "Principal name is required",
          400
        );
      }

      if (!principal_email) {
        await session.abortTransaction();
        return responseError(
          res,
          "Principal email is required",
          400
        );
      }

      if (!principal_mobile) {
        await session.abortTransaction();
        return responseError(
          res,
          "Principal mobile is required",
          400
        );
      }

      if (!category_name) {
        await session.abortTransaction();
        return responseError(
          res,
          "Category name is required",
          400
        );
      }

      if (
        !Array.isArray(parsedGrades) ||
        parsedGrades.length === 0
      ) {
        await session.abortTransaction();
        return responseError(
          res,
          "Grades are required",
          400
        );
      }

      if (!parsedSection) {
        await session.abortTransaction();
        return responseError(
          res,
          "Section is required",
          400
        );
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          principal_email
        )
      ) {
        await session.abortTransaction();
        return responseError(
          res,
          "Invalid email format",
          400
        );
      }

      const mobileRegex =
        /^[0-9]{10}$/;

      if (
        !mobileRegex.test(
          principal_mobile
        )
      ) {
        await session.abortTransaction();
        return responseError(
          res,
          "Invalid mobile number",
          400
        );
      }

      if (schooladmin_id) {
        const user = await User.findOne({ schooladmin_id }).session(session);
        if (!user) {
          await session.abortTransaction();
          return responseError(
            res,
            "School not found",
            404
          );
        }

        const schooladmin =
          await SchoolAdmin.findById(
            user.schooladmin_id
          ).session(session);

        if (!schooladmin) {
          await session.abortTransaction();
          return responseError(
            res,
            "School not found",
            404
          );
        }

        const existingEmail =
          await User.findOne({
            email: principal_email,
            _id: {
              $ne: user._id,
            },
          }).session(session);

        if (existingEmail) {
          await session.abortTransaction();
          return responseError(
            res,
            "Email already exists",
            400
          );
        }

        const existingUdise =
          await SchoolAdmin.findOne({
            school_udise_code,
            _id: {
              $ne:
                schooladmin._id,
            },
          }).session(session);
        if (existingUdise) {
          await session.abortTransaction();
          return responseError(
            res,
            "Udise code already exists",
            400
          );
        }

        schooladmin.institution_id = institution_id;
        schooladmin.school_type = school_type;
        schooladmin.school_name = school_name;
        schooladmin.school_udise_code = school_udise_code;
        schooladmin.area_type = area_type;
        schooladmin.state = state;
        schooladmin.district = district;
        schooladmin.town_name = town_name;
        schooladmin.principal_name = principal_name;
        schooladmin.category_name = category_name;
        schooladmin.grades_id = parsedGrades;
        schooladmin.sections_id = parsedSection;
        schooladmin.created_by = req.user.user.id;
        user.username = school_name;
        user.email = principal_email;
        user.mobile = principal_mobile;
        user.institution_id = institution_id;
        await schooladmin.save({ session, });
        await user.save({ session });


        const existingClasses =
          await Class.find({
            school_id: schooladmin._id
          }).session(session);


        const sectionData =
          await Section.findById(
            parsedSection
          ).session(session);


        for (const gradeId of parsedGrades) {

          // check already exists
          const existingClass =
            existingClasses.find(
              (cls) =>
                cls.grade_id.toString() ===
                gradeId.toString()
            );

          // if exists -> activate
          if (existingClass) {
            existingClass.status = true;
            existingClass.section_id = sectionData._id;
            existingClass.section_name = sectionData.sectionName;
            await existingClass.save({ session });
          } else {

            // create new class
            const grade = await Grade.findById(gradeId).session(session);
            await Class.create(
              [{
                // class_name: grade.gradeName,
                school_id: schooladmin._id,
                grade_id: grade._id,
                section_id: sectionData._id,
                academic_year: "2026-2027",
                student_capacity: 0,
                created_by: req.user.user.id,
                status: true,
              }],
              { session }
            );
          }
        }

        // deactivate removed grades
        for (const cls of existingClasses) {

          const stillSelected =
            parsedGrades.some(
              (gradeId) =>
                gradeId.toString() ===
                cls.grade_id.toString()
            );

          if (!stillSelected) {
            cls.status = false;
            await cls.save({ session });
          }
        }
        await session.commitTransaction();
        session.endSession();
        return responseSuccess(
          res,
          "School updated successfully"
        );
      }

      // ===================================================
      // CREATE SECTION
      // ===================================================

      const existingUser =
        await User.findOne({ email: principal_email }).session(session);
      if (existingUser) {
        await session.abortTransaction();
        return responseError(
          res,
          "Email already registered",
          400
        );
      }

      const existingMobile =
        await User.findOne({ mobile: principal_mobile }).session(session);
      if (existingMobile) {
        await session.abortTransaction();
        return responseError(
          res,
          "Mobile already registered",
          400
        );
      }

      const existingUdise =
        await SchoolAdmin.findOne({ school_udise_code }).session(session);
      if (existingUdise) {
        await session.abortTransaction();
        return responseError(
          res,
          "Udise code already exists",
          400
        );
      }

      const hashedPassword =
        await bcrypt.hash(
          principal_mobile,
          10
        );

      const users =
        await User.create(
          [
            {
              username: school_name,
              email: principal_email,
              mobile: principal_mobile,
              institution_id: institution_id,
              password: hashedPassword,
              role: 3,
            },
          ],
          { session }
        );

      const newUser = users[0];
      const schools = await SchoolAdmin.create(
        [
          {
            institution_id,
            school_type,
            school_name,
            school_udise_code,
            area_type,
            state,
            district,
            town_name,
            principal_name,
            category_name,
            grades_id: parsedGrades,
            sections_id: parsedSection,
            created_by: req.user.user.id,
          },
        ],
        { session }
      );

      const schooladmin = schools[0];
      newUser.schooladmin_id = schooladmin._id;
      await newUser.save({ session });


      // ======================================
      // CREATE CLASSES
      // ======================================

      const gradeData = await Grade.find({
        _id: { $in: parsedGrades }
      }).session(session);

      const sectionData =
        await Section.findById(
          parsedSection
        ).session(session);

      const classData = [];
      for (const grade of gradeData) {
        const classObject = {
          school_id: schooladmin._id,
          grade_id: grade._id,
          section_id: sectionData._id,
          academic_year: "2026-2027",
          student_capacity: 0,
          created_by: req.user.user.id,
        };
        classData.push(classObject);
      }
      await Class.insertMany(classData, { session });

      await session.commitTransaction();
      session.endSession();
      return responseSuccess(
        res,
        "School registered successfully",
      );

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.log(error);
      return responseError(
        res,
        error.message ||
        "Something went wrong",
        500
      );
    }
  });

exports.getAllSchoole =
  asyncHandler(async (req, res) => {
    if (req.user.user.role !== 5 && req.user.user.role !== 1) {
      return responseError(
        res,
        "Access denied. Only Super admin and Institution can access",
        403
      );
    }
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const search = req.body.search || "";
    const status = req.body.status || "";
    const skip = (page - 1) * limit;
    const userFilter = {
      role: 3,
    };
    const filter = {};
    if (search) {
      filter.$or = [
        {
          school_name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          school_udise_code: {
            $regex: search,
            $options: "i",
          },
        },
        {
          principal_name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          district: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }
    const total = await User.countDocuments(userFilter);
    const users = await User.find(userFilter)
      .select(" -refreshToken -accessToken")
      .populate({
        path: "schooladmin_id",
        match: filter,
        model: "SchoolAdmin",
        populate: {
          path: "institution_id",
          model: "Institution"
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    console.log("data is ", users)

    const pagination = {
      total,
      currentPage: page,
      totalPages: Math.ceil(
        total / limit
      ),
      perPage: limit,
    };

    const formattedData = users.map((user) => ({
      id: user._id,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      schooladmin_id: user.schooladmin_id._id,
      institution_id: user.schooladmin_id.institution_id._id,
      institution_name: user.schooladmin_id.institution_id.institution_name,
      school_type: user.schooladmin_id.school_type,
      school_name: user.schooladmin_id.school_name,
      school_udise_code: user.schooladmin_id.school_udise_code,
      area_type: user.schooladmin_id.area_type,
      state: user.schooladmin_id.state,
      district: user.schooladmin_id.district,
      town_name: user.schooladmin_id.town_name,
      district: user.schooladmin_id.district,
      principal_name: user.schooladmin_id.principal_name,
      category_name: user.schooladmin_id.category_name,
      district: user.schooladmin_id.district,
      grades_id: user.schooladmin_id.grades_id,
      sections_id: user.schooladmin_id.sections_id,
      status: user.schooladmin_id.status,
      createdAt: user.schooladmin_id.createdAt,
      updatedAt: user.schooladmin_id.updatedAt,
      created_by: user.schooladmin_id.created_by,
      paginations: pagination

    }))

    return responseSuccess(
      res,
      "School list fetched successfully",
      formattedData,
      200
    );
  });

exports.getSchoolebyId =
  asyncHandler(async (req, res) => {
    if (req.user.user.role !== 5 && req.user.user.role !== 1) {
      return responseError(
        res,
        "Access denied. Only Super admin and Institution can access",
        403
      );
    }
    const schooladmin_id = req.body.schooladmin_id;
    const school = await SchoolAdmin.findById(schooladmin_id)
      .populate({
        path: "institution_id",
        model: "Institution"
      });
    const user = await User.findOne({ schooladmin_id });
    const classesdata = await Class.find({ school_id: schooladmin_id });
    const classformattedData =
      await Promise.all(
        classesdata.map(
          async (item) => {
            const grade_name =
              await Grade.findById(
                item.grade_id
              );
            const section_name =
              await Section.findById(
                item.section_id
              );
            return {
              id: item._id,
              class_name: item.class_name,
              section_name: item.section_name,
              grade_id: item.grade_id,
              gradeName: grade_name?.gradeName || "",
              section_id: item.section_id,
              sectionName: section_name?.sectionName || "",
              academic_year: item.academic_year,
              student_capacity: item.student_capacity,
              created_by: item.created_by,
              status: item.status,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            };
          }
        )
      );

    const formattedData = {
      id: user._id,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      schooladmin_id: school._id,
      institution_id: school.institution_id._id,
      institution_name: school.institution_id.institution_name,
      school_type: school.school_type,
      school_name: school.school_name,
      school_udise_code: school.school_udise_code,
      area_type: school.area_type,
      state: school.state,
      district: school.district,
      town_name: school.town_name,
      district: school.district,
      principal_name: school.principal_name,
      category_name: school.category_name,
      district: school.district,
      grades_id: school.grades_id,
      sections_id: school.sections_id,
      status: school.status,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
      created_by: school.created_by,
      classes: classformattedData
    }

    return responseSuccess(
      res,
      "School data fetched successfully",
      formattedData,

    );
  });


exports.deleteSchoole =
  asyncHandler(async (req, res) => {
    const {
      id,
      status
    } = req.body;

    if (req.user.user.role !== 5) {
      return responseError(
        res,
        "Access denied. Only Institution can Create",
        403
      );
    }
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
      const schoole = await SchoolAdmin.findById(id);
      const user = await User.findOne({ schooladmin_id: schoole._id });
      if (!user.schooladmin_id) {
        return responseError(
          res,
          "Schoole id is not found in User",
          400
        )
      };
      if (!schoole) {
        return responseError(
          res,
          "Schoole not found",
          404
        );
      }
      if (status === "A") {
        schoole.status = 0;
        user.status = 0;
      }
      if (status === "B") {
        schoole.status = 1;
        user.status = 1;
      }
      await user.save();
      await schoole.save();
      return responseSuccess(
        res,
        "Schoole Status Updated successfully",
        200
      );
    }
  });



exports.importSchools = asyncHandler(
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (req.user.user.role !== 5) {
        await session.abortTransaction();
        return responseError(
          res,
          "Only Institution can import schools",
          403
        );
      }

      if (!req.file) {
        await session.abortTransaction();
        return responseError(
          res,
          "Excel file is required",
          400
        );
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: "", });

      if (!jsonData || jsonData.length === 0) {
        await session.abortTransaction();
        return responseError(
          res,
          "Excel file is empty",
          400
        );
      }

      const validationErrors = [];
      const usersToInsert = [];
      const schoolsToInsert = [];
      const loginUser = await User.findById(req.user.user.id);
      if (!loginUser) {
        await session.abortTransaction();
        return responseError(
          res,
          "User not found",
          404
        );
      }

      for (
        let index = 0;
        index < jsonData.length;
        index++
      ) {
        const row = jsonData[index];
        const rowNumber = index + 2;
        const errors = [];
        const school_name = String(row.school_name || "").trim();
        const school_type = String(row.school_type || "").trim();
        const school_udise_code = String(row.udise_code || "").trim();
        const area_type = String(row.area_type || "").trim();
        const state = String(row.state || "").trim();
        const district = String(row.district || "").trim();
        const town_name = String(row.town_name || "").trim();
        const principal_name = String(row.principal_name || "").trim();
        const principal_email = String(row.principal_email || "").trim().toLowerCase();
        const principal_mobile = String(row.principal_mobile || "").trim();
        let category_name = String(row.category_name || "").trim();

        let grades_id = [];
        if (row.grade_level_id) {
          const gradeNames = String(row.grade_level_id).split(",").map((g) => g.trim());
          const grades = await Grade.find({
            _id: { $in: gradeNames }
          }).session(session);
          grades_id = grades.map((g) => g._id); if (grades_id.length !== gradeNames.length) { errors.push("Some grades not found"); }
        }

        let sections_id = null;
        if (row.section_name) {
          const sectionName = String(row.section_name).trim();
          console.log("section id is ", sectionName);
          const section = await Section.findOne({
            _id: sectionName
          }).session(session);
          if (!section) {
            errors.push("Section not found");
          } else {
            sections_id = section._id;
          }
        }

        if (!school_name) { errors.push("School name is required"); }
        if (!school_type) { errors.push("School type is required"); }
        if (!school_udise_code) { errors.push("Udise code is required"); }
        if (!area_type) { errors.push("Area type is required"); }
        if (!state) { errors.push("State is required"); }
        if (!district) { errors.push("District is required"); }
        if (!town_name) { errors.push("Town name is required"); }
        if (!principal_name) { errors.push("Principal name is required"); }
        if (!principal_email) { errors.push("Principal email is required"); }
        if (!principal_mobile) { errors.push("Principal mobile is required"); }
        if (!category_name) { errors.push("Category name is required"); }
        if (grades_id.length === 0) { errors.push("Grades are required"); }
        if (!sections_id) {
          errors.push("Sections are required");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (principal_email && !emailRegex.test(principal_email)) { errors.push("Invalid email format"); }

        // ======================================================
        // MOBILE VALIDATION
        // ======================================================

        const mobileRegex =
          /^[0-9]{10}$/;

        if (
          principal_mobile &&
          !mobileRegex.test(
            principal_mobile
          )
        ) {

          errors.push(
            "Invalid mobile number"
          );
        }

        // ======================================================
        // DUPLICATE EMAIL
        // ======================================================

        const existingEmail =
          await User.findOne({
            email:
              principal_email,
          }).session(session);

        if (existingEmail) {

          errors.push(
            "Email already exists"
          );
        }

        // ======================================================
        // DUPLICATE MOBILE
        // ======================================================

        const existingMobile =
          await User.findOne({
            mobile:
              principal_mobile,
          }).session(session);

        if (existingMobile) {

          errors.push(
            "Phone already exists"
          );
        }

        // ======================================================
        // DUPLICATE UDISE
        // ======================================================

        const existingUdise =
          await SchoolAdmin.findOne({
            school_udise_code,
          }).session(session);

        if (existingUdise) {

          errors.push(
            "Udise code already exists"
          );
        }

        // ======================================================
        // DUPLICATE INSIDE EXCEL
        // ======================================================

        const duplicateEmail =
          usersToInsert.find(
            (item) =>
              item.email ===
              principal_email
          );

        if (duplicateEmail) {

          errors.push(
            "Duplicate email in excel"
          );
        }

        const duplicateMobile =
          usersToInsert.find(
            (item) =>
              item.mobile ===
              principal_mobile
          );

        if (duplicateMobile) {

          errors.push(
            "Duplicate mobile in excel"
          );
        }

        const duplicateUdise =
          schoolsToInsert.find(
            (item) =>
              item.school_udise_code ===
              school_udise_code
          );

        if (duplicateUdise) {

          errors.push(
            "Duplicate udise in excel"
          );
        }

        // ======================================================
        // STORE ERRORS
        // ======================================================

        if (errors.length > 0) {

          validationErrors.push({
            row: rowNumber,
            school_name,
            errors,
          });

          continue;
        }

        // ======================================================
        // HASH PASSWORD
        // ======================================================

        const hashedPassword =
          await bcrypt.hash(
            principal_mobile,
            10
          );

        // ======================================================
        // USER DATA
        // ======================================================

        usersToInsert.push({
          username:
            school_name,
          email:
            principal_email,
          mobile:
            principal_mobile,
          password:
            hashedPassword,
          role: 3,
          institution_id: loginUser.institution_id,
        });

        // ======================================================
        // SCHOOL DATA
        // ======================================================

        schoolsToInsert.push({
          institution_id:
            loginUser.institution_id,
          school_type,
          school_name,
          school_udise_code,
          area_type,
          state,
          district,
          town_name,
          principal_name,
          category_name,
          grades_id,
          sections_id,
          created_by:
            req.user.user.id,
        });
      }

      // ======================================================
      // RETURN VALIDATION ERRORS
      // ======================================================

      if (
        validationErrors.length > 0
      ) {

        await session.abortTransaction();

        return res.status(400).json({
          status: "error",
          message:
            "Validation failed",
          total_errors:
            validationErrors.length,
          errors:
            validationErrors,
        });
      }

      // ======================================================
      // INSERT DATA
      // ======================================================

      for (
        let i = 0;
        i <
        usersToInsert.length;
        i++
      ) {

        const users =
          await User.create(
            [usersToInsert[i]],
            { session }
          );

        const newUser =
          users[0];

        const schools =
          await SchoolAdmin.create(
            [schoolsToInsert[i]],
            { session }
          );

        const school =
          schools[0];

        newUser.schooladmin_id =
          school._id;

        await newUser.save({
          session,
        });

        // ======================================
        // CREATE CLASSES
        // ======================================

        const gradeData = await Grade.find({
          _id: { $in: schoolsToInsert[i].grades_id }
        }).session(session);

        const sectionData =
          await Section.findById(
            schoolsToInsert[i].sections_id
          ).session(session);

        const classData = [];

        for (const grade of gradeData) {

          const classObject = {

            class_name: grade.gradeName,

            section_name:
              sectionData.sectionName,

            school_id: school._id,

            grade_id: grade._id,

            section_id: sectionData._id,

            academic_year: "2026-2027",

            student_capacity: 0,

            created_by: req.user.user.id,
          };

          classData.push(classObject);
        }

        await Class.insertMany(
          classData,
          { session }
        );

      }

      // ======================================================
      // COMMIT
      // ======================================================

      await session.commitTransaction();

      session.endSession();

      // delete uploaded file
      if (
        req.file &&
        fs.existsSync(req.file.path)
      ) {

        fs.unlinkSync(req.file.path);
      }


      return responseSuccess(
        res,
        "Schools imported successfully",
        {
          total_imported:
            schoolsToInsert.length,
        },
        200
      );

    } catch (error) {

      await session.abortTransaction();

      session.endSession();

      console.log(error);
      // delete uploaded file
      if (
        req.file &&
        fs.existsSync(req.file.path)
      ) {

        fs.unlinkSync(req.file.path);
      }

      return responseError(
        res,
        error.message ||
        "Import failed",
        500
      );
    }
  }
);

exports.exportSchools = asyncHandler(
  async (req, res) => {

    try {

      if (req.user.user.role !== 5) {

        return responseError(
          res,
          "Only Institution can export schools",
          403
        );
      }

      // ======================================
      // GET SCHOOLS
      // ======================================

      const schools =
        await SchoolAdmin.find()
          .populate({
            path: "institution_id",
            select: "institution_name",
          })
          .lean();

      if (
        !schools ||
        schools.length === 0
      ) {

        return responseError(
          res,
          "No schools found",
          404
        );
      }

      // ======================================
      // FORMAT DATA
      // ======================================

      const exportData =
        await Promise.all(
          schools.map(async (school) => {

            const user =
              await User.findOne({
                schooladmin_id:
                  school._id,
              }).lean();

            const grades =
              await Grade.find({
                _id: {
                  $in: school.grades_id,
                },
              }).lean();

            const section =
              await Section.findById(
                school.sections_id
              ).lean();

            return {

              institution_name:
                school.institution_id
                  ?.institution_name || "",

              school_name:
                school.school_name || "",

              school_type:
                school.school_type || "",

              school_udise_code:
                school.school_udise_code || "",

              area_type:
                school.area_type || "",

              state:
                school.state || "",

              district:
                school.district || "",

              town_name:
                school.town_name || "",

              principal_name:
                school.principal_name || "",

              principal_email:
                user?.email || "",

              principal_mobile:
                user?.mobile || "",

              category_name:
                school.category_name || "",

              grades:
                grades
                  .map(
                    (g) =>
                      g.gradeName
                  )
                  .join(", "),

              section:
                section?.sectionName || "",

              status:
                school.status
                  ? "Active"
                  : "Inactive",

              createdAt:
                school.createdAt,
            };
          })
        );

      // ======================================
      // CREATE EXCEL
      // ======================================

      const worksheet =
        xlsx.utils.json_to_sheet(
          exportData
        );

      const workbook =
        xlsx.utils.book_new();

      xlsx.utils.book_append_sheet(
        workbook,
        worksheet,
        "Schools"
      );

      // ======================================
      // FILE PATH
      // ======================================

      const filePath =
        `uploads/schools_${Date.now()}.xlsx`;

      xlsx.writeFile(
        workbook,
        filePath
      );

      // ======================================
      // DOWNLOAD FILE
      // ======================================

      return res.download(
        filePath,
        "schools.xlsx",
        (err) => {

          if (err) {

            console.log(err);
          }

          // delete file after download
          if (
            fs.existsSync(filePath)
          ) {

            fs.unlinkSync(filePath);
          }
        }
      );

    } catch (error) {
     
      console.log(error);

      return responseError(
        res,
        error.message ||
        "Export failed",
        500
      );
    }
  }
);




