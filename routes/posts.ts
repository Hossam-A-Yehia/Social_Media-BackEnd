import express = require("express");
import userAuth from "../middleware/authMiddleware";
import {
  createPost,
  getPosts,
  getPost,
  getUserPost,
  getComments,
  likePost,
  likePostComment,
  commentPost,
  deletePost,
  replyPostComment,
  updatePost,
  deleteComment,
  deleteReply,
} from "../controllers/posts";

const router = express.Router();

router.post("/create-post", userAuth, createPost as any);
router.post("/", userAuth, getPosts as any);
router.post("/:id", userAuth, getPost as any);
router.post("/get-user-post/:id", userAuth, getUserPost as any);
router.get("/comments/:postId", userAuth, getComments as any);
router.post("/like/:postId", userAuth, likePost as any);
router.post(
  "/like-comment/:commentId/:replayId",
  userAuth,
  likePostComment as any
);
router.post("/comment/:postId", userAuth, commentPost as any);
router.post("/reply-comment/:commentId", userAuth, replyPostComment as any);
router.delete("/:postId", userAuth, deletePost as any);
router.delete(
  "/deleteComment/:postId/:commentId",
  userAuth,
  deleteComment as any
);
router.put("/update-post/:postId", userAuth, updatePost as any);
router.delete(
  "/delete-reply/:commentId/:replyId",
  userAuth,
  deleteReply as any
);

module.exports = router;
