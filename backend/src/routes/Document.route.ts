import express from 'express'
import { Router } from 'express'
import * as DocumentController from '../modules/documents/Document.controller.js'

const router : Router = Router() ; 





router.post("/documents/ExitSlip" ,DocumentController.CreateExitSlip);
router.post("/documents/AbsenceAuth" ,DocumentController.CreateAbsenceAuth);
router.post("/documents/MissionOrder" ,DocumentController.CreateMissionOrder);


router.get("/dAll/documents/:id",DocumentController.ReadAllDocuments);
router.get("/documents/AllByState",DocumentController.ReadAllDocumentByState);
router.get("/document/:id",DocumentController.ReadDocumentById);
router.get("/documents/AllByType",DocumentController.ReadAllDocumentByType);
router.get("/documents/AllByTypeAndStatus",DocumentController.ReadAllDocumentByStatusAndType);
router.post("/manager/pending-documents", DocumentController.ReadPendingDocumentsForManager);
router.post("/manager/employees-history", DocumentController.ReadEmployeesHistoryForManager);

router.put("/document/State/:id",DocumentController.UpdateDocumentState);
router.put("/document/ExitSlip/:id",DocumentController.UpdateWholeExitSlip);
router.put("/document/AbsenceAuth/:id",DocumentController.UpdateWholeAbsenceAuth);
router.put("/document/MissionOrder/:id",DocumentController.UpdateWholeMissionOrder);

router.delete("/document/:id",DocumentController.DeleteDocumentById);



export default router;
