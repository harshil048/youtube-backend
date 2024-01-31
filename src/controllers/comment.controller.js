import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";

const addCommnet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video Id is invalid");
  }
  if (!content) {
    throw new ApiError(400, "Comment can't be empty");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const comment = await Comment.create({
    content,
    video: video?._id,
    owner: req.user?._id
  });

  if (!comment) {
    throw new ApiError(400, "Error while uploading comment");
  }

  return res.status(201).json(new ApiResponse(200, comment, "Comment added successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body

  if (!commentId) {
    throw new ApiError(400, "Invalid Comment Id");
  }

  const comment = await Comment.findByIdAndUpdate(commentId, {
    $set: {
      content
    }
  }, { new: true });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  return res.status(201).json(new ApiResponse(200, comment, "comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Invalid comment id");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId, { comment: commentId });
  if (!deletedComment) {
    throw new ApiError(500, "Error while deleteing comment");
  }

  return res.status(201).json(new ApiResponse(200, {}, "Comment deleted successfully"));

})

export { addCommnet, updateComment, deleteComment };