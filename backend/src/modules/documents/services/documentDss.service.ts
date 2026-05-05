import type { LeaveSession } from '../../../../generated/prisma/client.js';
import { prisma } from '../../../lib/prisma.js';





type Recommendation = 'APPROVE' | 'REVIEW' | 'REJECT';
 
interface SuggestionResult {
    recommendation: Recommendation;
    score: number;
    reasons: string[];
    notReturned?: LeaveSession[];
    rejections?: Awaited<ReturnType<typeof fetchDocument>>[];
    approvedDocs?: Awaited<ReturnType<typeof fetchDocument>>[];
    overlappingDocs?: Awaited<ReturnType<typeof fetchDocument>>[];
}
 
// ─── Thresholds (tweak without touching logic) ────────────────────────────────
 
const THRESHOLDS = {
    APPROVE_BELOW:          30,
    REJECT_ABOVE:           60,
    ABSENCE_WINDOW_DAYS:    90,
    ABSENCE_FREQUENCY_MAX:  3,
    ABSENCE_DURATION_MAX:   20,
    TEAM_OVERLAP_RATIO:     0.1,
};

function isSameDate(a?: Date | null, b?: Date | null): boolean {
    if (!a || !b) return false;
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function daysBetween(a: Date, b: Date): number {
    return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

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

    const absence = doc.absenceAuth!;

    const notReturned = leaves.filter(leave => leave.status === "NOT_RETURNED");
    const notReturnedNb = notReturned.length;

    if (notReturnedNb > 3) {
        reasons.push("Employee has more than 3 not returned leave sessions");
        score += 40;
    }    



    const teamSize = teamDocs.length;
    if (teamSize > 0) {
        const overlappingTeamMembers = teamDocs.filter(teamMemberDocs =>
            teamMemberDocs.some(d => {
                if (d.status !== "APPROVED" || d.type !== "ABSENCE_AUTH" || !d.absenceAuth) return false;
                const { startDate, endDate } = d.absenceAuth;
                return doc.absenceAuth && doc.absenceAuth.startDate <= endDate && doc.absenceAuth.endDate >= startDate;
            })
        );
        const overlappingTeamMembersCount = overlappingTeamMembers.length;
        const ratio = overlappingTeamMembersCount / teamSize;
        if (ratio >= THRESHOLDS.TEAM_OVERLAP_RATIO) {
            score += 20;
            reasons.push(`${overlappingTeamMembersCount} of ${teamSize} team members already absent during this period`);
        }
    }


    const durationDays = daysBetween(absence.startDate, absence.endDate);
    if (durationDays > THRESHOLDS.ABSENCE_DURATION_MAX) {
        score += 40;
        reasons.push(`Absence duration is ${Math.round(durationDays)} days (above ${THRESHOLDS.ABSENCE_DURATION_MAX}-day limit)`);
    }



    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setDate(now.getDate() - THRESHOLDS.ABSENCE_WINDOW_DAYS);
 
    const recentApproved = docs.filter(d =>
        d.status === "APPROVED" &&
        d.type === "ABSENCE_AUTH" &&
        d.authIssuedAt &&
        d.authIssuedAt >= windowStart
    );
    if (recentApproved.length > THRESHOLDS.ABSENCE_FREQUENCY_MAX) {
        score += 30;
        reasons.push(`${recentApproved.length} absences approved in the last ${THRESHOLDS.ABSENCE_WINDOW_DAYS} days`);
    }


    
    const rejections = docs.filter(d => d.status === "REJECTED" && d.type === "ABSENCE_AUTH" && isSameDate(d.authIssuedAt, doc.createdAt));
    const rejectionsNb = rejections.length;
    if (rejectionsNb > 0) {
        score += Math.min(rejectionsNb * 10, 30);
        reasons.push(`${rejectionsNb} previous request(s) were rejected this day`);
    }





  return {
        recommendation: toRecommendation(score),
        score: Math.min(score, 100),
        reasons,
        notReturned,
        rejections,
        approvedDocs: recentApproved,
    };

    
}


function evaluateExitSlip(
    doc: Awaited<ReturnType<typeof fetchDocument>>,
    docs: Awaited<ReturnType<typeof fetchEmployeeDocs>>,
    leaves: Awaited<ReturnType<typeof fetchLeaveSessions>>,
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
    const notReturned = leaves.filter(leave => leave.status === "NOT_RETURNED");
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
    
    const rejections = docs.filter(d => d.status === "REJECTED" && isSameDate(d.authIssuedAt, doc.createdAt));
    const rejectionsNb = rejections.length;
    if (rejectionsNb > 0) {
        score += Math.min(rejectionsNb * 10, 30);
        reasons.push(`${rejectionsNb} previous request(s) were rejected this day`);
    }


    const now = new Date();
    const windowStart = new Date(now);
    windowStart.setDate(now.getDate() - 10);
 
    const recentApproved = docs.filter(d =>
        d.status === "APPROVED" &&
        d.type === "EXIT_SLIP" &&
        d.authIssuedAt &&
        d.authIssuedAt >= windowStart
    );
    if (recentApproved.length > 5) {
        score += 30;
        reasons.push(`${recentApproved.length} absences approved in the last 10 days`);
    }

    return {
        recommendation: toRecommendation(score),
        score: Math.min(score, 100),
        reasons,
        notReturned,
        rejections,
        approvedDocs: recentApproved,
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


async function fetchTeamDocs(structureId: number | null, excludeEmployeeId: number) {
    if (structureId == null) return [];
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

