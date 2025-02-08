const express=require("express");
const router=express.Router();
const {Register}=require('../Controller/authController/Register');
const {Login}=require('../Controller/authController/Login');

router.post('/register',Register);
router.post('/login',Login);

module.exports=router;
