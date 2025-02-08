const User = require("../../model/UserSchema.js");

const userListController = async (req, res) => {
  const page = req.body.page || 1;
  const limit = 10;

  try {
    const user = await User.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();
    const totalPage = Math.ceil(total / limit);

    return res
      .status(200)
      .json({ users: user, total: totalPage, currentPage: page });


  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { userListController };
