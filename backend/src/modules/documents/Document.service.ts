import { prisma } from '../../lib/prisma.js'
import puppeteer, { Browser } from 'puppeteer';
import { generateToken } from '../../lib/Aid.js';
import QRCode from 'qrcode';
import os from 'os';
import { RoleType } from '../../../generated/prisma/client.js';

function httpError(status: number, message: string): Error & { status: number } {
    const err = new Error(message) as Error & { status: number };
    err.status = status;
    return err;
}

async function getEmployeeRoleTypes(employeeId: number): Promise<RoleType[]> {
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
            roles: {
                select: {
                    role: {
                        select: { type: true },
                    },
                },
            },
        },
    });

    if (!employee) throw httpError(404, 'Employee not found');
    return employee.roles.map((r) => r.role.type);
}

//Creation Part
// FOR NOW I AM RETREIVING ALL DATA FROM REQ.BODY

export const CreateExitSlip = async (data : any ) => {
    const {Qrcode , Type , EmployeeId,  exitTime , returnTime , gate} = data ; 

    const employeeIdNum = Number(EmployeeId);
    if (!Number.isFinite(employeeIdNum)) throw httpError(400, 'EmployeeId is required');
    await getEmployeeRoleTypes(employeeIdNum);

    const ExitSlip = await prisma.document.create({
        data : {
            qrCode: Qrcode ,
            type : Type , 
            issuedById : employeeIdNum , 
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

    const employeeIdNum = Number(EmployeeId);
    if (!Number.isFinite(employeeIdNum)) throw httpError(400, 'EmployeeId is required');
    await getEmployeeRoleTypes(employeeIdNum);

    const AbsenceAuth = prisma.document.create({
        data : { 
            qrCode: Qrcode ,
            type : Type , 
            issuedById : employeeIdNum , 
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
    const { Qrcode, Type, EmployeeId, assignedToId, destination, duration, purpose, travelMethod } = data;

    const managerId = Number(EmployeeId);
    if (!Number.isFinite(managerId)) throw httpError(400, 'EmployeeId (managerId) is required');

    if (Type !== 'MISSION_ORDER') {
      throw httpError(400, 'Invalid Type for Mission Order');
    }

    const managerRoles = await getEmployeeRoleTypes(managerId);
    const isManagerOrAdmin = managerRoles.includes(RoleType.MANAGER) || managerRoles.includes(RoleType.ADMIN);
    if (!isManagerOrAdmin) {
      throw httpError(403, 'Only MANAGER/ADMIN users can assign Mission Orders');
    }

    const assignedEmployeeId = Number(assignedToId);
    if (!Number.isFinite(assignedEmployeeId)) {
      throw httpError(400, 'assignedToId is required');
    }

    const assignedRoles = await getEmployeeRoleTypes(assignedEmployeeId);
    const isWorker = assignedRoles.includes(RoleType.WORKER);
    if (!isWorker) {
      throw httpError(400, 'assignedToId must be a WORKER');
    }

    const MissionOrder = prisma.document.create({
        data : { 
            qrCode: Qrcode ,
            type : Type ,
            status: 'APPROVED',
            authIssuedAt: new Date(),
            issuedById : assignedEmployeeId,
            decisionMadeById: managerId,
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

export const GetAllSessions = async () => {
  return await prisma.leaveSession.findMany({
    orderBy: { leaveTime: "desc" },
    include: {
      document: {
        include: {
          employee: {
            select: { 
              id: true, 
              name: true, 
              username: true, 
              email: true,        // ← add
              structure: {        // ← add
                select: { id: true, name: true }
              }
            }
          },
          missionOrder: true,
          absenceAuth: true,
          exitSlip: true,
        }
      }
    }
  });
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


let browser: Browser;

export const initBrowser = async () => {
  if (!browser) {
    const options: Parameters<typeof puppeteer.launch>[0] = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    if (process.env.CHROME_PATH) {
      options.executablePath = process.env.CHROME_PATH;
    }

    browser = await puppeteer.launch(options);
  }
};


function getLocalIP(): string {
  return Object.values(os.networkInterfaces())
    .flat()
    .find((iface) => iface?.family === "IPv4" && !iface.internal)?.address || "localhost";
}

export const GeneratePdf = async (id: any) => {
  const DocumentId = parseInt(id);
  const Document = await prisma.document.findUnique({
    where: { id: DocumentId },
    include: {
      missionOrder: true,
      absenceAuth: true,
      exitSlip: true,
      decisionMadeBy: {
        select: { id: true, name: true, username: true },
      },
    }
  });

  if (!Document) throw new Error("Document not found");
  if (!Document.qrCode) throw new Error("Document has no QR code");

  const baseUrl = process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL
    : `http://${getLocalIP()}:3000`;

  const url = `${baseUrl}/scan?token=${Document.qrCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(url);

  const html = `<!DOCTYPE html>
    <html>
        <head>
            <style>
            body { font-family: Arial; padding: 40px; }
            .container { border: 1px solid #000; padding: 20px; }
            .title { text-align: center; font-size: 24px; font-weight: bold; }
            .qr { margin-top: 30px; text-align: center; }
            .content { display: flex; gap: 24px; align-items: flex-start; margin-top: 24px; }
            .info { flex: 1; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="title">Approved Document</div>
                <div class="content">
                    <div class="info">
                        <p><strong>User:</strong> ${Document.id}</p>
                        <p><strong>Type:</strong> ${Document.type}</p>
                        <p><strong>Date:</strong> ${new Date(Document.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="qr">
                        <img src="${qrCodeDataUrl}" width="150" height="150" />
                        <p>Scan to verify</p>
                    </div>
                </div>
            </div>
        </body>
    </html>`;

  if (!browser) throw new Error("Browser not initialized. Call initBrowser() first.");

  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "load" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    return pdfBuffer;
  } finally {
    await page.close();
  }
};



export const ScanDocument = async (token: any) => {
  const Document = await prisma.document.findUnique({
    where: { qrCode: token },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          structure: { select: { id: true, name: true } },
        },
      },
      missionOrder: true,
      absenceAuth: true,
      exitSlip: true,
      leaveSession: true,
      decisionMadeBy: { select: { id: true, name: true, username: true } },
    }
  });

  if (!Document) throw new Error("Invalid QR code");

  const now = new Date();
  let session = await prisma.leaveSession.findUnique({
    where: { documentId: Document.id }
  });

  if (Document.status === "APPROVED") {
    // First scan — record leave time
    if (!session) {
      try {
        session = await prisma.leaveSession.create({
          data: {
            documentId: Document.id,
            status: "OUT",
            employeeId: Document.issuedById,
            leaveTime: now,
          }
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          session = await prisma.leaveSession.findUnique({
            where: { documentId: Document.id }
          });
        } else {
          throw err;
        }
      }

      const refreshedDocument = await prisma.document.findUnique({
        where: { id: Document.id },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              structure: { select: { id: true, name: true } },
            },
          },
          missionOrder: true, absenceAuth: true, exitSlip: true,
          leaveSession: true, decisionMadeBy: { select: { id: true, name: true, username: true } },
        }
      });
      return { message: "QR code Valid , leave time created", Document: refreshedDocument };
    }

    // Second scan — record return time
    if (session && !session.returnTime) {
      if (Document.type === "EXIT_SLIP") {
        const hour = now.getHours();
        if (hour >= 16) {
          await prisma.leaveSession.update({
            where: { id: session.id },
            data: { status: "NOT_RETURNED" }
          });
          const refreshedDocument = await prisma.document.findUnique({
            where: { id: Document.id },
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  structure: { select: { id: true, name: true } },
                },
              },
              missionOrder: true, absenceAuth: true, exitSlip: true,
              leaveSession: true, decisionMadeBy: { select: { id: true, name: true, username: true } },
            }
          });
          return { message: "Too late it's past 16:00 -> marked as NOT_RETURNED", Document: refreshedDocument };
        }
      }

      await prisma.leaveSession.update({
        where: { id: session.id },
        data: { returnTime: now, status: "RETURNED" }
      });
      const refreshedDocument = await prisma.document.findUnique({
        where: { id: Document.id },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              structure: { select: { id: true, name: true } },
            },
          },
          missionOrder: true, absenceAuth: true, exitSlip: true,
          leaveSession: true, decisionMadeBy: { select: { id: true, name: true, username: true } },
        }
      });
      return { message: "QR code Valid , return time recorded", Document: refreshedDocument };
    }
  }

  // Already completed
  const refreshedDocument = await prisma.document.findUnique({
    where: { id: Document.id },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          structure: { select: { id: true, name: true } },
        },
      },
      missionOrder: true, absenceAuth: true, exitSlip: true,
      leaveSession: true, decisionMadeBy: { select: { id: true, name: true, username: true } },
    }
  });
  return { message: "QR code Valid , Already completed", Document: refreshedDocument };
};