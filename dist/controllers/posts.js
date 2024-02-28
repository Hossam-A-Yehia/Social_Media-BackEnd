"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updatePost = exports.deletePost = exports.deleteReply = exports.replyPostComment = exports.commentPost = exports.likePostComment = exports.likePost = exports.getComments = exports.getUserPost = exports.getPost = exports.getPosts = exports.createPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const User_1 = __importDefault(require("../models/User"));
const Comment_1 = __importDefault(require("../models/Comment"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body.user;
    const { image, description } = req.body;
    try {
        !description && res.json({ message: "Description required" });
        const newPost = yield Post_1.default.create({
            userId,
            image,
            description,
        });
        const user = yield User_1.default.findById(userId);
        user.posts.push(newPost._id);
        yield user.save();
        res
            .status(201)
            .json({ message: "Posts Added successfully", data: newPost });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error Fetch Posts" });
    }
});
exports.createPost = createPost;
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req.body.user;
    const { search } = req.body;
    try {
        const user = yield User_1.default.findById(userId);
        const friends = (_b = (_a = user === null || user === void 0 ? void 0 : user.friends) === null || _a === void 0 ? void 0 : _a.toString().split(",")) !== null && _b !== void 0 ? _b : [];
        friends.push(userId);
        const searchPostQuery = {
            $or: [{ description: { $regex: search, $options: "i" } }],
        };
        const posts = yield Post_1.default.find(search ? searchPostQuery : {})
            .populate({
            path: "userId",
            select: "name location profileUrl photo",
        })
            .sort({ _id: -1 });
        // const friendsPosts = posts?.filter((post) => {
        //   return friends.includes(post?.userId?._id.toString());
        // });
        // const otherPosts = posts?.filter((post) => {
        //   !friends.includes(post?.userId._id.toString());
        // });
        // let postsRes = null;
        // if (friendsPosts?.length > 0) {
        //   postsRes = search ? friendsPosts : [...friendsPosts, ...otherPosts];
        // } else {
        //   postsRes = posts;
        // }
        res.status(200).json({ message: "Successfully", data: posts });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something wrong!" });
    }
});
exports.getPosts = getPosts;
const getPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const post = yield Post_1.default.findById(id).populate({
            path: "userId",
            select: "name location profileUrl photo",
        });
        res.status(200).json({ message: "Successfully", data: post });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something wrong!" });
    }
});
exports.getPost = getPost;
const getUserPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const posts = yield Post_1.default.find({ userId: id })
            .populate({
            path: "userId",
            select: "name location profileUrl photo",
        })
            .sort({ _id: -1 });
        res.status(200).json({ message: "Successfully", data: posts });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something wrong!" });
    }
});
exports.getUserPost = getUserPost;
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    try {
        const postComments = yield Comment_1.default.find({ postId })
            .populate({
            path: "userId",
            select: "name location photo ",
        })
            .populate({
            path: "replies.userId",
            select: "name location photo  ",
        })
            .sort({ _id: -1 });
        res.status(200).json({ message: "Successfully", data: postComments });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something wrong!" });
    }
});
exports.getComments = getComments;
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const { userId } = req.body.user;
    try {
        const post = yield Post_1.default.findById(postId);
        const index = post.likes.findIndex((pid) => pid === String(userId));
        if (index === -1) {
            post.likes.push(userId);
        }
        else {
            post.likes = post.likes.filter((e) => e !== String(userId));
        }
        const newPost = yield Post_1.default.findByIdAndUpdate(postId, post, {
            new: true,
        });
        res.status(200).json({ message: "Successfully", data: post });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something wrong!" });
    }
});
exports.likePost = likePost;
const likePostComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { commentId, replayId } = req.params;
    const { userId } = req.body.user;
    try {
        if (replayId === undefined || replayId === null || replayId === "false") {
            const comment = yield Comment_1.default.findById(commentId);
            const index = comment.likes.findIndex((cid) => cid === String(userId));
            if (index === -1) {
                comment.likes.push(userId);
            }
            else {
                comment.likes = comment.likes.filter((e) => e !== String(userId));
            }
            const updated = yield Comment_1.default.findByIdAndUpdate(commentId, comment, {
                new: true,
            });
            res.status(200).json({ message: "Successfully", data: updated });
        }
        else {
            const replaycomments = yield Comment_1.default.findOne({ _id: commentId }, {
                replies: {
                    $elemMatch: {
                        _id: replayId,
                    },
                },
            });
            const index = (_c = replaycomments === null || replaycomments === void 0 ? void 0 : replaycomments.replies[0]) === null || _c === void 0 ? void 0 : _c.likes.findIndex((i) => i === String(userId));
            if (index === -1) {
                replaycomments.replies[0].likes.push(userId);
            }
            else {
                replaycomments.replies[0].likes =
                    (_d = replaycomments.replies[0]) === null || _d === void 0 ? void 0 : _d.likes.filter((i) => i !== String(userId));
            }
            const result = yield Comment_1.default.updateOne({ _id: commentId, "replies._id": replayId }, {
                $set: {
                    "replies.$.likes": replaycomments.replies[0].likes,
                },
            }, { new: true });
            res.status(200).json(result);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something wrong!" });
    }
});
exports.likePostComment = likePostComment;
const commentPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, comment } = req.body;
    const { postId } = req.params;
    const { userId } = req.body.user;
    try {
        !comment && res.status(404).json({ message: "Commen is required" });
        const newComment = yield Comment_1.default.create({ from, comment, postId, userId });
        const post = yield Post_1.default.findById(postId);
        const updatedPost = yield Post_1.default.findByIdAndUpdate(postId, post, {
            new: true,
        });
        post.comments.push(newComment._id);
        yield post.save();
        res.status(200).json({ message: "Successfully!", data: post });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something wrong!" });
    }
});
exports.commentPost = commentPost;
const replyPostComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { from, comment, replyAt } = req.body;
    const { commentId } = req.params;
    const { userId } = req.body.user;
    try {
        !comment && res.status(404).json({ message: "Commen is required" });
        const commentInfo = yield Comment_1.default.findById(commentId);
        commentInfo.replies.push({
            comment,
            from,
            replyAt,
            userId,
            createdAt: Date.now(),
        });
        commentInfo.save();
        return res.status(200).json(commentInfo);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something wrong!" });
    }
});
exports.replyPostComment = replyPostComment;
const deleteReply = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId, replyId } = req.params;
    try {
        const comment = yield Comment_1.default.findById(commentId);
        comment.replies.filter((r) => String(r._id) !== String(replyId));
        // await comment.save();
        return res.status(200).json({ message: "Deleted reply successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something wrong!" });
    }
});
exports.deleteReply = deleteReply;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    try {
        yield Post_1.default.findByIdAndDelete(postId);
        return res.status(200).json({ message: "Post Deleted" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something wrong!" });
    }
});
exports.deletePost = deletePost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const { description, image } = req.body;
    try {
        const updatedPost = yield Post_1.default.findByIdAndUpdate(postId, {
            description,
            image,
        });
        return res.status(200).json({ message: "Post Updated", data: updatedPost });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something wrong!" });
    }
});
exports.updatePost = updatePost;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, commentId } = req.params;
    try {
        yield Comment_1.default.findByIdAndDelete(commentId);
        const post = yield Post_1.default.findById(postId);
        post.comments = post.comments.filter((e) => e !== String(commentId));
        yield post.save();
        return res.status(200).json({ message: "Comment Deleted" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something wrong!" });
    }
});
exports.deleteComment = deleteComment;
//# sourceMappingURL=posts.js.map