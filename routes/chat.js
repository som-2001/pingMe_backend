const express=require("express");
const router=express.Router();
const {getMessages,getChats,uploadImages}=require('../Controller/chatController/chat');
const upload = require("../middleware/uploadImg");

router.post('/get-messages',getMessages);
router.post('/get-chats',getChats);
router.post('/upload-images',upload('pingMe/chat').array('images',5),uploadImages)

module.exports=router;
