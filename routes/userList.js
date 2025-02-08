const express=require("express");
const router=express.Router();
const {userListController}=require("../Controller/user/userListController.js")

router.post('/userList',userListController);

module.exports=router;
