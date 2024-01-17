import { Video } from '../models/video.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';


const getAllVideos = asyncHandler(async (req, res) => {
  const {page = 1, limit = 10, query, sortBy, sortType, userId} = req.query;

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

  const videoFile = await Video.create({
    title,
    description,
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    owner: req.user?._id
  });

  const VideoUploaded = await Video.findById(videoFile._id);

  if (!VideoUploaded) throw new ApiError(500, 'Something went wrong while uploading the video');

  return res.status(201).json(
    new ApiResponse(201, VideoUploaded, "Video Uploaded Successfully")
  )
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) {
    throw new ApiError(400, 'Video id is missing');
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video file not found");
  }

  return res.status(201).json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!videoId) {
    throw new ApiError(400, 'Video id is missing');
  }
  if (!title && !description) {
    throw new ApiError(400, 'All fields are required');
  }

  const thumbnailLocalPath = req.file?.path;
  let thumbnail;
  if (thumbnailLocalPath) {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  }

  const video = await Video.findByIdAndUpdate(videoId, {
    $set: {
      title,
      description,
      thumbnail: thumbnail?.url
    }
  }, { new: true })

  return res.status(201).json(new ApiResponse(200, video, "Video Update successfully"));

})

const deleteVideo = asyncHandler(async(req, res) => {
  const {videoId} = req.params;

  if(!videoId){
    throw new ApiError(400, 'Video id is missing');
  }

  const video = await Video.findByIdAndDelete(videoId);

  if(!video){
    throw new ApiError(500, 'Error while deleting the video');
  }
  return res.status(201).json(new ApiResponse(200, video, 'Video removed successfully'));

})

const togglePublishStatus = asyncHandler(async(req, res)=>{
  const {videoId} = req.params;

  if(!videoId){
    throw new ApiError(400, 'Video id is missing');
  }

  const video = await Video.findById(videoId);
  if(!video){
    throw new ApiError(404, 'Video Not Found');
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res.status(201).json(new ApiResponse(200, {}, "Publish status is toggled"));
});


export { publishVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus };