import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies; //ব্রাউজারের cookie থেকে token বের করা হয়েছে।

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET); // token ভেরিফাই

    if (tokenDecode.id) {
      // req.body.userId = tokenDecode.id; // or
      req.userId = tokenDecode.id; //--- token valid হলে, token এর মধ্যে থাকা ইউজারের id বের করা হয়।
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized. Login Again" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

export default userAuth;
