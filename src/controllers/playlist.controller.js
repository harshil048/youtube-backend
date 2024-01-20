import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Types } from "mongoose";


const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "All fileds are required");
  }

  const existedPlaylist = await Playlist.findOne(
    {
      $and: [{ name }, { description }]
    }
  )

  if (existedPlaylist) {
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

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, 'Invalid user id');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const playlists = await Playlist.find({ owner: userId });

  if (!playlists || playlists?.length === 0) {
    return res.status(201).json(new ApiResponse(200, {}, "No Playlist Available"));
  }
  else {
    return res.status(201).json(new ApiResponse(200, { playlists }, "Playlist fetched successfully"));
  }

})

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res.status(201).json(new ApiResponse(200, { playlist }, "Playlist fetched successfully"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "All fileds are requied");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  const videoIndex = await playlist.videos.indexOf(videoId);
  if (videoIndex === -1) {
    throw new ApiError(404, "Video not found");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
    $pull: {
      videos: videoId
    }
  }, { new: true });

  if (!updatedPlaylist) {
    throw new ApiError(500, "Something went wrong while removing playlist");
  }

  return res.status(201).json(new ApiResponse(200, { updatedPlaylist }, "Video Removed Successfully"));
})

export { createPlaylist, addVideoToPlaylist, getUserPlaylists, getPlaylistById, removeVideoFromPlaylist };