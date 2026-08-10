# Saheb Paper Mill ERP (Unit 1 Tissue Line) — Complete System & Data Specification

> **Purpose of Document**: This comprehensive specification contains the complete architecture, data models, business calculations, component structures, and UI/UX design specifications for **Saheb Paper Mill DEMO2 ERP**. 
> 
> *You can provide this document to AI models (such as Claude AI) to analyze system context, design new features, or generate precise implementation prompts.*

---

## 1. Executive Summary & Tech Stack

**Saheb Paper Pvt. Ltd. (Unit 1 Tissue Line)** is an industrial-grade Manufacturing Resource Planning (MRP) and Enterprise Resource Planning (ERP) web application tailored for paper manufacturing operations.

### **Technology Stack**
- **Core Framework**: React 18 (Vite JS)
- **Styling**: TailwindCSS v4 with custom HSL/HEX color systems
- **Data Visualization**: Recharts (ComposedChart, Bar, Area, PieChart, LabelList, Custom Tooltip)
- **Icons**: Lucide React Icons
- **State & Persistence Engine**: Custom Centralized Reactive Store with LocalStorage fallback (`src/data/storage.js`)
- **Physics & Motion**: Hardware-accelerated CSS GPU transforms (`transform-gpu`, `cubic-bezier(0.25, 0.1, 0.25, 1)`)

---

## 2. Directory Architecture & File Structure

```
DEMO2 Files/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx                        # Main Application Shell & Module Router
│   ├── index.css                      # Global Styles, Micro-animations & CSS Variables
│   ├── data/
│   │   ├── masterData.js              # Raw Materials, Products, User Roles, Parties
│   │   ├── mockData.js                # Initial Demo Seed Data
│   │   └── storage.js                 # Centralized Reactive Store & LocalStorage Syncer
│   ├── engine/
│   │   └── productionEngine.js        # Business Logic & Machine Hour Calculators
│   ├── utils/
│   │   └── formatters.js              # Weight, Ton, Currency, and Date Formatters
│   ├── components/
│   │   ├── common/
│   │   │   ├── StatCard.jsx           # Animated Top Metric Stat Boxes (Solid Colors)
│   │   │   ├── ConfirmationModal.jsx  # Reusable Danger/Warning Action Dialog
│   │   │   └── ScrollToTopButton.jsx  # Floating Instant Scroll-Up Control
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx            # Desktop Hover-Expand / Mobile Rail
│   │   │   └── TopBar.jsx             # Sticky Top Header, Search, Date Filters, Profile
│   │   └── modals/
│   │       └── UserManagementModal.jsx# Admin User Access & Permissions Manager
│   └── modules/
│       ├── dashboard/DashboardModule.jsx       # Executive Overview & Analytics
│       ├── raw-material/RawMaterialModule.jsx   # Waste Paper, Chemical & Fuel Inventory
│       ├── pulp-mill/PulpMillModule.jsx         # Hydrapulper Batch Logging & Chemicals
│       ├── machine/PaperMachineModule.jsx       # Jumbo Roll Production & Downtimes
│       ├── rewinder/RewinderModule.jsx         # Finished Slitted Reels Logging
│       ├── boiler/BoilerModule.jsx             # Steam Pressure & Biocoal Consumption
│       ├── etp/EtpModule.jsx                   # ETP Effluent Water Treatment
│       ├── electricity/ElectricityModule.jsx   # Solar & HT Grid Power Telemetry
│       ├── pending-order/PendingOrderModule.jsx# Customer Sales Orders Tracking
│       ├── finish-stock/FinishStockModule.jsx  # Net Available Reel Inventory by GSM/Size
│       ├── dispatch/DispatchModule.jsx         # Gate Pass & Delivery Receipts
│       ├── store/StoreModule.jsx               # Spare Parts & Mechanical Spares
│       └── reports/ReportsModule.jsx           # Aggregated Shift & Daily Production Summary
```

---

## 3. Data Models & Master Schemas

### 3.1 Raw Materials Master Data (`RAW_MATERIALS`)
Categorized into Waste Paper, Chemicals, and Firewood:

```javascript
export const RAW_MATERIALS = [
  // Waste Paper
  { id: 'rm-wp-1', name: 'Indian Tissue Waste', category: 'waste_paper', unit: 'kg', minStock: 2000 },
  { id: 'rm-wp-2', name: 'Imported Tissue Waste', category: 'waste_paper', unit: 'kg', minStock: 1500 },
  { id: 'rm-wp-3', name: 'SMK', category: 'waste_paper', unit: 'kg', minStock: 1000 },
  { id: 'rm-wp-4', name: 'Cupstock', category: 'waste_paper', unit: 'kg', minStock: 1000 },
  { id: 'rm-wp-5', name: 'Pulp Sheet', category: 'waste_paper', unit: 'kg', minStock: 800 },
  { id: 'rm-wp-6', name: 'Silicon', category: 'waste_paper', unit: 'kg', minStock: 500 },
  { id: 'rm-wp-7', name: 'Broke', category: 'waste_paper', unit: 'kg', minStock: 500 },

  // Chemical
  { id: 'rm-ch-1', name: 'DSR', category: 'chemical', unit: 'kg', minStock: 250 },
  { id: 'rm-ch-2', name: 'WSR', category: 'chemical', unit: 'kg', minStock: 300 },
  { id: 'rm-ch-3', name: 'Hydrogen Peroxide', category: 'chemical', unit: 'ltr', minStock: 200 },
  { id: 'rm-ch-4', name: 'Hypo', category: 'chemical', unit: 'ltr', minStock: 300 },
  { id: 'rm-ch-5', name: 'Bleaching Powder', category: 'chemical', unit: 'kg', minStock: 400 },
  { id: 'rm-ch-6', name: 'Caustic', category: 'chemical', unit: 'kg', minStock: 500 },
  { id: 'rm-ch-7', name: 'OBA', category: 'chemical', unit: 'kg', minStock: 100 },
  { id: 'rm-ch-8', name: 'M Violet', category: 'chemical', unit: 'ltr', minStock: 50 },
  { id: 'rm-ch-9', name: 'Washing Powder', category: 'chemical', unit: 'kg', minStock: 150 },
  { id: 'rm-ch-10', name: 'Flock 100 Liq (Sedicell)', category: 'chemical', unit: 'ltr', minStock: 100 },
  { id: 'rm-ch-11', name: 'Flock Master (Solid)', category: 'chemical', unit: 'kg', minStock: 100 },
  { id: 'rm-ch-12', name: 'PEO', category: 'chemical', unit: 'kg', minStock: 150 },
  { id: 'rm-ch-13', name: 'Deformer', category: 'chemical', unit: 'ltr', minStock: 120 },
  { id: 'rm-ch-14', name: 'HCL', category: 'chemical', unit: 'ltr', minStock: 200 },
  { id: 'rm-ch-15', name: 'MG Release', category: 'chemical', unit: 'kg', minStock: 80 },
  { id: 'rm-ch-16', name: 'MG Coating', category: 'chemical', unit: 'kg', minStock: 80 },
  { id: 'rm-ch-17', name: 'RO Chemical', category: 'chemical', unit: 'kg', minStock: 100 },

  // Firewood / Fuel
  { id: 'rm-fw-1', name: 'Wood', category: 'firewood', unit: 'kg', minStock: 5000 },
  { id: 'rm-fw-2', name: 'Biocoal', category: 'firewood', unit: 'kg', minStock: 3000 },
];
```

### 3.2 Tissue Paper Products Master Data (`PRODUCTS`)

```javascript
export const PRODUCTS = [
  { id: 'prod-1', name: 'Napkin Tissue', label: 'A) NAPKIN TISSUE', gsmOptions: [14, 16, 18], sizeOptions: ['30x30 cm', '33x33 cm', '40x40 cm'], plyOptions: [1, 2], trackDia: true, fields: ['gsm', 'size', 'ply', 'dia'] },
  { id: 'prod-2', name: 'Toilet Tissue', label: 'B) TOILET TISSUE', gsmOptions: [15, 17, 19], sizeOptions: ['10x10 cm', '10x12 cm'], plyOptions: [2, 3], trackDia: false, fields: ['gsm', 'size'] },
  { id: 'prod-3', name: 'KT', label: 'C) KT', gsmOptions: [18, 20, 22], sizeOptions: ['20x20 cm', '23x23 cm'], plyOptions: [1, 2], trackDia: false, fields: ['gsm', 'size', 'ply'] },
  { id: 'prod-4', name: 'HRT', label: 'D) HRT', gsmOptions: [20, 22, 24], sizeOptions: ['20x22 cm', '25x25 cm'], plyOptions: [1, 2], trackDia: false, fields: ['gsm', 'size', 'ply'] },
  { id: 'prod-5', name: 'Napkin B Grade', label: 'E) NAPKIN B GRADE', gsmOptions: [14, 16, 18], sizeOptions: ['30x30 cm', '33x33 cm'], plyOptions: [1, 2], trackDia: true, fields: ['gsm', 'size', 'ply', 'dia'] },
  { id: 'prod-6', name: 'Toilet B Grade', label: 'F) TOILET B GRADE', gsmOptions: [15, 17, 19], sizeOptions: ['10x10 cm', '10x12 cm'], plyOptions: [2, 3], trackDia: false, fields: ['gsm', 'size'] },
  { id: 'prod-7', name: 'KT B Grade', label: 'G) KT B GRADE', gsmOptions: [18, 20, 22], sizeOptions: ['20x20 cm', '23x23 cm'], plyOptions: [1, 2], trackDia: false, fields: ['gsm', 'size', 'ply'] },
];
```

### 3.3 User Roles & Permissions (`USER_ROLES`)

```javascript
export const USER_ROLES = [
  { id: 'admin', name: 'Admin / Management' },
  { id: 'store_keeper', name: 'Store Keeper' },
  { id: 'pulp_mill', name: 'Pulp Mill Operator' },
  { id: 'machine', name: 'Machine Operator' },
  { id: 'rewinder', name: 'Rewinder Operator' },
  { id: 'boiler', name: 'Boiler Operator' },
  { id: 'etp', name: 'ETP Operator' },
  { id: 'electricity', name: 'Electricity In-Charge' },
  { id: 'dispatch', name: 'Dispatch Manager' },
];
```

---

## 4. Centralized State Engine & Subscriptions (`storage.js`)

The app uses an **In-Memory Reactive Event Store** backed by `localStorage` persistence under key `saheb_paper_mill_demo2_state_v1`.

### Key State Properties:
- `selectedDate`: Active Date String (Format: `YYYY-MM-DD`, e.g., `'2026-07-25'`)
- `timeRange`: Active Timeframe Filter (`'today'`, `'week'`, `'month'`, `'year'`, `'all'`)
- `activeUserId`: ID of active logged-in worker
- `users`: Array of user accounts with `roleId` and `allowedModules`
- `machineLogs`: Object keyed by date storing Jumbo Roll production logs & downtimes
- `rewinderReels`: Array of slitted finished reel logs
- `dispatches`: Array of dispatch gate passes
- `inwardLogs`: Stock inward receipts
- `pulpLogs`: Hydrapulper chemical & batch logs
- `boilerLogs`: Steam pressure & biocoal consumption logs
- `etpLogs`: Effluent water pH, TSS, & discharge telemetry
- `electricityLogs`: Solar & grid power consumption
- `pendingOrders`: Customer purchase orders
- `storeItems`: Spare parts inventory
- `notifications`: System warnings, low stock alerts, & machine downtime alerts

---

## 5. Key UI/UX Implementations & Animation Specifications

### 5.1 Left Sidebar Rail (`Sidebar.jsx`)
- **Collapsed Width**: `w-20` (80px) showing centered action icons.
- **Expanded Width**: `w-64` (256px) showing full brand header ("SAHEB PAPER") and module title labels.
- **Physics**:
  - `0ms` instant hover-enter expansion.
  - `150ms (0.15 sec)` mouse-off auto-close delay (`leaveTimerRef.current = setTimeout(..., 150)`).
  - Pure CSS Opacity Transitions (`opacity-100 duration-200 delay-75` on expand, `opacity-0 duration-120` on collapse) to eliminate text truncation clipping.

### 5.2 Header Bar (`TopBar.jsx`)
- **Positioning**: `sticky top-0 z-30 w-full h-16 bg-white border-b border-[#EEF0F5] shadow-xs`.
- **Attached Behavior**: Connected 100% flush to the sidebar border with **0.00px gap** across all screen sizes.
- **Timeframe Selector**: Segmented pill buttons (`Day`, `Week`, `Month`, `All`).
- **Date Selector**: Interactive Indian Date Picker dropdown (`[ 25-Jul-2026 📅 ]`).

### 5.3 Animated Stat Cards (`StatCard.jsx`)
- **Design Aesthetic**: Clean, solid modern colors (No Gradients):
  - **Indigo**: `bg-[#5B4FE9]` (Total Production)
  - **Emerald**: `bg-[#10B981]` (Raw Material Inventory)
  - **Amber**: `bg-[#F59E0B]` (Machine Uptime)
  - **Blue**: `bg-[#3B82F6]` (Dispatched)
- **Option 1 Grow/Shrink Animation**:
  - Sidebar Expanded (`isExpanded = true`): `scale-[1.02] min-h-[160px] p-6 sm:p-7 shadow-2xl` with larger `text-3xl lg:text-4xl` values.
  - Sidebar Collapsed (`isExpanded = false`): `scale-100 min-h-[135px] p-4 sm:p-5 shadow-lg` with compact `text-2xl lg:text-3xl` values.
  - Easing: `transition-all duration-300 ease-[cubic-bezier(0.25, 0.1, 0.25, 1)] transform-gpu`.
- **Unit Suffix Rules (`formatKgOrTonForRange`)**:
  - When **Day (`today`)** is selected: Displays unit suffix `"Tons"` (e.g., `6.30 Tons`, `3932.92 Tons`, `2.50 Tons`).
  - When **Week (`week`)**, **Month (`month`)**, **Year (`year`)**, or **All Time (`all`)** is selected: **Removes `"Tons"` suffix** and displays digits ONLY (e.g., `6.30`, `3932.92`, `2.50`).

### 5.4 Production Analytics Chart (`DashboardModule.jsx`)
- **Chart Component**: Recharts `<ComposedChart>` featuring `<Bar>`, `<Area>`, and `<LabelList>`.
- **Chart Label Formatting (`LabelList`)**:
  - `formatter={(val) => timeRange === 'today' ? `${val} Tons` : `${val}`}`
  - Shows `"Tons"` on Day view, and **digits ONLY** on Week/Month/Year/All views.
- **Interactive Tooltip (`<Tooltip />`)**:
  - `isAnimationActive={true}`, `animationDuration={200}`, `animationEasing="ease-out"`.
  - `wrapperStyle={{ pointerEvents: 'none', outline: 'none' }}`.
  - Card `div` uses `transition-all duration-200` without `zoom-in-95` to prevent any top-left `(0,0)` origin jumping.
  - Date & Value matching: 100% microsecond accuracy (e.g., hovering on `07-21` displays `DATE: 07-21` and `7.99`).

---

## 6. Business Logic & Calculation Engines

### 6.1 Weight & Unit Conversion (`src/utils/formatters.js`)

```javascript
export const formatKgOrTon = (kgValue) => {
  const kg = Number(kgValue || 0);
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} Tons`;
  }
  return `${kg.toLocaleString()} kg`;
};

export const formatKgOrTonForRange = (kgValue, timeRange = 'today') => {
  const kg = Number(kgValue || 0);
  if (timeRange === 'today') {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(2)} Tons`;
    }
    return `${kg.toLocaleString()} kg`;
  } else {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(2)}`;
    }
    return `${kg.toLocaleString()}`;
  }
};
```

### 6.2 Machine Hours & Running Calculation (`src/engine/productionEngine.js`)

Calculates net operational machine hours per day after deducting logged downtime intervals:

```javascript
export function calculateMachineRunningHours(rolls = [], downtimes = []) {
  const totalDowntimeMinutes = downtimes.reduce((sum, d) => sum + (Number(d.durationMinutes) || 0), 0);
  const totalDowntimeHours = totalDowntimeMinutes / 60;
  const netRunningHours = Math.max(0, 24 - totalDowntimeHours);
  return {
    totalDowntimeMinutes,
    totalDowntimeHours: totalDowntimeHours.toFixed(1),
    netRunningHours: netRunningHours.toFixed(1)
  };
}
```

---

## 7. How to Use This Specification File with AI (Prompt Guidance)

If you are uploading this file to Claude AI or another LLM to request new features or modifications:

1. **Upload / Attach** this document: `DEMO2_FULL_SYSTEM_SPEC.md`.
2. **Ask Claude AI**: 
   > *"Based on the attached `DEMO2_FULL_SYSTEM_SPEC.md` specification for Saheb Paper Mill ERP, please generate the exact code or step-by-step instructions for [YOUR DESIRED NEW FEATURE / UPDATE]." *
3. **Copy Claude AI's prompt or code** and paste it directly into our chat here, and I will execute it seamlessly!

---
*Created & Maintained for Saheb Paper Pvt. Ltd. (Unit 1 Tissue Line).*
