import {Router}  from "express";
import {login,resendOtp,verifyOtp,singUp} from "../controller/authController"

const router = Router();

router.post("/signup", singUp);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

export default router;