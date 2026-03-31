import Papa from 'papaparse';

async function run() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1fvb5M7f-rajXCgPF7ntDiQaeD6mJwq_5jdo6TL_NsKQ/export?format=csv');
  const text = await res.text();
  
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  const data = parsed.data;
  
  let pendingAA = 0;
  
  data.forEach(row => {
    const vals = Object.values(row);
    const getCol = (index) => String(vals[index] || '').trim().toUpperCase();
    const getRawCol = (index) => String(vals[index] || '').trim();
    
    const status = getRawCol(8); // Status
    const paaDate = getRawCol(10); // PAA Date
    const aaDate = getRawCol(11); // AA Date
    const currentLocation = getRawCol(24); // Current Location
    
    if ((status === 'PAA' || (paaDate && !aaDate)) && ['D', 'C', 'G'].includes(currentLocation)) {
      pendingAA++;
    }
  });
  
  console.log(`pendingAA: ${pendingAA}`);
}

run();
