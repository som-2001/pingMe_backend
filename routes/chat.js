const express=require("express");
const router=express.Router();
const {getMessages,getChats}=require('../Controller/chatController/chat');

router.post('/get-messages',getMessages);
router.post('/get-chats',getChats);

module.exports=router;
