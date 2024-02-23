const jwt = require("jsonwebtoken");
const userAuth = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next("Authentication === failed");
  }

  const token = authHeader?.split(" ")[1];

  try {
    const userToken = jwt.verify(token, process.env.JWT_SEC);
    req.body.user = {
      userId: userToken._id,
    };
    next();
  } catch (error) {
    console.log(error);
    next("Authentication failed");
  }
};

export default userAuth;
