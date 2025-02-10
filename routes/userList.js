const express=require("express");
const router=express.Router();
const {userListController}=require("../Controller/user/userListController.js");
const {getProfile,updateProfile,updateProfileImg}=require("../Controller/user/profileController.js")
const upload=require('../middleware/uploadImg.js');

router.post('/userList',userListController);
router.get('/profile/:id',getProfile);
router.put('/profile/:id',updateProfile);
router.put("/profileImage/:id",upload('pingMe/profile').single("image"),updateProfileImg);
module.exports=router;
