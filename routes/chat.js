const express=require("express");
const router=express.Router();
const {getMessages,getChats,uploadImages,getMedia}=require('../Controller/chatController/chat');
const upload = require("../middleware/uploadImg");

router.post('/get-messages',getMessages);
router.post('/get-chats',getChats);
router.post('/upload-images',upload('pingMe/chat').single("images"),uploadImages);
router.post('/upload-images',upload('pingMe/chat').single("videos"),uploadImages);
router.post('/getMedia',getMedia);

module.exports=router;
