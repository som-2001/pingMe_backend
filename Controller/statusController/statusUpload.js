const Status = require("../../model/statusSchema.js");
const UserSchema = require("../../model/UserSchema.js");

const statusUpload = async (req, res) => {
  try {
    const { id, message } = req.body;

    const isAvailable = await Status.findOne({ userId: id });
    const User = await UserSchema.findById(id);

    if (isAvailable) {
      return res.status(401).json({ message: "Only one status can be added." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newStatus = new Status({
      userId: id,
      status: {
        message: message,
        image: req.file.path,
      },
    });

    const status = await newStatus.save();

    return res.status(200).json({
      message: "status uploaded!!",
      status: status,
      user: User,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


const getStatus = async (req, res) => {
  const page = req.body.page || 1;
  const limit = 100;

  try {
    const status = await Status.find()
      .populate("userId")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Status.countDocuments();
    const totalPage = Math.ceil(total / limit);

    return res
      .status(200)
      .json({ statuses: status, total: totalPage, currentPage: page });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};
module.exports = { statusUpload, getStatus };
