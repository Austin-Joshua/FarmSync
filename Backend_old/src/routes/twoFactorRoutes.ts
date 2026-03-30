import { Router } from 'express';
import {
  setup2FA,
  verifyAndEnable2FA,
  verify2FAToken,
  disable2FA,
  regenerateBackupCodes,
  twoFactorValidation,
} from '../controllers/twoFactorController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

router.get('/setup', setup2FA);
router.post('/verify-setup', validate(twoFactorValidation), verifyAndEnable2FA);
router.post('/verify', validate(twoFactorValidation), verify2FAToken);
router.post('/disable', disable2FA);
router.get('/backup-codes', regenerateBackupCodes);

export default router;
