const jwt = require("jsonwebtoken");

const responseError = require(
  "../helpers/responseError"
);

const authMiddleware = async (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {

      return responseError(
        res,
        "No token provided",
        401
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = decoded;
    console.log("req.user is ", req.user);

    next();

  } catch (error) {

    return responseError(
      res,
      "Invalid or expired token",
      401,
      error.message
    );
  }
};

module.exports = authMiddleware;