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

  // Firewood
  { id: 'rm-fw-1', name: 'Wood', category: 'firewood', unit: 'kg', minStock: 5000 },
  { id: 'rm-fw-2', name: 'Biocoal', category: 'firewood', unit: 'kg', minStock: 3000 },
];

export const PULP_MILL_CHEMICALS = [
  'DSR', 'WSR', 'Hydrogen Peroxide', 'Hypo', 'Bleaching Powder', 'Caustic', 'OBA', 'M Violet', 'Deformer'
];

export const MACHINE_CHEMICALS = [
  'PEO', 'Deformer', 'HCL', 'MG Release', 'MG Coating', 'Washing Powder', 'Caustic'
];

export const PRODUCTS = [
  { id: 'prod-1', name: 'Napkin Tissue', label: 'A) NAPKIN TISSUE', gsmOptions: [14, 16, 18], sizeOptions: ['30cm', '33cm', '40cm'], plyOptions: [1, 2], trackDia: true, fields: ['gsm', 'size', 'ply', 'dia'] },
  { id: 'prod-2', name: 'Toilet Tissue', label: 'B) TOILET TISSUE', gsmOptions: [15, 17, 19], sizeOptions: ['10cm'], plyOptions: [2, 3], trackDia: false, fields: ['gsm', 'size'] },
  { id: 'prod-3', name: 'KT', label: 'C) KT', gsmOptions: [18, 20, 22], sizeOptions: ['20cm', '23cm'], plyOptions: [1, 2], trackDia: false, fields: ['gsm', 'size', 'ply'] },
  { id: 'prod-4', name: 'HRT', label: 'D) HRT', gsmOptions: [20, 22, 24], sizeOptions: ['20cm', '25cm'], plyOptions: [1, 2], trackDia: false, fields: ['gsm', 'size', 'ply'] },
  { id: 'prod-5', name: 'Napkin B Grade', label: 'E) NAPKIN B GRADE', gsmOptions: [14, 16, 18], sizeOptions: ['30cm', '33cm'], plyOptions: [1, 2], trackDia: true, fields: ['gsm', 'size', 'ply', 'dia'] },
  { id: 'prod-6', name: 'Toilet B Grade', label: 'F) TOILET B GRADE', gsmOptions: [15, 17, 19], sizeOptions: ['10cm'], plyOptions: [2, 3], trackDia: false, fields: ['gsm', 'size'] },
  { id: 'prod-7', name: 'KT B Grade', label: 'G) KT B GRADE', gsmOptions: [18, 20, 22], sizeOptions: ['20cm', '23cm'], plyOptions: [1, 2], trackDia: false, fields: ['gsm', 'size', 'ply'] },
];

export const PARTIES = [
  'Surat Paper Mart',
  'Apex Packaging Pvt Ltd',
  'Metro Tissue Suppliers',
  'Royal Hygiene Crafts',
  'Shree Ram Convertors',
  'Vardhman Hygiene Products'
];

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
