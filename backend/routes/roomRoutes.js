import express from 'express';
import { createRoom, checkRoom, endRoom, getRoomInfo } from '../controllers/roomController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', authenticateToken, createRoom);
router.get('/:roomId/check', authenticateToken, checkRoom);
router.post('/:roomId/end', authenticateToken, endRoom);
router.get('/:roomId', authenticateToken, getRoomInfo);

export default router;
