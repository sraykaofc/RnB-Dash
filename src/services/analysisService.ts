import { differenceInDays, addDays, parse, isValid } from 'date-fns';

export interface ProjectData {
  id: string;
  name: string;
  district: string;
  status: string; // PAA, AA, TS, DTP, Online, TA, LOA, WO
  currentLocation: 'D' | 'C' | 'G' | 'Approved' | 'AA' | '';
  dispatchDate?: string; // Column Y
  closingDate?: string;
  openingDate?: string;
  aaDate?: string;
  tsDate?: string;
  approvedAmount?: number;
  timeLimit?: string;
  isHighPriority: boolean;
  raw: any;
  alertType?: 'Bid Validity' | 'Stuck at Govt' | 'Tender Process Delays' | 'LOA' | 'WO';
  alertMessage?: string;
  alertPriority?: number;
  alertDays?: number;
  alertStage?: 'BE' | 'TS' | 'DTP' | 'Tender' | 'LOA' | 'WO';
}

export interface DashboardStats {
  allProjects: ProjectData[];
  redAlerts: ProjectData[];
  executionDelays: ProjectData[];
  highPriority: ProjectData[];
  pendingAA: ProjectData[];
  pendingTS: ProjectData[];
  pendingDTP: ProjectData[];
  tenderLevel: ProjectData[];
  tenderApprovals: ProjectData[];
  loaWoLevel: ProjectData[];
  summary: {
    total: number;
    atD: number;
    atC: number;
    atG: number;
    approved: number;
  };
  projectStatus: {
    notStarted: number;
    inProgress: number;
    phyCompleted: number;
    completed: number;
    stopped: number;
  };
}

// Excel stores dates as number of days since Jan 1, 1900
function excelDateToJSDate(serial: number): Date {
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;                                        
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;
  total_seconds -= seconds;

  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;

  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

export function parseDate(dateStr: string | number | undefined): Date | null {
  if (!dateStr) return null;
  
  // Handle Excel serial dates (e.g., 0.98244213 or 45000)
  if (typeof dateStr === 'number' || !isNaN(Number(dateStr))) {
    const num = Number(dateStr);
    // If it's a small decimal, it might just be a time, but if it's > 20000 it's likely a date
    if (num > 20000) {
       return excelDateToJSDate(num);
    }
    // If it's a small decimal like 0.44, it's just a time, not a full date. We'll ignore these for validity checks.
    if (num < 1) return null;
  }

  const str = String(dateStr).trim();
  
  // Try common formats
  const formats = ['dd.MM.yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd', 'dd-MM-yyyy'];
  for (const f of formats) {
    const d = parse(str, f, new Date());
    if (isValid(d)) return d;
  }
  const d = new Date(str);
  return isValid(d) ? d : null;
}

export function analyzeProjects(data: any[]): DashboardStats {
  const today = new Date();
  const projects: ProjectData[] = data.map((row, index) => {
    const name = (row['Work Name'] || row['Project Name'] || row['Name'] || '').trim();
    const status = (row['Proposal Status'] || row['Status'] || '').trim();
    const currentLocation = (row['BE Status'] || row['Location'] || row['Current Location'] || '').trim();
    
    // Column Y is typically 'App. Date' or 'Approved Amount' depending on status in this specific sheet
    const dispatchDateStr = row['App. Date'] || row['Dispatch Date'] || row['Column Y'] || '';
    const closingDateStr = row['Closing Date'] || '';
    
    return {
      id: index.toString(),
      name,
      district: row['Division'] || row['District'] || '',
      status,
      currentLocation: currentLocation as any,
      dispatchDate: dispatchDateStr,
      closingDate: closingDateStr,
      openingDate: row['Opened Date'] || row['Opening Date'] || '',
      aaDate: row['AA Date'] || '',
      tsDate: row['TS Date'] || '',
      approvedAmount: parseFloat(row['Approved Amount'] || row['Column Y'] || '0'),
      timeLimit: row['Time Limit (As Per WO) (Months)'] || row['Time Limit'] || '',
      isHighPriority: name.toLowerCase().includes('tourist') || name.toLowerCase().includes('pravasipath') || row['Budget Head']?.toLowerCase().includes('pravasipath'),
      raw: row
    };
  });

  const redAlerts: ProjectData[] = [];
  const executionDelays: ProjectData[] = [];
  const highPriority: ProjectData[] = [];
  const pendingAA: ProjectData[] = [];
  const pendingTS: ProjectData[] = [];
  const pendingDTP: ProjectData[] = [];
  const tenderLevel: ProjectData[] = [];
  const tenderApprovals: ProjectData[] = [];
  const loaWoLevel: ProjectData[] = [];

  let atD = 0, atC = 0, atG = 0, approved = 0;
  let notStarted = 0, inProgress = 0, phyCompleted = 0, completed = 0, stopped = 0;

  projects.forEach(p => {
    // Skip empty rows
    if (!p.name) return;

    // Project Status from Column AC (index 28)
    const vals = Object.values(p.raw);
    const colAC = String(vals[28] || '').trim().toLowerCase();
    
    if (colAC === 'not started') notStarted++;
    else if (colAC === 'in progress') inProgress++;
    else if (colAC === 'phy. completed' || colAC === 'phy completed') phyCompleted++;
    else if (colAC === 'completed') completed++;
    else if (colAC === 'stopped') stopped++;

    // Track Pending AA Works
    // If a project has PAA but no AA, or its status is explicitly PAA, AND it is at D, C, or G
    if ((p.status === 'PAA' || (p.raw['PAA Date'] && !p.aaDate)) && ['D', 'C', 'G'].includes(p.currentLocation)) {
      pendingAA.push(p);
    }

    const detailedStatus = getDetailedStatus(p);

    if (colAC === 'not started') {
      if (detailedStatus.includes('DTP at') || detailedStatus === 'TS Approved') {
        pendingDTP.push(p);
      } else if (detailedStatus.includes('Tender Online') || detailedStatus.includes('Pending for Online') || detailedStatus.includes('Tender Under Evaluation')) {
        tenderLevel.push(p);
      } else if (detailedStatus.includes('Proposal at')) {
        tenderApprovals.push(p);
      } else if (detailedStatus === 'LOA Level' || detailedStatus === 'WO Level') {
        loaWoLevel.push(p);
      } else if (
        detailedStatus.includes('TS at') || 
        detailedStatus.includes('Block Estimate') || 
        detailedStatus === 'AA' || 
        detailedStatus === 'PAA' || 
        detailedStatus === 'Unknown' || 
        detailedStatus === 'Pending TS'
      ) {
        pendingTS.push(p);
      }
    }

    // --- RED ALERTS LOGIC ---
    if (colAC === 'not started') {
      let alertType: ProjectData['alertType'] = undefined;
      let alertMessage = '';
      let alertPriority = 999;
      let alertDays = 0;
      let alertStage: ProjectData['alertStage'] = undefined;

      const setAlert = (type: ProjectData['alertType'], msg: string, prio: number, days: number, stage?: ProjectData['alertStage']) => {
        if (prio < alertPriority) {
          alertType = type;
          alertMessage = msg;
          alertPriority = prio;
          alertDays = days;
          alertStage = stage;
        }
      };

      const getRawCol = (index: number) => String(vals[index] || '').trim();
      const getCol = (index: number) => getRawCol(index).toUpperCase();

      const valP = getCol(15); // DTP Status
      const closingDateStr = getRawCol(18); // Closing Date
      const valW = getCol(22); // Proposal Status
      const appDateStr = getRawCol(23); // App. Date

      // 1. Bid Validity Alert (Priority 1)
      // Ignore if Proposal Status is TA and App Date is present
      const hasTAAndAppDate = valW === 'TA' && appDateStr && appDateStr !== '..';
      if (!hasTAAndAppDate && valP === 'DTP' && closingDateStr && closingDateStr !== '..') {
        const closingDate = parseDate(closingDateStr);
        if (closingDate) {
          const expiryDate = addDays(closingDate, 120);
          const daysRemaining = differenceInDays(expiryDate, today);
          if (daysRemaining < 0) {
            setAlert('Bid Validity', `Bid Validity Crossed by ${Math.abs(daysRemaining)} days`, 1, Math.abs(daysRemaining), 'Tender');
          } else if (daysRemaining < 30) {
            setAlert('Bid Validity', `Bid Validity expires in ${daysRemaining} days`, 1, -daysRemaining, 'Tender');
          }
        }
      }

      // 2. Stuck at Govt Alert (Priority 2)
      const checkGovtStuck = (statusIndex: number, dateIndex: number, stageName: ProjectData['alertStage']) => {
        if (getCol(statusIndex) === 'G') {
          const dateStr = getRawCol(dateIndex);
          if (!dateStr || dateStr === '..') {
            setAlert('Stuck at Govt', `Stuck at Govt No Date Found for Tracking`, 2, 9999, stageName);
          } else {
            const d = parseDate(dateStr);
            if (!d) {
              setAlert('Stuck at Govt', `Stuck at Govt No Date Found for Tracking`, 2, 9999, stageName);
            } else {
              const daysPassed = differenceInDays(today, d);
              if (daysPassed > 15) {
                setAlert('Stuck at Govt', `Stuck for ${daysPassed} days (${stageName})`, 2, daysPassed, stageName);
              }
            }
          }
        }
      };
      
      checkGovtStuck(9, 10, 'BE'); // BE Status & AA (Rs. Lakh)
      checkGovtStuck(12, 13, 'TS'); // TS Status & TS (Rs. Lakh)
      checkGovtStuck(15, 16, 'DTP'); // DTP Status & DTP (Rs. Lakh)
      checkGovtStuck(22, 23, 'Tender'); // Proposal Status & App. Date

      // 3. Tender Process Delays (Priority 3)
      if (valP === 'DTP' && valW === 'D' && closingDateStr && closingDateStr !== '..') {
        const closingDate = parseDate(closingDateStr);
        if (closingDate) {
          const daysPassed = differenceInDays(today, closingDate);
          if (daysPassed > 15) {
            setAlert('Tender Process Delays', `Tender Opening Missed by ${daysPassed} days`, 3, daysPassed, 'Tender');
          }
        }
      }

      // 4. LOA Alert (Priority 4)
      if (valW === 'TA') {
        const loaDateStr = getRawCol(25); // LOA Date
        if (appDateStr && appDateStr !== '..' && (!loaDateStr || loaDateStr === '..')) {
          const appDate = parseDate(appDateStr);
          if (appDate) {
            const daysPassed = differenceInDays(today, appDate);
            if (daysPassed > 15) {
              setAlert('LOA', `LOA Pending for ${daysPassed} days`, 4, daysPassed, 'LOA');
            }
          }
        }
      }

      // 5. WO Alert (Priority 5)
      const loaDateStr = getRawCol(25); // LOA Date
      const woDateStr = getRawCol(26); // W.O. Date
      if (loaDateStr && loaDateStr !== '..' && (!woDateStr || woDateStr === '..')) {
        const loaDate = parseDate(loaDateStr);
        if (loaDate) {
          const daysPassed = differenceInDays(today, loaDate);
          if (daysPassed > 20) {
            setAlert('WO', `WO pending for ${daysPassed} days`, 5, daysPassed, 'WO');
          }
        }
      }

      if (alertType) {
        p.alertType = alertType;
        p.alertMessage = alertMessage;
        p.alertPriority = alertPriority;
        p.alertDays = alertDays;
        p.alertStage = alertStage;
        redAlerts.push(p);
      }
    }

    // --- SUMMARY COUNTS ---
    if (p.currentLocation === 'G' || p.status === 'G') {
      atG++;
    } else if (p.currentLocation === 'D' || p.status === 'D') {
      atD++;
    } else if (p.currentLocation === 'C' || p.status === 'C') {
      atC++;
    } else if (p.currentLocation === 'AA' || p.status === 'TA' || p.status === 'Completed' || p.status === 'Phy. Completed') {
      approved++;
    }

    // 3. High Priority
    if (p.isHighPriority) {
      highPriority.push(p);
    }

    // 4. Execution Delays
    // If status is "In Progress" and it has a time limit
    if (p.status === 'In Progress' && p.timeLimit) {
      executionDelays.push(p);
    }
  });

  redAlerts.sort((a, b) => {
    if (a.alertPriority !== b.alertPriority) {
      return (a.alertPriority || 999) - (b.alertPriority || 999);
    }
    return (b.alertDays || 0) - (a.alertDays || 0);
  });

  pendingAA.sort((a, b) => {
    const dateA = parseDate(a.raw['PAA Date']);
    const dateB = parseDate(b.raw['PAA Date']);
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1; // Put projects without PAA dates at the end
    if (!dateB) return -1;
    return dateA.getTime() - dateB.getTime();
  });

  const sortOrderDCG = (a: ProjectData, b: ProjectData) => {
    const getRank = (status: string) => {
      if (status.includes(' at D')) return 1;
      if (status.includes(' at C')) return 2;
      if (status.includes(' at G') || status.includes(' at Govt')) return 3;
      return 4;
    };
    return getRank(getDetailedStatus(a)) - getRank(getDetailedStatus(b));
  };

  pendingTS.sort(sortOrderDCG);
  pendingDTP.sort(sortOrderDCG);
  tenderApprovals.sort(sortOrderDCG);

  tenderLevel.sort((a, b) => {
    const getRank = (status: string) => {
      if (status === 'Pending for Online') return 1;
      if (status === 'Tender Online') return 2;
      if (status === 'Tender Under Evaluation') return 3;
      return 4;
    };
    return getRank(getDetailedStatus(a)) - getRank(getDetailedStatus(b));
  });

  loaWoLevel.sort((a, b) => {
    const getRank = (status: string) => {
      if (status === 'LOA Level') return 1;
      if (status === 'WO Level') return 2;
      return 3;
    };
    return getRank(getDetailedStatus(a)) - getRank(getDetailedStatus(b));
  });

  return {
    allProjects: projects,
    redAlerts,
    executionDelays,
    highPriority,
    pendingAA,
    pendingTS,
    pendingDTP,
    tenderLevel,
    tenderApprovals,
    loaWoLevel,
    summary: {
      total: projects.filter(p => p.name).length,
      atD,
      atC,
      atG,
      approved
    },
    projectStatus: {
      notStarted,
      inProgress,
      phyCompleted,
      completed,
      stopped
    }
  };
}

export function getDetailedStatus(project: ProjectData): string {
  const vals = Object.values(project.raw);
  const getCol = (index: number) => String(vals[index] || '').trim().toUpperCase();
  const getRawCol = (index: number) => String(vals[index] || '').trim();
  const hasVal = (index: number) => getCol(index) !== '';

  const valJ = getCol(9);   // BE Status
  const valM = getCol(12);  // TS Status
  const valP = getCol(15);  // DTP Status
  const valW = getCol(22);  // Proposal Status
  
  const hasS = hasVal(18); // Closing Date
  const hasT = hasVal(19); // Opened Date
  const hasU = hasVal(20); // Agency Name
  const hasV = hasVal(21); // % of Tender
  const hasZ = hasVal(25); // LOA Date
  const hasAA = hasVal(26); // W.O. Date

  if (valW === 'TA') {
    if (hasZ && hasAA) {
      const valAC = getRawCol(28); // Column AC
      return valAC || 'In Progress';
    }
    if (hasZ) return 'WO Level';
    return 'LOA Level';
  }

  if (valP === 'DTP' || valW === 'C' || valW === 'G' || valW === 'D') {
    if (valW === 'C') return 'Proposal at C';
    if (valW === 'G') return 'Proposal at G';
    if (valW === 'D') {
      if (hasS && hasT && hasU && hasV) return 'Proposal at D';
      if (hasS && hasT) return 'Tender Under Evaluation';
      if (hasS) return 'Tender Online';
      return 'Pending for Online';
    }
    if (valP === 'DTP') return 'Pending for Online'; // DTP Approved but no proposal status means pending for online
  }

  if (valM === 'TS' || valP === 'D' || valP === 'C' || valP === 'G') {
    if (valP === 'D') return 'DTP at D';
    if (valP === 'C') return 'DTP at C';
    if (valP === 'G') return 'DTP at G';
    if (valM === 'TS') return 'TS Approved';
  }

  if (valM === 'D') return 'TS at D';
  if (valM === 'C') return 'TS at C';
  if (valM === 'G') return 'TS at G';

  if (valJ === 'D') return 'Block Estimate at D';
  if (valJ === 'C') return 'Block Estimate at C';
  if (valJ === 'G') return 'Block Estimate at G';

  return project.status || valJ || 'Unknown';
}
