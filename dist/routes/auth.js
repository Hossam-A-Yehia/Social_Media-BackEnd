"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const auth_1 = require("../controllers/auth");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
router.post("/register", auth_1.register);
router.post("/login", auth_1.login);
router.post("/reset-password", auth_1.resetPassword);
router.post("/friend-request", authMiddleware_1.default, auth_1.friendRequest);
router.post("/get-friend-request", authMiddleware_1.default, auth_1.getFriendRequest);
router.post("/accept-request", authMiddleware_1.default, auth_1.acceptRequest);
router.post("/profile-view", authMiddleware_1.default, auth_1.profileView);
router.get("/suggestedFriends", authMiddleware_1.default, auth_1.suggestedFriends);
router.post("/user-info/:userId", authMiddleware_1.default, auth_1.getUserInfo);
module.exports = router;
//# sourceMappingURL=auth.js.map