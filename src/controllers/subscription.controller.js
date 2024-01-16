import { Types } from "mongoose";
import { Subscription } from "../models/subscrption.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, 'Channel id is invalid');
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, 'Channel not found');
  }

  const subscription = await Subscription.aggregate([
    {
      $match: {
        channel: new Types.ObjectId(channelId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberList",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        subscriberList: {
          $first: "$subscriberList"
        }
      }
    }
  ]);

  return res.status(201).json(new ApiResponse(200, { subscriberList: subscription[0]?.subscriberList || [] }, "Subscribers are fetched successfully"));
})

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?._id;

  if (!channelId) {
    throw new ApiError(400, 'Invalid channel id');
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, 'Channel not found');
  }

  if (channelId.toString() === userId.toString()) {
    throw new ApiError(400, "You can not subscribe your channel");
  }

  const subscription = await Subscription.findOne({ subscriber: userId, channel: channelId });

  let unsubscribe;
  let subscribe;

  if (!subscription) {
    subscribe = await Subscription.create({
      subscriber: userId, // who is subscriber
      channel: channelId // subscribed channel
    })
  }
  else {
    unsubscribe = await Subscription.deleteOne({
      subscriber: userId,
      channel: channelId
    })
  }

  return res.status(201).json(new ApiResponse(200, {}, `${unsubscribe ? "unsubscribe" : "subscribe"} successfully`))
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, 'Invalid subscriber ID');
  }

  const channel = await User.findById(subscriberId);

  if (!channel) {
    throw new ApiError(404, 'Channel not found');
  }

  const subscription = await Subscription.aggregate([
    {
      $match: {
        subscriber: new Types.ObjectId(subscriberId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannelList",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        subscribedChannelList: {
          $first: "$subscribedChannelList"
        }
      }
    }
  ])

  return res.status(200).json(new ApiResponse(201, { subscribedChannelList: subscription[0]?.subscribedChannelList || [] }, "subscribed Channel List fetched successfully"));
})

export { getUserChannelSubscribers, toggleSubscription, getSubscribedChannels };