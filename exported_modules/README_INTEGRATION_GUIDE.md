# 📦 Saheb Paper Mill ERP — Standalone Modules Export Guide

This folder contains all **15 fully functional, production-ready ERP modules** extracted from **Saheb Paper Mill ERP DEMO2**. You can plug these modules directly into **DEMO1**, **DEMO3**, or any other React / Vite / Next.js web or desktop application.

---

## 📁 Exported Directory Structure

```text
exported_modules/
├── modules/              # All 15 ERP Modules (JSX Components)
│   ├── index.js          # Barrel exporter for 1-line imports
│   ├── dashboard/        # Executive ERP Dashboard
│   ├── raw-material/     # Waste Paper, Chemicals & Firewood Inward
│   ├── pulp-mill/        # Hydrapulper, Cooking & Bleaching Log
│   ├── machine/          # Paper Machine PM-1 Production Log
│   ├── rewinder/         # Slitter Rewinder & Reel Entry Log
│   ├── boiler/           # Boiler & Thermic Fluid Heater
│   ├── etp/              # Effluent Treatment Plant (ETP)
│   ├── electricity/      # Substation, Solar & Electricity Log
│   ├── pending-order/    # Customer Orders & Production Planning
│   ├── finish-stock/     # Finished Reel Stock & Inventory
│   ├── dispatch/         # Delivery Challan & Dispatch Invoices
│   ├── store/            # Spares & Maintenance Inventory
│   ├── reports/          # Daily Production & Consumption Reports
│   ├── reports-monthly/  # Monthly Analytics & Trend Reports
│   └── reports-yearly/   # Annual Comparative Audit Reports
├── components/           # Common UI Components, Navigation & Modals
├── data/                 # Centralized ERP Store & State Provider
├── engine/               # Calculation & GSM Formula Engines
└── utils/                # PDF, Excel, Printer & QR Code Exporters
```

---

## 🚀 How to Use Modules in Another DEMO Project

### Option A: Import via Unified Exporter (`index.js`)

In any page or component of your target project:

```javascript
import { 
  DashboardModule, 
  RawMaterialModule, 
  PulpMillModule, 
  MachineModule, 
  RewinderModule, 
  BoilerModule, 
  EtpModule, 
  ElectricityModule, 
  PendingOrderModule, 
  FinishStockModule, 
  DispatchModule, 
  StoreModule, 
  ReportsModule,
  MonthlyReportsModule,
  YearlyReportsModule
} from './exported_modules/modules';
```

### Option B: Copy Folder to Target Project

Simply copy the `modules/` folder into your new project's `src/` directory:

```bash
# Example for Windows PowerShell:
Copy-Item -Recurse -Force 'E:\ZZSAHED DEMO2\DEMO2 Files\exported_modules\modules' 'E:\YOUR_OTHER_DEMO\src\modules'
```

---

## 📊 List of Included ERP Modules

| Module Name | Description | Key Features |
| :--- | :--- | :--- |
| **`DashboardModule`** | Executive Overview | Real-time production KPI cards, charts & low stock alerts |
| **`RawMaterialModule`** | Raw Material Management | Inward entry for Waste Paper, Chemicals & Firewood |
| **`PulpMillModule`** | Pulp Mill Operations | Hydrapulper batch log, chemical dosing & downtime logs |
| **`MachineModule`** | Paper Machine PM-1 | Logged weight, machine speed, moisture & GSM tracking |
| **`RewinderModule`** | Slitter Rewinder | Reel entry table, total weight calculator & reel tags |
| **`BoilerModule`** | Boiler Plant Log | Steam pressure, fuel consumption & temperature logs |
| **`EtpModule`** | ETP Plant Log | Treated water output, pH, COD & sludge tracking |
| **`ElectricityModule`** | Energy Metering | Electricity consumption, solar generation & power factor |
| **`PendingOrderModule`** | Customer Orders | Order booking, party-wise tracking & status badges |
| **`FinishStockModule`** | Finished Warehouse | Ready reel inventory, GSM filtering & size stocks |
| **`DispatchModule`** | Dispatch & Delivery | Delivery Challans, party billing & gate pass printing |
| **`StoreModule`** | Maintenance Store | Spares inventory, reorder level alerts & issue logs |
| **`ReportsModule`** | Daily Reports | Production summaries & material consumption reports |
| **`MonthlyReportsModule`**| Monthly Analytics | Month-wise production trends & financial comparative charts |
| **`YearlyReportsModule`** | Yearly Comparative | Year-on-year growth analysis & annual audit logs |

---

## 🎨 Theme & Color Preset
- **Primary Color Standard**: `#cf8730` (Golden Warm Amber)
- **Background Dark Mode**: `#0b0e1b`
- **Tailwind Version Compatible**: Tailwind v3 & v4 compatible
