import express from 'express';
import * as statusController from '../controllers/statusController.js';

const router = express.Router();

router.get('/', statusController.getStatus);

export default router;
