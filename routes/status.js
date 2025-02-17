const express=require("express");
const router=express.Router();
const {statusUpload,getStatus}=require('../Controller/statusController/statusUpload');

router.post('/upload',statusUpload);
router.post("/getStatus",getStatus);

module.exports=router;