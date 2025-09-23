import { Router } from "express";
import { login, resendOtp, verifyOtp, singUp } from "../controller/authController";

const router = Router();

/**
 * @route   POST /auth/signup
 * @desc    Register a new user
 * @access  Public
 * @body    {username: string, email: string, password: string, gender: string (genderId reference)}
 * @returns 201 - User created & OTP sent to email
 */
router.post("/signup", singUp);

/**
 * @route   POST /auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 * @body    {email: string, password: string}
 * @returns 200 - Login success with JWT token
 */
router.post("/login", login);

/**
 * @route   POST /auth/verify-otp
 * @desc    Verify the OTP sent to the user’s email
 * @access  Public
 * @body    {email: string, otp: string}
 * @returns 200 - Account verified successfully
 */
router.post("/verify-otp", verifyOtp);

/**
 * @route   POST /auth/resend-otp
 * @desc    Resend a new OTP to the user’s email
 * @access  Public
 * @body    { email: string }
 * @returns 200 - New OTP sent
 */
router.post("/resend-otp", resendOtp);

export default router;
