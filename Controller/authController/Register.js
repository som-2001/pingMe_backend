const User = require("../../model/UserSchema.js");
const { encryption, is_match } = require("node-data-cryption");

const Register = async (req, res) => {
  const key = encryption(req.body.password, 15);

  const existingUserEmail = await User.findOne({ email: req.body.email });

  const existingUserName = await User.findOne({
    username: req.body.username,
  });

  if (existingUserName) {
    return res.status(401).json({ message: "Already registered username!!" });
  }

  if (existingUserEmail) {
    return res.status(401).json({ message: "Already registered Email!!" });
  }

  try {
    const user = new User({
      email: req.body.email,
      salt: key,
      username: req.body.username,
    });
    const newUser = await user.save();
    return res
      .status(200)
      .json({ message: "You have successfully registered." });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { Register };
