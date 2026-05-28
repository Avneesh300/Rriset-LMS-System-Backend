const User = require("../models/User");
const Institution = require("../models/Institution");

const bcrypt = require("bcryptjs");

const asyncHandler = require("../middleware/asyncHandler");

const responseSuccess = require("../helpers/responseSuccess");

const responseError = require("../helpers/responseError");
const sendEmail =
    require("../config/sendEmail");

const institutionRegisterTemplate =
    require(
        "../utils/institutionRegisterTemplate"
    );


// ======================================
// Register Institution
// ======================================
exports.registerInstitution =
    asyncHandler(async (req, res) => {
        const {
            institution_id,
            institution_name,
            institution_type,
            contact_person_name,
            country,
            state,
            city,
            address,
            email,
            mobile,
            password,
        } = req.body;

        if (
            !institution_name ||
            !institution_type ||
            !contact_person_name ||
            !country ||
            !state ||
            !city ||
            !address ||
            !mobile ||
            !email
        ) {
            return responseError(
                res,
                "All fields are required",
                400
            );
        }

        if (!institution_id && !password) {
            return responseError(
                res,
                "Password is required",
                400
            );
        }

        // ===================================================
        // UPDATE
        // ===================================================
        if (institution_id) {
            const user =
                await User.findOne({institution_id});

            if (!user) {
                return responseError(
                    res,
                    "Institution not found",
                    404
                );
            }

            const institution = await Institution.findById( institution_id );
            if (!institution) {
                return responseError(
                    res,
                    "Institution not found",
                    404
                );
            }

            institution.institution_name = institution_name;
            institution.institution_type = institution_type;
            institution.contact_person_name =  contact_person_name;
            institution.country = country;
            institution.state = state;
            institution.city = city;
            institution.address = address;
            await institution.save();

            user.username = institution_name;
            user.email = email || user.email;
            user.mobile = mobile || user.mobile;
            if (password) {
                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );
                user.password =  hashedPassword;
            }

            await user.save();
            return responseSuccess(
                res,
                "Institution updated successfully",
                200
            );
        }

        // ===================================================
        // CREATE
        // ===================================================

        const existingUser =  await User.findOne({ email });
        if (existingUser) {
            return responseError(
                res,
                "Email already registered",
                400
            );
        }

        const hashedPassword =  await bcrypt.hash(password, 10);
        // create user
        const newUser =
            await User.create({
                username: institution_name,
                email,
                mobile,
                password: hashedPassword,
                role: 5,
            });

        const institution =
            await Institution.create({
                institution_name,
                institution_type,
                contact_person_name,
                country,
                state,
                city,
                address,
            });

        newUser.institution_id =  institution._id;
        await newUser.save();

        // ==========================
        // Send Email
        // ==========================
        const html =
            institutionRegisterTemplate({
                contact_person_name,
                institution_name,
                email,
                mobile,
            });

        await sendEmail(
            email,
            "Institution Registered Successfully",
            html
        );

        return responseSuccess(
            res,
            "Institution registered successfully",
        );
    });

// Approved Institution

exports.approvedInstitution =
    asyncHandler(async (req, res) => {
        const {
            institution_id
        } = req.body;

        if (!institution_id) {
            return responseError(
                res,
                "institution_id is required",
                400
            );
        }
        if (Institution) {
            const institution =  await Institution.findById( institution_id );
            if (!institution) {
                return responseError(
                    res,
                    "Institution not found",
                    404
                );
            }
            institution.institution_status = 2;
            await institution.save();        
            return responseSuccess(
                res,
                "Institution approved successfully",
                200
            );
        }
    });

// Reject Institute

exports.rejectedInstitution =
    asyncHandler(async (req, res) => {
        const { institution_id,  rejected_reason } = req.body;

        if (!institution_id) {
            return responseError(
                res,
                "institution_id is required",
                400
            );
        }
        if (!rejected_reason) {
            return responseError(
                res,
                "Rejected reason is required",
                400
            );
        }

        if (institution_id) {
            const institution = await Institution.findById( institution_id  );
            if (!institution) {
                return responseError(
                    res,
                    "Institution not found",
                    404
                );
            }

            institution.institution_status = 3;
            institution.rejected_reason = rejected_reason;
            await institution.save();
            return responseSuccess(
                res,
                "Institution reject successfully",
                200
            );
        }

    });

exports.getAllInstitution =
    asyncHandler(async (req, res) => {
        if (req.user.user.role !== 1) {
            return responseError(
                res,
                "Access denied. Only Super Admin can access",
                403
            );
        }

        const page = parseInt(req.body.page) || 1;
        const limit = parseInt(req.body.limit) || 10;
        const search = req.body.search || "";
        const institution_status = req.body.institution_status || "";
        const skip = (page - 1) * limit;
        const userFilter = {
            role: 5,
        };

        const institutionFilter = {
            institution_name: {
                $regex: search,
                $options: "i",
            },
        };

        if (institution_status) {
            institutionFilter.institution_status =
                institution_status;
        }

        const total = await User.countDocuments(userFilter);
        const users = await User.find(userFilter)
            .select(
                "-password -refreshToken -accessToken"
            )
            .populate({
                path: "institution_id",
                match: institutionFilter,
            })
            .sort({ createdAt: -1, })
            .skip(skip)
            .limit(limit);

        const pagination = {
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            perPage: limit,
        };

        const institutions = users.map((item) => ({
            id: item._id,
            username: item.username,
            email: item.email,
            mobile: item.mobile,
            role: item.role,
            institution_id: item.institution_id._id,
            institution_name: item.institution_id.institution_name,
            institution_type: item.institution_id.institution_type,
            contact_person_name: item.institution_id.contact_person_name,
            country: item.institution_id.country,
            state: item.institution_id.state,
            city: item.institution_id.city,
            address: item.institution_id.address,
            institution_status: item.institution_id.institution_status,
            status: item.institution_id.status,
            createdAt: item.institution_id.createdAt,
            updatedAt: item.institution_id.updatedAt,
            paginations: pagination,
        }))

        return responseSuccess(
            res,
            "Institution list fetched successfully",
            institutions,
        );
    });


exports.deleteInstitution =
    asyncHandler(async (req, res) => {

        const { id, status } = req.body;

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

        const user = await User.findOne({
            institution_id: id
        });

        if (!user) {
            return responseError(
                res,
                "Institution not found",
                404
            );
        }

        let updateStatus = true;

        if (status === "A") {
            updateStatus = false;
        }

        if (status === "B") {
            updateStatus = true;
        }

        user.status = updateStatus;
        await user.save();

        await Institution.findByIdAndUpdate(
            id,
            {
                status: updateStatus
            }
        );

        return responseSuccess(
            res,
            "Institution Updated successfully",
            200
        );
    });
