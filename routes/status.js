const express=require("express");
const router=express.Router();
const {statusUpload,getStatus}=require('../Controller/statusController/statusUpload');
const upload = require("../middleware/uploadImg");

router.post('/upload',upload('pingMe/status').single("image"),statusUpload);
router.post("/getStatus",getStatus);

module.exports=router;