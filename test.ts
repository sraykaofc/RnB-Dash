import Papa from 'papaparse';

async function run() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1fvb5M7f-rajXCgPF7ntDiQaeD6mJwq_5jdo6TL_NsKQ/export?format=csv');
  const text = await res.text();
  
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  const data = parsed.data;
  
  const notStarted = data.filter(row => {
    const vals = Object.values(row);
    const colAC = String(vals[28] || '').trim().toLowerCase();
    return colAC === 'not started';
  });
  
  console.log(`Total Not Started: ${notStarted.length}`);
  
  const counts = {};
  notStarted.forEach(row => {
    const vals = Object.values(row);
    const getCol = (index) => String(vals[index] || '').trim().toUpperCase();
    const getRawCol = (index) => String(vals[index] || '').trim();
    const hasVal = (index) => getCol(index) !== '';

    const valJ = getCol(9);   // BE Status
    const valM = getCol(12);  // TS Status
    const valP = getCol(15);  // DTP Status
    const valW = getCol(22);  // Proposal Status
    
    const hasS = hasVal(18);
    const hasT = hasVal(19);
    const hasU = hasVal(20);
    const hasV = hasVal(21);
    const hasZ = hasVal(25);
    const hasAA = hasVal(26);

    let status = 'Unknown';
    if (valW === 'TA') {
      if (hasZ && hasAA) {
        const valAC = getRawCol(28); // Column AC
        status = valAC || 'In Progress';
      } else if (hasZ) {
        status = 'WO Level';
      } else {
        status = 'LOA Level';
      }
    } else if (valP === 'DTP' || valW === 'C' || valW === 'G' || valW === 'D') {
      if (valW === 'C') status = 'Tender Proposal at C';
      else if (valW === 'G') status = 'Tender Proposal at G';
      else if (valW === 'D') {
        if (hasS && hasT && hasU && hasV) status = 'Tender Proposal at D';
        else if (hasS && hasT) status = 'Tender Under Evaluation';
        else if (hasS) status = 'Tender Online';
        else status = 'Pending for Online';
      }
      else if (valP === 'DTP') status = 'DTP Approved';
    } else if (valM === 'TS' || valP === 'D' || valP === 'C' || valP === 'G') {
      if (valP === 'D') status = 'DTP at D';
      else if (valP === 'C') status = 'DTP at C';
      else if (valP === 'G') status = 'DTP at G';
      else if (valM === 'TS') status = 'TS Approved';
    } else if (valM === 'C') status = 'TS at C';
    else if (valM === 'G') status = 'TS at Govt';
    else if (valJ === 'D') status = 'Block Estimate at D';
    else if (valJ === 'C') status = 'Block Estimate at C';
    else if (valJ === 'G') status = 'Block Estimate at G';
    else status = valJ || 'Unknown';
    
    counts[status] = (counts[status] || 0) + 1;
  });
  
  console.log("Detailed Status Counts for 'Not Started':", counts);
}

run();
