import { Router } from 'express';
import * as adminController from '../modules/admin/admin.controller.js';

const router: Router = Router();

router.get('/employees',                      adminController.getAllEmployees);
router.get('/employees/:id',                  adminController.getEmployeeById);
router.post('/employees',                     adminController.registerEmployee);
router.put('/employees/:id',                  adminController.updateEmployee);
router.delete('/employees/:id',               adminController.deleteEmployee);

router.get('/roles',                          adminController.getAllRoles);
router.post('/employees/:id/roles',           adminController.assignRole);
router.delete('/employees/:id/roles/:roleId', adminController.revokeRole);

router.get('/structures',                     adminController.getAllStructures);
router.post('/structures',                    adminController.createStructure);
router.put('/structures/:id',                 adminController.updateStructure);
router.delete('/structures/:id',              adminController.deleteStructure);

export default router;