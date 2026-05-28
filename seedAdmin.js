const mongoose =
    require("mongoose");

const bcrypt =
    require("bcryptjs");

require("dotenv").config();

// user model
const User =
    require("./models/User");

// mongodb connect
mongoose.connect(
    process.env.MONGO_URI
)

.then(async () => {

    console.log(
        "MongoDB Connected"
    );

    // check existing admin
    const existingAdmin =
        await User.findOne({
            email:
                "admin@gmail.com",
        });

    if (existingAdmin) {

        console.log(
            "Super Admin already exists"
        );

        process.exit();
    }

    // hash password
    const hashedPassword =
        await bcrypt.hash(
            "admin123",
            10
        );

    // create admin
    const admin =
        await User.create({

            username:
                "Super Admin",

            email:
                "admin@gmail.com",

            mobile:
                "9876543210",

            password:
                hashedPassword,

            role: 1,
        });

    console.log(
        "Super Admin Created"
    );

    console.log(admin);

    process.exit();

})

.catch((err) => {

    console.log(err);

    process.exit(1);
});