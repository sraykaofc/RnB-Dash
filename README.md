# R&B Circle No. 2 Dashboard

**Expert Data Analyst Dashboard for Superintending Engineer**  
Rajkot • R&B Circle No. 2  
*Amreli • Bhavnagar • Junagadh • Botad • Porbandar • Gir Somnath*

---

## 🎯 Overview

A comprehensive project tracking dashboard that monitors daily project spreadsheet data and generates clean, actionable insights with:

- 🚨 **Red Alerts** - Bid validity expiring, files stuck at government levels
- ⏳ **Pending Workflows** - Track PAA → AA → TS → DTP phases
- 🚧 **Execution Delays** - Bottlenecks at Division, Circle, or Government levels
- 📊 **Visual Analytics** - Project status distribution charts
- 📋 **Full Data Table** - 29 columns with dynamic filters

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and **yarn**
- **Python** 3.8+
- **Google Sheet** with public access (View permission)

### Installation

1. **Frontend Setup**
```bash
cd frontend
yarn install
```

2. **Backend Setup** (Optional - if using backend)
```bash
cd backend
pip install -r requirements.txt
```

3. **Configure Environment**

**Frontend** (`frontend/.env`):
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Backend** (`backend/.env`):
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=dashboard
```

4. **Run the Application**

**Frontend Only** (Recommended for this app):
```bash
cd frontend
yarn start
```
Opens at `http://localhost:3000`

**With Backend** (Optional):
```bash
cd backend
python server.py  # Runs on port 8001
```

---

## 📁 Project Structure

```
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── Login.js          # Authentication
│   │   │   │   ├── ProjectDetails.js # Project detail view
│   │   │   │   ├── DataTable.js      # Full data table
│   │   │   │   └── ProjectRow.js     # Project row component
│   │   │   └── ui/                   # Shadcn UI components
│   │   ├── utils/
│   │   │   ├── helpers.js            # Date parsing, formatting
│   │   │   └── constants.js          # Shared constants
│   │   ├── App.js                    # Main application
│   │   └── App.css
│   ├── package.json
│   └── tailwind.config.js
├── backend/                          # Optional backend
│   ├── server.py
│   └── requirements.txt
├── REFACTORING_SUMMARY.md           # Refactoring documentation
└── RED_ALERTS_DOCUMENTATION.md      # Alert logic documentation
```

---

## 🔐 Authentication

**Default Credentials:**
- **Username**: `SRayka`
- **Password**: `123456`

*(Frontend-only authentication with localStorage persistence)*

---

## 📊 Features

### 1. **Dashboard Overview**
- **7 Stat Cards**: Red Alerts, Pending AA, Pending TS, Pending DTP, Tender Level, Tender Approvals, LOA-WO Level
- **Division Filters**: Filter by Amreli, Bhavnagar, Junagadh, Botad, Porbandar, Veraval
- **Project Status Chart**: Visual distribution of project statuses

### 2. **Red Alerts System**
Priority-based alerting:
- **P0.5**: Bid Validity Crossed (expired)
- **P1**: Bid Validity Expiring (<30 days)
- **P2**: Stuck at Government (BE, TS, DTP, Proposal >30-60 days)

### 3. **Full Data Table**
- 29 toggleable columns
- Per-column filtering
- Sticky headers
- Click any row to view full project details

### 4. **Project Details**
- Full-page view with all project information
- Dark slate gradient sticky header
- Quick info: Division, Status, PAA Amount, PAA Date
- "Back to Dashboard" navigation

### 5. **Google Sheets Integration**
- Real-time CSV import from public Google Sheets
- Automatic data parsing (DD.MM.YYYY dates)
- No backend required - all processing in browser

---

## 🎨 Tech Stack

### Frontend
- **React 19** - UI Framework
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Recharts** - Data visualization
- **Papaparse** - CSV parsing
- **date-fns** - Date manipulation
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend (Optional)
- **FastAPI** - Python web framework
- **MongoDB** - Database
- **Python 3.8+**

---

## 📖 Usage Guide

### Connecting Your Google Sheet

1. **Open your Google Sheet** with project data
2. **Share the sheet**:
   - Click "Share" (top right)
   - Under "General access", select **"Anyone with the link"**
   - Set permission to **"Viewer"**
   - Click "Done"
3. **Copy the URL** and paste in the dashboard
4. Click **"Import Data"**

### Expected Sheet Format

The app expects these columns (order doesn't matter):
- Code, Work Name, Division
- PAA Amount, PAA Date
- AA Amount, AA Date, BE Status
- TS Amount, TS Date, TS Status
- DTP Amount, DTP Date, DTP Status
- Closing Date, Opened Date, Agency Name
- Proposal Status, Approved Amount, App. Date
- LOA Date, WO Date
- Column AC (Status), Route Type, Year, Time

**Date Format**: `DD.MM.YYYY` (e.g., 21.11.2024)

---

## 🔧 Configuration

### Customizing the Dashboard

**Change Login Credentials** (`frontend/src/components/dashboard/Login.js`):
```javascript
if (username === 'YourUsername' && password === 'YourPassword') {
  // Login logic
}
```

**Update Google Sheet URL** (`frontend/src/utils/constants.js`):
```javascript
export const PREDEFINED_SHEET_URL = 'YOUR_SHEET_URL';
```

**Modify Alert Thresholds** (`frontend/src/App.js`):
```javascript
// Bid Validity Expiring threshold
if (daysRemaining > 0 && daysRemaining <= 30) { /* ... */ }

// Stuck at Govt threshold
if (daysDiff > 30) { /* ... */ }
```

---

## 📝 Key Formulas & Logic

### Status Calculation Hierarchy
1. **LOA-WO Level** - If Proposal Status = TA with Column AC = "Not Started"
2. **Tender Level** - If DTP Status = DTP and Proposal Status = D
3. **Tender Approvals** - If DTP Status = DTP and Proposal Status = D/C/G (with agency)
4. **DTP Phase** - If TS Status = TS or DTP Status = D/C/G
5. **TS Phase** - If TS Status = D/C/G
6. **BE Phase** - If BE Status = D/C/G/AA

### Red Alert Priorities
```
P0.5: Bid Validity Crossed (expired tenders)
P1:   Bid Validity Expiring (<30 days)
P2:   Stuck at Govt - BE/TS/DTP/Proposal (>30 days)
```

### Date Parsing
- Supports: `DD.MM.YYYY`, Excel serial dates, ISO strings
- Automatically handles various formats from Google Sheets

---

## 🧪 Testing

The application has been thoroughly tested:
- ✅ Login authentication flow
- ✅ Dashboard rendering with all stat cards
- ✅ Red Alerts calculation and priority sorting
- ✅ Project Details view with sticky header
- ✅ Data Table with column filters
- ✅ Google Sheets CSV import
- ✅ Division filtering
- ✅ Navigation between all views

---

## 📦 Deployment

### Frontend Deployment (Netlify/Vercel)

1. **Build the production bundle**:
```bash
cd frontend
yarn build
```

2. **Deploy** the `build/` folder to:
   - **Netlify**: Drag & drop to Netlify
   - **Vercel**: `vercel deploy`
   - **GitHub Pages**: Push to gh-pages branch

3. **Update environment variables** on hosting platform:
```
REACT_APP_BACKEND_URL=https://your-backend.com
```

---

## 🛠️ Troubleshooting

### Issue: Data not loading
- **Check**: Google Sheet is public (Anyone with link = Viewer)
- **Verify**: Sheet URL is correct in dashboard
- **Test**: Try exporting sheet as CSV and verify data format

### Issue: Dates showing "Invalid Date"
- **Check**: Date format is DD.MM.YYYY (e.g., 21.11.2024)
- **Verify**: No extra spaces or special characters in date cells
- **Fix**: Update date format in Google Sheet

### Issue: Login not working
- **Check**: Credentials are `SRayka` / `123456`
- **Clear**: Browser cache and localStorage
- **Try**: Incognito/private browsing mode

### Issue: Frontend not starting
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
yarn install
yarn start
```

---

## 🤝 Contributing

This dashboard was built for the Superintending Engineer's office. To customize:

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

---

## 📄 License

This project is for internal use by the R&B Circle No. 2 office, Rajkot.

---

## 📞 Support

For questions or issues:
- **Developer**: E1 Agent (Emergent Labs)
- **Documentation**: See `REFACTORING_SUMMARY.md` and `RED_ALERTS_DOCUMENTATION.md`
- **Date**: December 2025

---

## 🙏 Acknowledgments

Built with:
- React ecosystem and modern web technologies
- Shadcn UI component library
- Google Sheets for data source
- Emergent AI development platform

---

**Dashboard Version**: 2.0 (Refactored)  
**Last Updated**: December 30, 2025  
**Status**: Production Ready ✅
