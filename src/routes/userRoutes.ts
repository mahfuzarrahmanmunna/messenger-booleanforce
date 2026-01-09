// src/routes/userRoutes.ts
import { Router } from 'express';
import { getUserController } from '../controllers/userController.js';

const router = Router();

router.get('/', getUserController.getUsers);
router.get('/:id', getUserController.getUserById);

export default router;