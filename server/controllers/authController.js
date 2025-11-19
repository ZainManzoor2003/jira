import { users } from "../src/db/schema"; // path to your users table
import { db } from "../src/db/db"; // your Drizzle db instance
import { eq } from 'drizzle-orm';
const { sendEmailOtp } = require("../controllers/emailNotify"); // your email service

const signup = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));

    if (existingUser.length > 0) {
      const user = existingUser[0]; // Get the first matching user

      if (user.isVerified === true) {
        return res.json({ message: "Email already exists", success: false, user: existingUser });
      }
      else {
        const otp = await sendEmailOtp(email);
        const now = new Date();
        const otpExpiry = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
        const insertedUser = await db
          .update(users)
          .set({
            otp: otp,
            otp_expiry_date: otpExpiry,
          }).returning()
          .where(eq(users.email, email));
        return res.json({ message: "OTP sent Successfully", success: true, user: insertedUser });
      }
    }

    // Generate OTP and send email
    const otp = await sendEmailOtp(email);

    // Calculate expiry date (10 minutes from now)
    const now = new Date();
    const otpExpiry = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    // Store user + OTP in DB
    const insertedUser = await db.insert(users).values({
      email,
      otp,
      otp_expiry_date: otpExpiry,
      created_at: new Date(),
    }).returning();

    res.json({
      message: "User signed up. OTP sent to email",
      success: true,
      user: insertedUser, // optional, remove in production
    });

  } catch (err) {
    console.error("Signup OTP Error:", err);
    res.status(500).json({ message: "Error sending OTP email" });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ message: "Email is required", success: false });
    }
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    const user = existingUser[0]

    if (user.isVerified === true) {
      return res.json({ message: "Email already verified", success: false });
    }

    // Generate OTP and send email
    const otp = await sendEmailOtp(email);
    const now = new Date();
    const otpExpiry = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
    await db
      .update(users)
      .set({
        otp: otp,
        otp_expiry_date: otpExpiry,
      })
      .where(eq(users.email, email));
    res.json({ message: "OTP sent Successfully", success: true });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ message: "Error resending OTP email" });
  }

}

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, email));

    if (!user || user.length === 0) {
      return res.json({ message: "User not found", success: false });
    }

    const currentUser = user[0];

    // Check if OTP matches
    if (currentUser.otp !== otp) {
      return res.json({ message: "Invalid OTP", success: false });
    }

    // Check if OTP expired
    const now = new Date();
    if (new Date(currentUser.otp_expiry_date) < now) {
      return res.json({ message: "OTP has expired", success: false });
    }

    await db
      .update(users)
      .set({
        isVerified: true,
        otp: null,                // optional → remove OTP after verification
        otp_expiry_date: null,     // optional → clear expiry
      })
      .where(eq(users.id, currentUser.id));

    // OTP is valid
    return res.json({ message: "OTP verified successfully", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /auth/profiles
const getAllProfiles = async (req, res) => {
  // await db.delete(users); // Example delete operation
  try {
    const allUsers = await db.select().from(users); // fetch all users

    res.json({ users: allUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
module.exports = {
  signup,
  verifyEmail,
  resendOTP,
  getAllProfiles
};
