import { Request, Response } from "express";
import Post from "../models/Post";
import User from "../models/User";
import Comment from "../models/Comment";
import { replyType } from "../types/types";

export const createPost = async (req: Request, res: Response) => {
  const { userId } = req.body.user;
  const { image, description } = req.body;

  try {
    !description && res.json({ message: "Description required" });

    const newPost = await Post.create({
      userId,
      image,
      description,
    });

    const user = await User.findById(userId);
    user.posts.push(newPost._id);
    await user.save();

    res
      .status(201)
      .json({ message: "Posts Added successfully", data: newPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetch Posts" });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  const { userId } = req.body.user;
  const { search } = req.body;

  try {
    const user = await User.findById(userId);
    const friends = user?.friends?.toString().split(",") ?? [];
    friends.push(userId);

    const searchPostQuery = {
      $or: [{ description: { $regex: search, $options: "i" } }],
    };

    const posts = await Post.find(search ? searchPostQuery : {})
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something wrong!" });
  }
};
export const getPost = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id).populate({
      path: "userId",
      select: "name location profileUrl photo",
    });

    res.status(200).json({ message: "Successfully", data: post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something wrong!" });
  }
};

export const getUserPost = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const posts = await Post.find({ userId: id })
      .populate({
        path: "userId",
        select: "name location profileUrl photo",
      })
      .sort({ _id: -1 });
    res.status(200).json({ message: "Successfully", data: posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something wrong!" });
  }
};
export const getComments = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const postComments = await Comment.find({ postId })
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something wrong!" });
  }
};
export const likePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { userId } = req.body.user;

  try {
    const post = await Post.findById(postId);
    const index = post.likes.findIndex((pid) => pid === String(userId));
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter((e) => e !== String(userId));
    }

    const newPost = await Post.findByIdAndUpdate(postId, post, {
      new: true,
    });

    res.status(200).json({ message: "Successfully", data: post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something wrong!" });
  }
};
export const likePostComment = async (req: Request, res: Response) => {
  const { commentId, replayId } = req.params;
  const { userId } = req.body.user;

  try {
    if (replayId === undefined || replayId === null || replayId === "false") {
      const comment = await Comment.findById(commentId);
      const index = comment.likes.findIndex((cid) => cid === String(userId));
      if (index === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes = comment.likes.filter((e) => e !== String(userId));
      }

      const updated = await Comment.findByIdAndUpdate(commentId, comment, {
        new: true,
      });
      res.status(200).json({ message: "Successfully", data: updated });
    } else {
      const replaycomments = await Comment.findOne(
        { _id: commentId },
        {
          replies: {
            $elemMatch: {
              _id: replayId,
            },
          },
        }
      );
      const index = replaycomments?.replies[0]?.likes.findIndex(
        (i) => i === String(userId)
      );
      if (index === -1) {
        replaycomments.replies[0].likes.push(userId);
      } else {
        replaycomments.replies[0].likes =
          replaycomments.replies[0]?.likes.filter((i) => i !== String(userId));
      }

      const result = await Comment.updateOne(
        { _id: commentId, "replies._id": replayId },
        {
          $set: {
            "replies.$.likes": replaycomments.replies[0].likes,
          },
        },
        { new: true }
      );
      res.status(200).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something wrong!" });
  }
};
export const commentPost = async (req: Request, res: Response) => {
  const { from, comment } = req.body;
  const { postId } = req.params;
  const { userId } = req.body.user;

  try {
    !comment && res.status(404).json({ message: "Commen is required" });
    const newComment = await Comment.create({ from, comment, postId, userId });
    const post = await Post.findById(postId);
    const updatedPost = await Post.findByIdAndUpdate(postId, post, {
      new: true,
    });
    post.comments.push(newComment._id);
    await post.save();
    res.status(200).json({ message: "Successfully!", data: post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something wrong!" });
  }
};
export const replyPostComment = async (req: Request, res: Response) => {
  const { from, comment, replyAt } = req.body;
  const { commentId } = req.params;
  const { userId } = req.body.user;

  try {
    !comment && res.status(404).json({ message: "Commen is required" });
    const commentInfo = await Comment.findById(commentId);
    commentInfo.replies.push({
      comment,
      from,
      replyAt,
      userId,
      createdAt: Date.now(),
    });
    commentInfo.save();
    return res.status(200).json(commentInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something wrong!" });
  }
};

export const deleteReply = async (req: Request, res: Response) => {
  const { commentId, replyId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    comment.replies.filter((r: any) => String(r._id) !== String(replyId));
    // await comment.save();

    return res.status(200).json({ message: "Deleted reply successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something wrong!" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    await Post.findByIdAndDelete(postId);
    return res.status(200).json({ message: "Post Deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something wrong!" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { description, image } = req.body;
  try {
    const updatedPost = await Post.findByIdAndUpdate(postId, {
      description,
      image,
    });
    return res.status(200).json({ message: "Post Updated", data: updatedPost });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something wrong!" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const { postId, commentId } = req.params;

  try {
    await Comment.findByIdAndDelete(commentId);
    const post = await Post.findById(postId);
    post.comments = post.comments.filter((e: any) => e !== String(commentId));
    await post.save();
    return res.status(200).json({ message: "Comment Deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something wrong!" });
  }
};
