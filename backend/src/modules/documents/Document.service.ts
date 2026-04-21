import { parse } from 'node:path';
import { prisma } from '../../lib/prisma.js'
import puppeteer , {Browser} from 'puppeteer' ;
import { generateToken } from '../../lib/Aid.js';
import QRCode from 'qrcode' ;

//Creation Part
// FOR NOW I AM RETREIVING ALL DATA FROM REQ.BODY

export const CreateExitSlip = async (data : any ) => {
    const {Qrcode , Type , EmployeeId,  exitTime , returnTime , gate} = data ; 
    const ExitSlip = await prisma.document.create({
        data : {
            qrCode: Qrcode ,
            type : Type , 
            issuedById : EmployeeId , 
            exitSlip : {
                create : {
                        exitTime , 
                        returnTime ,
                        gate ,
                }
            }
        } 
})
    return ExitSlip ; 
}

export const CreateAbsenceAuth = async (data : any ) =>{
    const {Qrcode , Type , EmployeeId , startDate , endDate , reason}  = data ;
    const AbsenceAuth = prisma.document.create({
        data : { 
            qrCode: Qrcode ,
            type : Type , 
            issuedById : EmployeeId , 
            absenceAuth : {
                create : { 
                        startDate , 
                        endDate , 
                        reason , 
                }
            }
        }
    }) 
    return  AbsenceAuth ; 
}



export const CreateMissionOrder = async (data : any ) => {
    const {Qrcode , Type , EmployeeId , destination , duration , purpose , travelMethod } = data ;
    const MissionOrder = prisma.document.create({
        data : { 
            qrCode: Qrcode ,
            type : Type , 
            issuedById : EmployeeId , 
            missionOrder : {
                create : { 
                        travelMethod ,
                        destination ,
                        duration , 
                        purpose 
                }
            }
        }
    })  
    return MissionOrder ; 
}


//Read Part 


// all THESE READS CONCERN ONE EMPLOYEE ONLY 


export const ReadAllDocuments = async (id :any) => {
    const DocumentId = parseInt(id) ;
    const EmployeeId = DocumentId ; 
    const Documents = await prisma.document.findMany({
        where : {
            issuedById : EmployeeId
        } ,
        include : {
            missionOrder  : true ,
            absenceAuth : true , 
            exitSlip : true,
            decisionMadeBy: {
                select: { id: true, name: true, username: true },
            },
         }
    })
    return Documents ; 
}

export const ReadAllDocumentByState = async (data : any ) => {
    const { state , EmployeeId } = data ; 
    const Documents = await prisma.document.findMany({
        where : {
            issuedById : EmployeeId , 
            status : state
    } , 
        include : {
            missionOrder  : true ,
            absenceAuth : true , 
            exitSlip : true,
            decisionMadeBy: {
                select: { id: true, name: true, username: true },
            },
         }
    })
    return Documents ; 
}


export const ReadDocumentById = async (data : any , id : any , employeeId : any ) => {
    const DocumentId = parseInt(id) ; 
    const  EmployeeId  = parseInt(employeeId) ; 
    const Document = await prisma.document.findUnique({
        where : {
            issuedById : EmployeeId ,
            id : DocumentId   
        } , 
        include : {
            missionOrder  : true ,
            absenceAuth : true , 
            exitSlip : true,
            decisionMadeBy: {
                select: { id: true, name: true, username: true },
            },
         }
    })
    return Document ; 
}


export const ReadAllDocumentByType = async (data : any ) => {
    const { Type , EmployeeId } = data ; 
    const Documents = await prisma.document.findMany({
        where : {
            issuedById : EmployeeId , 
            type : Type
        } ,
        include : {
            missionOrder  : true ,
            absenceAuth : true , 
            exitSlip : true,
            decisionMadeBy: {
                select: { id: true, name: true, username: true },
            },
         }
    
    })
    return Documents ; 
}



export const ReadAllDocumentByStatusAndType = async (data : any ) => {
    const { state , Type , EmployeeId } = data ; 
    const Documents = await prisma.document.findMany({
        where : {
            issuedById : EmployeeId , 
            type : Type,
            status : state
    } ,
        include : {
            missionOrder  : true ,
            absenceAuth : true , 
            exitSlip : true,
            decisionMadeBy: {
                select: { id: true, name: true, username: true },
            },
         }
    })
    return Documents ; 
}

export const ReadPendingDocumentsForManager = async (data: any) => {
  const { ManagerId } = data;

  const manager = await prisma.employee.findUnique({
    where: { id: ManagerId },
    select: { structureId: true },
  });

  if (!manager) throw new Error("Manager not found");

  const Documents = await prisma.document.findMany({
    where: {
      status: "PENDING",
      issuedById: { not: ManagerId }, 
      employee: {
        structureId: manager.structureId, 
      },
    },
    include: {
      missionOrder: true,
      absenceAuth: true,
      exitSlip: true,
      employee: {
        select: { id: true, name: true, username: true },
      },
    },
  });

  return Documents;
};

export const ReadEmployeesHistoryForManager = async (data: any) => {
  const { ManagerId } = data;

  const manager = await prisma.employee.findUnique({
    where: { id: ManagerId },
    select: { structureId: true },
  });

  if (!manager) throw new Error("Manager not found");

  const employees = await prisma.employee.findMany({
    where: {
      structureId: manager.structureId,
      id: { not: ManagerId }, // exclude manager himself
    },
    select: {
      id: true,
      name: true,
      username: true,
      issuedDocuments: {
        include: {
          missionOrder: true,
          absenceAuth: true,
          exitSlip: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return employees;
};

export const ReadManagerDashboardStats = async (data: any) => {
  const { ManagerId } = data;

  const manager = await prisma.employee.findUnique({
    where: { id: ManagerId },
    select: { structureId: true },
  });

  if (!manager) throw new Error("Manager not found");

  const teamDocs = await prisma.document.findMany({
    where: {
      issuedById: { not: ManagerId },
      employee: { structureId: manager.structureId },
    },
    include: {
      missionOrder: true,
      absenceAuth: true,
      exitSlip: true,
      employee: {
        select: { id: true, name: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const total    = teamDocs.length;
  const pending  = teamDocs.filter((d) => d.status === "PENDING").length;
  const approved = teamDocs.filter((d) => d.status === "APPROVED").length;
  const rejected = teamDocs.filter((d) => d.status === "REJECTED").length;
  const recentDocuments = teamDocs.slice(0, 5);

  return { total, pending, approved, rejected, recentDocuments };
};

// Update 

// Disclaimer : 
 // i dont know how to deal with QR code case 
 // and how and when it's gonna be updated will be left for later 


export const UpdateDocumentState = async (data : any , id : any ) => { 
    const DocumentId = parseInt(id) ; 
    const IssueDate : Date = new Date() ;
    const { state, ManagerId, managerComment, comment } = data;
    const rawComment = typeof managerComment === "string" ? managerComment : typeof comment === "string" ? comment : undefined;
    const normalizedComment = rawComment?.trim() ? rawComment.trim() : null;

    if (state === "APPROVED" ) {
        const token = generateToken();
        await prisma.document.update({
            where: { id: DocumentId },
            data: {
                qrCode: token,
            },
        });
    }
    const document = await prisma.document.update({
        where : { 
            id : DocumentId 
        } , 
        data: {
            authIssuedAt: IssueDate,
            status: state,
            decisionMadeBy: {
                connect: { id: ManagerId }  
            },
            managerComment: normalizedComment,
        } as any
    })
    return document ;
}

// i need to think of how i can redirect each type specefic change to it's specefic function and where 
// => i will implement it 


export const UpdateWholeExitSlip = async (data : any , id : any) =>{
    const DocumentId = parseInt(id) ; 
    const {Qrcode , Type ,  exitTime , returnTime , gate} = data ; 
    const ExitSlip = prisma.document.update({
        where : {
            id: DocumentId
        } ,
        data : { 
            qrCode: Qrcode ,
            type : Type , 
            exitSlip : {
                update : { 
                        exitTime , 
                        returnTime , 
                        gate
                }
            }
        }
    }) 
    return  ExitSlip ; 

}

export const UpdateWholeAbsenceAuth = async (data : any , id : any) =>{
    const DocumentId = parseInt(id) ; 
    const {Qrcode , Type , startDate , endDate , reason}  = data ;
    const AbsenceAuth = prisma.document.update({
        where : {
            id: DocumentId
        } ,
        data : { 
            qrCode: Qrcode ,
            type : Type , 
            absenceAuth : {
                update : { 
                        startDate , 
                        endDate , 
                        reason , 
                }
            }
        }
    }) 
    return  AbsenceAuth ; 
}

export const UpdateWholeMissionOrder = async (data : any , id : any) =>{
    const DocumentId = parseInt(id) ; 
    const {Qrcode , Type , destination , duration , purpose , travelMethod } = data ;
    const MissionOrder = prisma.document.update({
        where : {
            id: DocumentId
        } ,
        data : { 

            qrCode: Qrcode ,
            type : Type , 
            missionOrder : {
                update : { 
                        travelMethod ,
                        destination ,
                        duration , 
                        purpose 
                }
            }
        }
    }) 
    return  MissionOrder ; 
}

 // i dont have any other ideas about this update part 
 // suspended unitl further notice 


 // DELETE PART 

export const DeleteDocumentById = async (data : any  , employeeId : any) => {
    const DocumentId = parseInt(data) ; 
    const EmployeeId = parseInt(employeeId) ;
    const deletedDocument = await prisma.document.delete({
        where : { id : DocumentId, issuedById: EmployeeId }
    })
    return deletedDocument ;
}


let browser : Browser ;

export const initBrowser = async () =>{
    if(!browser){
        browser = await puppeteer.launch({
            headless : true ,
            executablePath: "/usr/bin/google-chrome",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
}



export const GeneratePdf = async ( id : any) => {
    const DocumentId = parseInt(id) ;
    const Document = await prisma.document.findUnique({
        where : { id : DocumentId } ,
        include : {
            missionOrder  : true ,
            absenceAuth : true , 
            exitSlip : true,
            decisionMadeBy: {
                select: { id: true, name: true, username: true },
            },
         }
    })
    if(!Document) throw new Error("Document not found") ;
    
    const url = `http://192.168.100.3:3000/scan?token=${Document.qrCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(url);

    const html = `<!DOCTYPE html>
    <html>
        <head>
            <style>
            body {
                font-family: Arial;
                padding: 40px;
            }
            .container {
                border: 1px solid #000;
                padding: 20px;
            }
            .title {
                text-align: center;
                font-size: 24px;
                font-weight: bold;
            }
            .qr {
                margin-top: 30px;
                text-align: center;
            }
            .content {
                display: flex;
                gap: 24px;
                align-items: flex-start;
                margin-top: 24px;
            }

            .info {
                flex: 1;
            }
            </style>
        </head>

        <body>
            <div class="container">
                <div class="title">Approved Document</div>

                <div class="content">
                    <div class="info">
                        <p><strong>User:</strong> ${Document?.id}</p>
                        <p><strong>Type:</strong> ${Document?.type}</p>
                        <p><strong>Date:</strong> ${new Date(Document.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div class="qr">
                            <img src="${qrCodeDataUrl}" width="150" height="150" />
                            <p>Scan to verify</p>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    </html>`;

    if(!browser) {
        throw new Error("Browser not initialized. Call initBrowser() first.");
    }
    const page = await browser.newPage();
try{
    await page.setContent(html , {waitUntil:"load"});

    const pdfBuffer = await page.pdf({
        format:"A4",
        printBackground: true
    });

    return pdfBuffer ;
} finally{
    await page.close();
}    
}



export const ScanDocument = async (token : any , Employeeid : any) => {
    const EmployeeId = parseInt(Employeeid) ;
    const Document = await prisma.document.findUnique({
        where : { qrCode : token } ,
        include : {
            missionOrder  : true ,
            absenceAuth : true , 
            exitSlip : true,
            leaveSession : true ,
            decisionMadeBy: {
                select: { id: true, name: true, username: true },
            },
         }
    })
    if(!Document) throw new Error("Invalid QR code") ;
    
    if(Document.issuedById !==EmployeeId) {
        throw new Error("Unauthorized access to this document") ;
    }
    let message = "" ;
    const now = new Date() ;
    let session = await prisma.leaveSession.findUnique({
        where : { documentId : Document.id }
    });
    if(!session){
        session = await prisma.leaveSession.create({
            data : {
                documentId :    Document.id ,
                status :        "OUT",
                employeeId :    EmployeeId,
                leaveTime  :    now,
            }
        })

    const refreshedDocument = await prisma.document.findUnique({
        where : { id : Document.id } ,
        include : {
            missionOrder  : true ,
            absenceAuth : true , 
            exitSlip : true,
            leaveSession : true ,
            decisionMadeBy: {
                select: { id: true, name: true, username: true },
            },
         }
    })
    return {message: "QR code Valid , leave time created", Document : refreshedDocument};
    }

    if(session && !session.returnTime){

        if (Document.type === "EXIT_SLIP"){
            const hour = now.getHours() ;
            if(hour >= 16){
                await prisma.leaveSession.update({
                    where : { id : session.id } ,
                    data : {
                        status : "NOT_RETURNED"
                    }
                })
                const refreshedDocument = await prisma.document.findUnique({
                    where: { id: Document.id },
                    include: {
                        missionOrder: true,
                        absenceAuth: true,
                        exitSlip: true,
                        decisionMadeBy: { select: { id: true, name: true, username: true } },
                        leaveSession: true, // Include the updated leaveSession
                    },
                });
                return {message: "Too late it's past 16:00 -> marked as NOT_RETURNED", Document : refreshedDocument};
            }
        } 
        await prisma.leaveSession.update({
            where : { id : session.id } ,
            data : {
                returnTime : now ,
                status : "RETURNED"
            }
        })
        const refreshedDocument = await prisma.document.findUnique({
            where: { id: Document.id },
            include: {
                missionOrder: true,
                absenceAuth: true,
                exitSlip: true,
                decisionMadeBy: { select: { id: true, name: true, username: true } },
                leaveSession: true, // Include the updated leaveSession
            },
        });
    return {message: "QR code Valid , return time recorded", Document : refreshedDocument};
    }


        const refreshedDocument = await prisma.document.findUnique({
            where: { id: Document.id },
            include: {
                missionOrder: true,
                absenceAuth: true,
                exitSlip: true,
                decisionMadeBy: { select: { id: true, name: true, username: true } },
                leaveSession: true, // Include the updated leaveSession
            },
        });
    
    return {message: "QR code Valid , Already completed", Document : refreshedDocument}; 
}