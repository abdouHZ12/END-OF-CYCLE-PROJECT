import express from 'express'
import { Router } from 'express'
import * as DocumentController from '../modules/documents/Document.controller.js'

const router : Router = Router() ; 





router.post("/documents/ExitSlip" ,DocumentController.CreateExitSlip);
router.post("/documents/AbsenceAuth" ,DocumentController.CreateAbsenceAuth);
router.post("/documents/MissionOrder" ,DocumentController.CreateMissionOrder);


router.get("/documents/dAll",DocumentController.ReadAllDocuments);
router.get("/documents/AllByState",DocumentController.ReadAllDocumentByState);
router.get("/document/:id",DocumentController.ReadDocumentById);
router.get("/documents/AllByType",DocumentController.ReadAllDocumentByType);
router.get("/documents/AllByTypeAndType",DocumentController.ReadAllDocumentByStatusAndType);


router.put("/document/State/:id",DocumentController.UpdateWholeExitSlip);
router.put("/document/ExitSlip/:id",DocumentController.UpdateWholeExitSlip);
router.put("/document/AbsenceAuth/:id",DocumentController.UpdateWholeAbsenceAuth);
router.put("/document/MissionOrder/:id",DocumentController.UpdateWholeMissionOrder);

router.delete("/document/:id",DocumentController.DeleteDocumentById);



export default router;
