const User = require("../../model/UserSchema");

const getProfile = async (req, res) => {
  try {
    const id = req.params.id;

    const userProfile = await User.findById(id);

    if (!userProfile) {
      return res.status(404).json({ message: "No user exists" });
    }
    console.log(userProfile);

    return res.status(200).send(userProfile);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// setValue("about",res.data.profile.about);
// setValue("description",res.data.profile.description);
// setValue("phone",res.data.profile.phone);
// setValue("address",res.data.profile.address)

const updateProfile = async (req, res) => {
  try {
    const { about, description, phone, address } = req.body;
    const id = req.params.id;

    console.log(id, req.body);

    const updatedProfile = await User.findByIdAndUpdate(
      id,
      {
        
        about: about,
        description: description,
        contact: [
          {
            phone_number: phone,
            address: address,
          },
        ],
      },
      { new: true }
    );

    return res.status(200).json(updatedProfile);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

const updateProfileImg = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("helloo");
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const updatedProfileImg = await User.findByIdAndUpdate(id, {
      profileImage: req.file.path,
    });

    return res.status(200).json({
      message: "Success",
      imageUrl: req.file.path,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateStatus = async (req, res) => {
  try {
    const id = req.body.sender_id;

    const updateUserStatus = await User.findByIdAndUpdate(
      id,
      { status: req.body.status },
      { new: true }
    );
    return res.status(200).send(updateUserStatus);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.message);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfileImg,
  updateStatus,
};
