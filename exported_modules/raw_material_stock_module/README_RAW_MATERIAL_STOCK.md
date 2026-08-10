# 📦 Standalone Raw Material Stock Module Guide

This folder contains the complete, standalone **Raw Material Stock & Inward Management Module** for Saheb Paper Mill ERP.

---

## 📁 Files Included

```text
raw_material_stock_module/
├── RawMaterialModule.jsx   # Main React component with UI tables, filters & inward modal
├── masterData.js           # Master list of Waste Paper (7 types), Chemicals (17 types) & Firewood (2 types)
└── README_RAW_MATERIAL_STOCK.md # Quick integration guide
```

---

## ⚡ How to Import in Another DEMO

Simply copy the `raw_material_stock_module/` folder into your target project's `src/modules/` directory:

```javascript
import { RawMaterialModule } from './modules/raw_material_stock_module/RawMaterialModule';

// Inside your main App component:
<RawMaterialModule state={erpState} />
```

---

## 📊 Features & Automatic Business Rules

1. **Auto Inward Stock Increase**: Adding an inward entry (supplier delivery / PO truck) automatically increases that item's current stock weight.
2. **Auto Consumption Stock Decrease**: Dosing chemicals or feeding waste paper in the Pulp Mill automatically deducts raw material inventory.
3. **Low Stock Alerts**: Highlights items below safety threshold in red warning pills (`lowStockCount`).
4. **Category Filtering**: Instant tabs for **Waste Paper**, **Chemicals**, and **Firewood**.
5. **Mobile-Responsive**: Rendered with stacked card layouts on small mobile screens and rich data tables on desktop screens.
