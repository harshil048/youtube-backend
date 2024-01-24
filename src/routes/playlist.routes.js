import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route('/').post(createPlaylist);

router.route('/add/:videoId/:playlistId').patch(addVideoToPlaylist);

router.route('/user/:userId').get(getUserPlaylists);

router.route('/:playlistId').get(getPlaylistById).delete(deletePlaylist).patch(updatePlaylist);

router.route('/remove/:playlistId/:videoId').patch(removeVideoFromPlaylist);
export default router;
