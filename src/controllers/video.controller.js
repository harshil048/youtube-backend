import { Video } from '../models/video.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const getAllVideos = asyncHandler(async (req, res) => {

});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All fields are requried');
  }
  const videoLocalPath = req.files?.videoFile[0]?.path;
  
  if (!videoLocalPath) {
    throw new ApiError(400, 'Please select video file');
  }

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, 'Please select thumbnail');
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!video) {
    throw new ApiError(400, 'Video file is required');
  }
  if (!thumbnail) {
    throw new ApiError(400, 'thumbnail is required');
  }

  return res.status(201).json(
    new ApiResponse(201, {title, description, video, thumbnail}, "Video Uploaded Successfully")
  )
})

export {publishVideo};