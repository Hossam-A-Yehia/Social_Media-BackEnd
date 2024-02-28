import express = require("express");

const router = express.Router();
import {
  register,
  login,
  resetPassword,
  friendRequest,
  getFriendRequest,
  acceptRequest,
  profileView,
  suggestedFriends,
  getUserInfo,
} from "../controllers/auth";
import userAuth from "../middleware/authMiddleware";

router.post("/register", register as any);
router.post("/login", login as any);
router.post("/reset-password", resetPassword as any);
router.post("/friend-request", userAuth, friendRequest as any);
router.post("/get-friend-request", userAuth, getFriendRequest as any);
router.post("/accept-request", userAuth, acceptRequest as any);
router.post("/profile-view", userAuth, profileView as any);
router.get("/suggestedFriends", userAuth, suggestedFriends as any);
router.post("/user-info/:userId", userAuth, getUserInfo as any);

module.exports = router;
