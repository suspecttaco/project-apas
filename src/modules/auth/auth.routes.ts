import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

router.post('/supervisor/login', AuthController.loginSupervisor);
router.post('/director/login',   AuthController.loginDirector);

export default router;