import { prisma } from '../../../lib/prisma.js';





type Recommendation = 'APPROVE' | 'REVIEW' | 'REJECT';
 
interface SuggestionResult {
    recommendation: Recommendation;
    score: number;
    reasons: string[];
}
 
// ─── Thresholds (tweak without touching logic) ────────────────────────────────
 
const THRESHOLDS = {
    APPROVE_BELOW:          30,
    REJECT_ABOVE:           60,
    ABSENCE_WINDOW_DAYS:    90,
    ABSENCE_FREQUENCY_MAX:  3,
    ABSENCE_DURATION_WARN:  10,
    ABSENCE_DURATION_MAX:   20,
    ABSENCE_SHORT_NOTICE_DAYS: 2,
    TEAM_OVERLAP_RATIO:     0.3,
};


function toRecommendation(score: number): Recommendation {
    if (score < THRESHOLDS.APPROVE_BELOW)       return 'APPROVE';
    if (score > THRESHOLDS.REJECT_ABOVE)        return 'REJECT';
    return 'REVIEW';
}


function evaluateAbsenceAuth(
    doc: Awaited<ReturnType<typeof fetchDocument>>,
    docs: Awaited<ReturnType<typeof fetchEmployeeDocs>>,
    leaves: Awaited<ReturnType<typeof fetchLeaveSessions>>,
    teamDocs: Awaited<ReturnType<typeof fetchTeamDocs>>,
): SuggestionResult {
    let score = 0;
    const reasons: string[] = [];


    const notReturnedNb = leaves.reduce((count, leave) => {
        if (leave.status === "NOT_RETURNED") {
            return count + 1;
        }
        return count;
    }, 0);

    if (notReturnedNb > 3) {
        reasons.push("Employee has more than 3 not returned leave sessions");
        score += 40;
    }    

    const absencesApprovedNb = docs.reduce((count, doc) => {
        if (doc.status === "APPROVED" ) {
            return count + 1;
        }
        return count;
    },0);


    if (absencesApprovedNb > 5) {
        reasons.push("Employee has more than 5 approved absences");
        score += 30;
    }

    const teamSize = teamDocs.length;
    if (teamSize > 0) {
        const overlappingTeamMembers = teamDocs.filter(teamMemberDocs =>
            teamMemberDocs.some(d => {
                if (d.status !== "APPROVED" || d.type !== "ABSENCE_AUTH" || !d.absenceAuth) return false;
                const { startDate, endDate } = d.absenceAuth;
                return doc.absenceAuth && doc.absenceAuth.startDate <= endDate && doc.absenceAuth.endDate >= startDate;
            })
        ).length;
 
        const ratio = overlappingTeamMembers / teamSize;
        if (ratio >= THRESHOLDS.TEAM_OVERLAP_RATIO) {
            score += 20;
            reasons.push(`${overlappingTeamMembers} of ${teamSize} team members already absent during this period`);
        }
    }
  return {
        recommendation: toRecommendation(score),
        score: Math.min(score, 100),
        reasons,
    };

    
}


function evaluateExitSlip(
    doc: Awaited<ReturnType<typeof fetchDocument>>,
    docs: Awaited<ReturnType<typeof fetchEmployeeDocs>>,
    leaveSessions: Awaited<ReturnType<typeof fetchLeaveSessions>>,
): SuggestionResult {

    let score = 0;
    const reasons: string[] = [];



        const hoursCheck : string | null =    
         (doc.exitSlip?.returnTime && doc.exitSlip?.exitTime && 
         (doc.exitSlip.returnTime.getHours() - doc.exitSlip.exitTime.getHours()) > 4) ?
            "Duration > 4 hours" : null;

    if (hoursCheck) {
        reasons.push(hoursCheck);
        score += 30;
    }

    return {
        recommendation: toRecommendation(score),
        score: Math.min(score, 100),
        reasons,
    };
    
    
}

async function fetchDocument(documentId: number) {
    const doc = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
            absenceAuth: true,
            exitSlip: true,
        },
    });
    if (!doc) throw new Error(`Document ${documentId} not found`);
    return doc;
}


async function fetchLeaveSessions(employeeId: number) {
    return prisma.leaveSession.findMany({
        where: {
            document: { issuedById: employeeId },
        },
    });
}


async function fetchTeamDocs(structureId: number, excludeEmployeeId: number) {
    const teammates = await prisma.employee.findMany({
        where: {
            structureId,
            id: { not: excludeEmployeeId },
        },
        select: { id: true },
    });
 
    const teamDocsByMember = await Promise.all(
        teammates.map(t =>
            prisma.document.findMany({
                where: { issuedById: t.id },
                include: { absenceAuth: true },
            })
        )
    );
 
    return teamDocsByMember;
}


async function fetchEmployeeDocs(employeeId: number) {
    return prisma.document.findMany({
        where: { issuedById: employeeId },
        include: {
            absenceAuth: true,
            exitSlip: true,
        },
    });
}


export const GetSuggestion = async (data: string) => {
    const documentId = parseInt(data);
    if (isNaN(documentId)) {
        throw new Error("Invalid document ID");
    }

    const doc = await fetchDocument(documentId);
    
    const employee = await prisma.employee.findFirst({
        where: { issuedDocuments: { some: { id: documentId } } },
        select: { id: true, structureId: true },
    });

    if (!employee) throw new Error('Employee not found for the given document ID');

    const [employeeDocs, leaveSessions] = await Promise.all([
        fetchEmployeeDocs(employee.id),
        fetchLeaveSessions(employee.id),
    ]);

    if (doc.type === "ABSENCE_AUTH") {
        if (!doc.absenceAuth) throw new Error('AbsenceAuth data missing for document');
        const teamDocs = await fetchTeamDocs(employee.structureId, employee.id);
        return {
            suggestion: evaluateAbsenceAuth(doc, employeeDocs, leaveSessions, teamDocs),
            document: doc
        };
    }
 
    if (doc.type === "EXIT_SLIP") {
        if (!doc.exitSlip) throw new Error('ExitSlip data missing for document');
        return {
           suggestion: evaluateExitSlip(doc, employeeDocs, leaveSessions) , 
           document: doc
        };
    }
 
    throw new Error(`Document type ${doc.type} is not supported for suggestions`);
}    

