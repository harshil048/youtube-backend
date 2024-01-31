import { Router } from "express";
import { verifyJWT} from '../middlewares/auth.middleware.js';
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controllers.js";

const router = Router();
router.use(verifyJWT);

router.route('/toggle/v/:videoId').post(toggleVideoLike);
router.route('/toggle/v/:tweetId').post(toggleTweetLike);
router.route('/toggle/v/:commentId').post(toggleCommentLike);
router.route('/').get(getLikedVideos);



export default router;