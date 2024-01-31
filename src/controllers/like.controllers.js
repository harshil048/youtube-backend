import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Like } from '../models/like.model.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from '../models/video.model.js';
import { Comment } from '../models/comment.model.js';
import { Tweet } from '../models/tweet.model.js';
import { Types } from 'mongoose';

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!videoId) {
    throw new ApiError(400, "Video-Id is invalid");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }

  const likeStatus = await Like.findOne({ video: videoId });

  let like, unlike;

  if (likeStatus) {
    unlike = await Like.deleteOne({ video: videoId });
  }
  else {
    like = await Like.create({
      video,
      likedBy: userId
    })
  }

  return res.status(201).json(new ApiResponse(200, {}, `Video ${unlike ? "unlike" : "like"} successfully`));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  if (!commentId) {
    throw new ApiError(400, "Comment-Id is invalid");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment Not Found");
  }

  const commentStatus = await Like.findOne({ comment: commentId });

  let like, unlike;

  if (likeStatus) {
    unlike = await Like.deleteOne({ comment: commentId });
  }
  else {
    like = await Like.create({
      comment,
      likedBy: userId
    })
  }

  return res.status(201).json(new ApiResponse(200, {}, `Comment ${unlike ? "unlike" : "like"} successfully`));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;

  if (!tweetId) {
    throw new ApiError(400, "Tweet-Id is invalid");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet Not Found");
  }

  const tweetStatus = await Tweet.findOne({ tweet: tweetId });

  let like, unlike;

  if (tweetStatus) {
    unlike = await Like.deleteOne({ tweet: tweetId });
  }
  else {
    like = await Like.create({
      tweet,
      likedBy: userId
    })
  }

  return res.status(201).json(new ApiResponse(200, {}, `Tweet ${unlike ? "unlike" : "like"} successfully`));
})

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "invalid user id");
  }

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
        pipeline:[
          {
            $project:{
              video: 1,
              owner: 1,
            }
          }
        ]
      }
    },
    {
      $addFields: {
        videoDetails: {
          $first: "$videoDetails",
        }
      }
    }
  ]);

  if (likedVideos.length === 0) {
    return res.status(201).json(new ApiResponse(200, {}, "No liked video found"));
  }

  return res.status(201).json(new ApiResponse(200, likedVideos, "liked video fetched successfully"));
})
export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };