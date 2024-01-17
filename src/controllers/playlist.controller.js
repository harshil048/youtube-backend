import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "All fileds are required");
  }

  const existedPlaylist = await Playlist.findOne(
    {
      $and: [{name},{description}]
    }
  )

  if(existedPlaylist){
    throw new ApiError(409, "This playlist is already exits");
  }
  
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });

  if (!playlist) {
    throw new ApiError(500, "something went wrong while creating a playlist");
  }

  return res.status(201).json(new ApiResponse(200, { playlist }, "Playlist created successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params

  if (!playlistId || !videoId) {
    throw new ApiError(400, "Playlist Id or Video Id is invalid");
  }

  const video = await Video.findById(videoId);

  const playlist = await Playlist.findById(playlistId);
  playlist.videos.push(video);
  await playlist.save({ validateBeforeSave: false });

  if (!playlist) {
    throw new ApiError(500, 'Falied to insert video into playlist');
  }

  return res.status(201).json(new ApiResponse(200, { playlist }, "Video"))
})

export { createPlaylist, addVideoToPlaylist };