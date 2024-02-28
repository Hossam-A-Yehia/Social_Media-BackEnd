"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const posts_1 = require("../controllers/posts");
const router = express.Router();
router.post("/create-post", authMiddleware_1.default, posts_1.createPost);
router.post("/", authMiddleware_1.default, posts_1.getPosts);
router.post("/:id", authMiddleware_1.default, posts_1.getPost);
router.post("/get-user-post/:id", authMiddleware_1.default, posts_1.getUserPost);
router.get("/comments/:postId", authMiddleware_1.default, posts_1.getComments);
router.post("/like/:postId", authMiddleware_1.default, posts_1.likePost);
router.post("/like-comment/:commentId/:replayId", authMiddleware_1.default, posts_1.likePostComment);
router.post("/comment/:postId", authMiddleware_1.default, posts_1.commentPost);
router.post("/reply-comment/:commentId", authMiddleware_1.default, posts_1.replyPostComment);
router.delete("/:postId", authMiddleware_1.default, posts_1.deletePost);
router.delete("/deleteComment/:postId/:commentId", authMiddleware_1.default, posts_1.deleteComment);
router.put("/update-post/:postId", authMiddleware_1.default, posts_1.updatePost);
router.delete("/delete-reply/:commentId/:replyId", authMiddleware_1.default, posts_1.deleteReply);
module.exports = router;
//# sourceMappingURL=posts.js.map