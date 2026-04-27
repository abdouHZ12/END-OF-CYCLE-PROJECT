import { Router } from 'express';
import * as documentController from '../modules/documents/Document.controller.js';
import * as adminController from '../modules/admin/admin.controller.js';

const router = Router();

router.get('/employee/:employeeId/document/:id', documentController.ReadDocumentById);
router.delete('/employee/:employeeId/document/:id', documentController.DeleteDocumentById);

router.get('/employees/workers', adminController.getWorkers);
router.get('/employees/:employeeId/mission-orders', adminController.getWorkerMissions);

export default router;
