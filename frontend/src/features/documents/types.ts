export type Document = {
  id: number;
  type: string;
  createdAt: string;
  status: string;
  qrCode?: string;
  managerComment?: string | null;
  issuedById?: number;
  authIssuedAt?: string;
  decisionMadeById?: number;
  decisionMadeBy?: {
    id: number;
    name: string;
    username: string;
  } | null;
  exitSlip?: {
    exitTime: string;
    returnTime: string;
    gate: string;
  };
  absenceAuth?: {
    endDate: string;
    startDate: string;
    reason: string;
  };
  missionOrder?: {
    duration: number;
    destination: string;
    purpose: string;
    travelMethod: string;
  };
};

export type DocumentResponse = {
  [key: string]: Document;
};
