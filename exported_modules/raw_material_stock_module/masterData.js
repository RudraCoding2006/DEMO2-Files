// Raw Materials Master Data Definition
export const RAW_MATERIALS = [
  // Waste Paper
  { id: 'indian_tissue_waste', name: 'Indian Tissue Waste', category: 'waste_paper', unit: 'kg', minStock: 5000 },
  { id: 'imported_tissue_waste', name: 'Imported Tissue Waste', category: 'waste_paper', unit: 'kg', minStock: 10000 },
  { id: 'smk', name: 'SMK', category: 'waste_paper', unit: 'kg', minStock: 2000 },
  { id: 'cupstock', name: 'Cupstock', category: 'waste_paper', unit: 'kg', minStock: 3000 },
  { id: 'pulp_sheet', name: 'Pulp Sheet', category: 'waste_paper', unit: 'kg', minStock: 4000 },
  { id: 'silicon', name: 'Silicon', category: 'waste_paper', unit: 'kg', minStock: 1000 },
  { id: 'broke', name: 'Broke', category: 'waste_paper', unit: 'kg', minStock: 2000 },

  // Chemicals
  { id: 'dsr', name: 'DSR (Dry Strength Resin)', category: 'chemical', unit: 'kg', minStock: 500 },
  { id: 'wsr', name: 'WSR (Wet Strength Resin)', category: 'chemical', unit: 'kg', minStock: 500 },
  { id: 'hydrogen_peroxide', name: 'Hydrogen Peroxide (H2O2)', category: 'chemical', unit: 'kg', minStock: 1000 },
  { id: 'hypo', name: 'Hypo (Sodium Hypochlorite)', category: 'chemical', unit: 'Ltr', minStock: 800 },
  { id: 'bleaching_powder', name: 'Bleaching Powder', category: 'chemical', unit: 'kg', minStock: 1000 },
  { id: 'caustic', name: 'Caustic Soda (Lye/Flakes)', category: 'chemical', unit: 'kg', minStock: 1500 },
  { id: 'oba', name: 'OBA (Optical Brightening Agent)', category: 'chemical', unit: 'kg', minStock: 300 },
  { id: 'm_violet', name: 'M Violet (Dye)', category: 'chemical', unit: 'kg', minStock: 100 },
  { id: 'washing_powder', name: 'Washing Powder', category: 'chemical', unit: 'kg', minStock: 200 },
  { id: 'flock_100_liq', name: 'Flock 100 Liq', category: 'chemical', unit: 'Ltr', minStock: 400 },
  { id: 'flock_master', name: 'Flock Master', category: 'chemical', unit: 'kg', minStock: 300 },
  { id: 'peo', name: 'PEO (Polyethylene Oxide)', category: 'chemical', unit: 'kg', minStock: 250 },
  { id: 'deformer', name: 'Deformer (Defoamer)', category: 'chemical', unit: 'kg', minStock: 300 },
  { id: 'hcl', name: 'HCL (Hydrochloric Acid)', category: 'chemical', unit: 'Ltr', minStock: 500 },
  { id: 'mg_release', name: 'MG Release Chemical', category: 'chemical', unit: 'kg', minStock: 400 },
  { id: 'mg_coating', name: 'MG Coating Chemical', category: 'chemical', unit: 'kg', minStock: 400 },
  { id: 'ro_chemical', name: 'RO Antiscalant Chemical', category: 'chemical', unit: 'Ltr', minStock: 200 },

  // Firewood / Fuel
  { id: 'wood', name: 'Firewood (Lathi/Logs)', category: 'firewood', unit: 'kg', minStock: 20000 },
  { id: 'biocoal', name: 'Biocoal Briquettes', category: 'firewood', unit: 'kg', minStock: 15000 },
];
