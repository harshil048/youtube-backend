import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addCommnet, deleteComment, updateComment } from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT);

router.route('/:videoId').post(addCommnet);
router.route('/c/:commentId').patch(updateComment).delete(deleteComment);


export default router;
