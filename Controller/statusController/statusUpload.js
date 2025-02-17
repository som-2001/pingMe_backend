const Status = require("../../model/statusSchema.js");

const statusUpload = async (req, res) => {
  try {
    const { id, message, image } = req.body;

    const isAvailable = await Status.findOne({userId:id});
    console.log(isAvailable)

    if (isAvailable) {
      return res.status(401).json({ message: "Only one status can be added." });
    }

    const newStatus = new Status({
      userId: id,
      status: {
        message: message,
        image: image,
      },
    });

    const status = await newStatus.save();

    return res
      .status(200)
      .json({ message: "status uploaded!!", status: status });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getStatus = async (req, res) => {
  const page = req.body.page || 1;
  const limit = 10;

  try {
    const status = await Status.find().populate("userId")
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
