import type { Request, Response } from 'express' 
import * as DocumentService from './Document.service.js'

// Creation Part 

export const CreateExitSlip = async (req: Request , res: Response) => {
    try {
        const newExitSlip = await DocumentService.CreateExitSlip( req.body );
        res.status(201).json(newExitSlip);
    } catch (error) {
        console.error(error);
        res.status(500).json({error , message :"failed to create exit slip"})
    }
}



export const CreateAbsenceAuth = async (req: Request , res: Response) => {
    try {
        const newAbsenceAuth = await DocumentService.CreateAbsenceAuth(req.body );
        res.status(201).json(newAbsenceAuth);
    } catch (error) {
        res.status(500).json({error:"failed to create Absence Auth"})
    }
}


export const CreateMissionOrder = async (req: Request , res: Response) => {
    try {
        const newMissionOrder = await DocumentService.CreateMissionOrder(req.body);
        res.status(201).json(newMissionOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"failed to create Mission Order"})
    }
}




// READ PART 

export const ReadAllDocuments = async (req: Request , res: Response) => {
    try {
        const Documents = await DocumentService.ReadAllDocuments(req.params.id) ; 
        res.status(201).json(Documents);
    } catch (error) {
        console.error(error);
        res.status(500).json({error, message:"failed to fetch All documents"})
    }
}

export const ReadAllDocumentByState = async (req: Request , res: Response) => {
    try {
        const Documents = await DocumentService.ReadAllDocumentByState(req.body) ; 
        res.status(201).json(Documents);
    } catch (error) {
        console.error(error);
        res.status(500).json({error , message :"failed to fetch All documents By State"});
    }
}

export const ReadDocumentById = async (req: Request , res: Response) => {
    try {
        const Document = await DocumentService.ReadDocumentById(req.body , req.params.id) ; 
        res.status(201).json(Document);
    } catch (error) {
        res.status(500).json({error:`failed to fetch document id : ${req.params.id}`})
        console.error(error);
    }
}


export const ReadAllDocumentByType = async (req: Request , res: Response) => {
    try {
        const Documents = await DocumentService.ReadAllDocumentByType(req.body) ; 
        res.status(201).json(Documents);
    } catch (error) {
        res.status(500).json({error:`failed to fetch All documents By type ${req.body.type}`})
        console.log(error);
    }   
}

export const ReadAllDocumentByStatusAndType = async (req: Request , res: Response) => {
    try {
        const Documents = await DocumentService.ReadAllDocumentByStatusAndType(req.body) ; 
        res.status(201).json(Documents);
    } catch (error) {
        res.status(500).json({error:`failed to fetch documents with status : ${req.body.status} , Type : ${req.body.type}`})
        console.log(error);
    }
}

export const ReadPendingDocumentsForManager = async (req: Request, res: Response) => {
  try {
    const Documents = await DocumentService.ReadPendingDocumentsForManager(req.body);
    res.status(200).json(Documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error, message: "failed to fetch pending documents for manager" });
  }
};

//UPDATE PART 

export const UpdateDocumentState = async (req: Request , res: Response) => {
    try {
        const Document = await DocumentService.UpdateDocumentState(req.body , req.params.id) ; 
        res.status(201).json(Document);
    } catch (error) {
        res.status(500).json({error:"failed to update state of this document"})
        console.log(error);
    }
}


export const UpdateWholeExitSlip = async (req: Request , res: Response) => {
    try {
        const ExitSlip = await DocumentService.UpdateWholeExitSlip(req.body , req.params.id) ; 
        res.status(201).json(ExitSlip);
    } catch (error) {
        res.status(500).json({error:"failed to update this ExitSlip Document"})
        console.log(error);
    }
}

export const UpdateWholeAbsenceAuth = async (req: Request , res: Response) => {
    try {
        const AbsenceAuth = await DocumentService.UpdateWholeAbsenceAuth(req.body , req.params.id) ; 
        res.status(201).json(AbsenceAuth);
    } catch (error) {
        res.status(500).json({error:"failed to update this AbsenceAuth Document"})
        console.log(error);
    }
}

export const UpdateWholeMissionOrder = async (req: Request , res: Response) => {
    try {
        const MissionOrder = await DocumentService.UpdateWholeMissionOrder(req.body , req.params.id) ; 
        res.status(201).json(MissionOrder);
    } catch (error) {
        res.status(500).json({error:"failed to update this MissionOrder Document"})
        console.log(error);
    }
}


//DELETE PART 

export const DeleteDocumentById = async (req: Request , res: Response) => {
    try {
        const deletedDocument = await DocumentService.DeleteDocumentById(req.params.id) ; 
        res.status(201).json(deletedDocument);
    } catch (error) {
        res.status(500).json({error:"failed to delete this Document"})
        console.log(error);
    }
}
