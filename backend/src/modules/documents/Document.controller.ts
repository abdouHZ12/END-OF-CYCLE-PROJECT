import type { Request, Response } from 'express' 
import * as DocumentService from './Document.js'
import { httpError } from '../../common/errors.js';

// Creation Part 

export const CreateExitSlip = async (req: Request , res: Response) => {
    try {
        const newExitSlip = await DocumentService.CreateExitSlip( req.body );
        res.status(201).json(newExitSlip);
    } catch (error) {
        console.error(error);
        const status = (error as any)?.status ?? 500;
        res.status(status).json({ error, message: (error as any)?.message ?? "failed to create exit slip" })
    }
}



export const CreateAbsenceAuth = async (req: Request , res: Response) => {
    try {
        const newAbsenceAuth = await DocumentService.CreateAbsenceAuth(req.body );
        res.status(201).json(newAbsenceAuth);
    } catch (error) {
        const status = (error as any)?.status ?? 500;
        res.status(status).json({ error, message: (error as any)?.message ?? "failed to create Absence Auth" })
    }
}


export const CreateMissionOrder = async (req: Request , res: Response) => {
    try {
        const newMissionOrder = await DocumentService.CreateMissionOrder(req.body);
        res.status(201).json(newMissionOrder);
    } catch (error) {
        console.error(error);
        const status = (error as any)?.status ?? 500;
        res.status(status).json({ error, message: (error as any)?.message ?? "failed to create Mission Order" })
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
        const Document = await DocumentService.ReadDocumentById(req.body , req.params.id , req.params.employeeId) ; 
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

export const ReadEmployeesHistoryForManager = async (req: Request, res: Response) => {
  try {
    const result = await DocumentService.ReadEmployeesHistoryForManager(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "failed to fetch employees history",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const ReadManagerDashboardStats = async (req: Request, res: Response) => {
  try {
    const result = await DocumentService.ReadManagerDashboardStats(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "failed to fetch dashboard stats",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// controller
export const GetAllSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await DocumentService.GetAllSessions();
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error });
  }
};



//UPDATE PART 

export const UpdateDocumentState = async (req: Request, res: Response) => {
  try {
    const Document = await DocumentService.UpdateDocumentState(req.body, req.params.id);
    res.status(201).json(Document);
  } catch (error) {
    console.error("UpdateDocumentState error:", error); // ← check your terminal
    res.status(500).json({
      error: "failed to update state of this document",
      message: error instanceof Error ? error.message : String(error), // ← now visible in browser too
    });
  }
};


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
        const deletedDocument = await DocumentService.DeleteDocumentById(req.params.id , req.params.employeeId) ; 
        res.status(201).json(deletedDocument);
    } catch (error) {
        res.status(500).json({error , message: "failed to delete this Document"})
        console.log(error);
    }
}


export const GeneratePdf = async (req: Request , res: Response) => {
    try {
        const pdfBuffer = await DocumentService.GeneratePdf(req.params.id) ;
        const filename  = `document-${req.params.id}.pdf`
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=${filename}`,
            "Content-Length": pdfBuffer.length
        });

        res.status(201).send(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({error , message:"failed to generate pdf"})
    }  
}

    
export const ScanDocument = async (req: Request, res: Response) => {
  try {
    const agentDeviceId = req.headers['x-agent-id'];

    if (!agentDeviceId || typeof agentDeviceId !== 'string') {
      throw httpError(400, 'X-Agent-ID header is required');
    }

    const result = await DocumentService.ScanDocument(
      req.body.token,
      agentDeviceId
    ) as { Document: any; message: string };

    res.status(201).json({
      Document: result.Document,
      message: result.message,
    });

  } catch (error) {
    console.error(error);

    const status = (error as any)?.status ?? 500;

    res.status(status).json({
      error,
      message: (error as any)?.message ?? "failed to scan document",
    });
  }
};


export const GetSuggestion = async (req: Request, res: Response) => {
    try {
        const result = await DocumentService.GetSuggestion(req.params.id as string);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error, message: "failed to get suggestion for this document" });
    }
};