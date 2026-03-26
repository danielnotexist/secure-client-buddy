// ===== Types =====

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface Service {
  id: string;
  name: string;
  type: 'backup' | 'dr' | 'email-security' | 'edr' | 'mdr' | 'dlp' | 'rmm' | 'firewall' | 'siem' | 'soc' | 'pentest' | 'consulting' | 'other';
  status: 'active' | 'expired' | 'pending';
  vendor: string;
  licenseCount: number;
  startDate: string;
  endDate: string;
  price: number;
  notes: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string; // flexible: שרת, פיירוול, סוויצ', תחנת עבודה, נקודת גישה, UPS, NAS, מדפסת, אחר
  model: string;
  manufacturer: string;
  serialNumber: string;
  ip: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance' | 'needs-update' | 'retired';
  purchaseDate: string;
  warrantyEnd: string;
  notes: string;
  properties: Record<string, string>; // custom key-value pairs
}

export interface CustomerDocument {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
  uploadedAt: string;
  category: 'contract' | 'invoice' | 'diagram' | 'photo' | 'report' | 'other';
  notes: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  website: string;
  address: string;
  city: string;
  status: 'active' | 'inactive' | 'trial' | 'prospect';
  monthlyPayment: number;
  contractStart: string;
  contractEnd: string;
  notes: string;
  createdAt: string;
  avatarUrl: string;
  contacts: Contact[];
  services: Service[];
  assets: Asset[];
  documents: CustomerDocument[];
  tickets: Ticket[];
}

// ===== Labels =====

const SERVICE_TYPE_LABELS: Record<Service['type'], string> = {
  'backup': 'גיבוי',
  'dr': 'התאוששות מאסון',
  'email-security': 'אבטחת מיילים',
  'edr': 'EDR',
  'mdr': 'MDR',
  'dlp': 'DLP',
  'rmm': 'RMM',
  'firewall': 'פיירוול',
  'siem': 'SIEM',
  'soc': 'SOC',
  'pentest': 'מבדקי חדירה',
  'consulting': 'ייעוץ',
  'other': 'אחר',
};

export const SERVICE_TYPES = Object.keys(SERVICE_TYPE_LABELS) as Service['type'][];
export const getServiceTypeLabel = (type: Service['type']) => SERVICE_TYPE_LABELS[type];

export const ASSET_CATEGORIES = [
  'שרת', 'פיירוול', 'סוויצ\'', 'נתב', 'תחנת עבודה', 'לפטופ',
  'נקודת גישה', 'UPS', 'NAS', 'SAN', 'מדפסת', 'טלפון IP', 'מצלמה', 'אחר'
];

export const DOCUMENT_CATEGORIES: { value: CustomerDocument['category']; label: string }[] = [
  { value: 'contract', label: 'חוזה' },
  { value: 'invoice', label: 'חשבונית' },
  { value: 'diagram', label: 'תרשים רשת' },
  { value: 'photo', label: 'תמונה' },
  { value: 'report', label: 'דוח' },
  { value: 'other', label: 'אחר' },
];

export const INDUSTRIES = [
  'טכנולוגיה', 'משפטים', 'רפואה', 'חינוך', 'פיננסים', 'קמעונאות',
  'ייצור', 'נדל"ן', 'ממשלה', 'תעשייה', 'מזון', 'תחבורה', 'אחר'
];

const STATUS_LABELS: Record<string, string> = {
  active: 'פעיל',
  inactive: 'לא פעיל',
  trial: 'ניסיון',
  prospect: 'פוטנציאלי',
  expired: 'פג תוקף',
  pending: 'ממתין',
  online: 'מחובר',
  offline: 'מנותק',
  maintenance: 'תחזוקה',
  'needs-update': 'דרוש עדכון',
  retired: 'פורק',
  open: 'פתוח',
  'in-progress': 'בטיפול',
  waiting: 'ממתין ללקוח',
  resolved: 'נפתר',
  closed: 'סגור',
};

export const TICKET_STATUSES: { value: Ticket['status']; label: string }[] = [
  { value: 'open', label: 'פתוח' },
  { value: 'in-progress', label: 'בטיפול' },
  { value: 'waiting', label: 'ממתין ללקוח' },
  { value: 'resolved', label: 'נפתר' },
  { value: 'closed', label: 'סגור' },
];

export const TICKET_PRIORITIES: { value: Ticket['priority']; label: string }[] = [
  { value: 'low', label: 'נמוך' },
  { value: 'medium', label: 'בינוני' },
  { value: 'high', label: 'גבוה' },
  { value: 'critical', label: 'קריטי' },
];

export const getStatusLabel = (status: string) => STATUS_LABELS[status] || status;

// ===== Helpers =====

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

const STORAGE_KEY = 'secureops-crm-customers';

// ===== Demo Data =====

const DEMO_CUSTOMERS: Customer[] = [
  {
    id: generateId(),
    name: 'חברת אלפא טכנולוגיות',
    industry: 'טכנולוגיה',
    website: 'https://alpha-tech.co.il',
    address: 'רחוב הברזל 30',
    city: 'תל אביב',
    status: 'active',
    monthlyPayment: 4500,
    contractStart: '2024-01-15',
    contractEnd: '2025-01-15',
    notes: 'לקוח VIP, דורש SLA מהיר. יש לתאם עם יוסי לפני כל שינוי.',
    createdAt: '2024-01-15',
    contacts: [
      { id: generateId(), name: 'יוסי כהן', role: 'מנהל IT', email: 'yossi@alpha-tech.co.il', phone: '050-1234567', isPrimary: true },
      { id: generateId(), name: 'רונית שמש', role: 'מנכ"לית', email: 'ronit@alpha-tech.co.il', phone: '050-7654321', isPrimary: false },
    ],
    services: [
      { id: generateId(), name: 'גיבוי שרתים', type: 'backup', status: 'active', vendor: 'Acronis', licenseCount: 5, startDate: '2024-01-15', endDate: '2025-01-15', price: 1500, notes: 'גיבוי יומי + שבועי' },
      { id: generateId(), name: 'EDR מתקדם', type: 'edr', status: 'active', vendor: 'CrowdStrike', licenseCount: 50, startDate: '2024-03-01', endDate: '2025-03-01', price: 2000, notes: '50 תחנות' },
      { id: generateId(), name: 'אבטחת מיילים', type: 'email-security', status: 'active', vendor: 'Perception Point', licenseCount: 60, startDate: '2024-01-15', endDate: '2025-01-15', price: 1000, notes: '' },
    ],
    assets: [
      { id: generateId(), name: 'DC-01', category: 'שרת', model: 'Dell PowerEdge R740', manufacturer: 'Dell', serialNumber: 'SN-001', ip: '192.168.1.10', location: 'חדר שרתים ראשי', status: 'online', purchaseDate: '2023-06-15', warrantyEnd: '2026-06-15', notes: 'Domain Controller ראשי', properties: { os: 'Windows Server 2022', ram: '64GB', storage: '2TB SSD' } },
      { id: generateId(), name: 'FS-01', category: 'שרת', model: 'HPE ProLiant DL380', manufacturer: 'HPE', serialNumber: 'SN-002', ip: '192.168.1.20', location: 'חדר שרתים ראשי', status: 'online', purchaseDate: '2022-03-01', warrantyEnd: '2025-03-01', notes: 'File Server', properties: { os: 'Windows Server 2019', ram: '32GB', storage: '8TB RAID' } },
      { id: generateId(), name: 'FW-Main', category: 'פיירוול', model: 'FortiGate 60F', manufacturer: 'Fortinet', serialNumber: 'FG-001', ip: '10.0.0.1', location: 'משרד ראשי', status: 'online', purchaseDate: '2023-01-01', warrantyEnd: '2026-01-01', notes: '', properties: { firmware: 'v7.4.1', interfaces: '10' } },
      { id: generateId(), name: 'SW-Core', category: 'סוויצ\'', model: 'Cisco Catalyst 9300', manufacturer: 'Cisco', serialNumber: 'CS-001', ip: '192.168.1.1', location: 'Rack A', status: 'online', purchaseDate: '2023-06-15', warrantyEnd: '2026-06-15', notes: 'Core switch 48 ports', properties: { ports: '48', poe: 'כן' } },
    ],
    documents: [],
  },
  {
    id: generateId(),
    name: 'משרד עורכי דין ברק',
    industry: 'משפטים',
    website: 'https://barak-law.co.il',
    address: 'שדרות רוטשילד 45',
    city: 'תל אביב',
    status: 'active',
    monthlyPayment: 2800,
    contractStart: '2024-04-10',
    contractEnd: '2025-04-10',
    notes: 'רגיש מאוד לנושא פרטיות ואבטחת מידע. חובה הצפנה על כל המכשירים.',
    createdAt: '2024-04-10',
    contacts: [
      { id: generateId(), name: 'דנה ברק', role: 'שותפה בכירה', email: 'dana@barak-law.co.il', phone: '052-9876543', isPrimary: true },
    ],
    services: [
      { id: generateId(), name: 'גיבוי ענן', type: 'backup', status: 'active', vendor: 'Veeam', licenseCount: 3, startDate: '2024-04-10', endDate: '2025-04-10', price: 800, notes: '' },
      { id: generateId(), name: 'DLP', type: 'dlp', status: 'active', vendor: 'Symantec', licenseCount: 25, startDate: '2024-04-10', endDate: '2025-04-10', price: 1200, notes: 'מניעת דליפת מידע' },
      { id: generateId(), name: 'MDR', type: 'mdr', status: 'active', vendor: 'SentinelOne', licenseCount: 25, startDate: '2024-05-01', endDate: '2025-05-01', price: 800, notes: '' },
    ],
    assets: [
      { id: generateId(), name: 'SRV-LAW', category: 'שרת', model: 'Azure VM B2s', manufacturer: 'Microsoft', serialNumber: '', ip: '10.10.1.5', location: 'Azure Cloud', status: 'online', purchaseDate: '2024-04-10', warrantyEnd: '', notes: 'שרת ניהול תיקים', properties: { os: 'Windows Server 2022', ram: '8GB' } },
      { id: generateId(), name: 'FW-Office', category: 'פיירוול', model: 'Sophos XGS 87', manufacturer: 'Sophos', serialNumber: 'SP-001', ip: '10.10.0.1', location: 'משרד תל אביב', status: 'online', purchaseDate: '2024-01-01', warrantyEnd: '2027-01-01', notes: '', properties: { firmware: 'v20.0' } },
    ],
    documents: [],
  },
  {
    id: generateId(),
    name: 'רשת מרכולים שפע',
    industry: 'קמעונאות',
    website: '',
    address: 'אזור תעשיה צפוני',
    city: 'חיפה',
    status: 'prospect',
    monthlyPayment: 0,
    contractStart: '',
    contractEnd: '',
    notes: 'פגישת היכרות התקיימה. מחכים להצעת מחיר.',
    createdAt: '2024-11-01',
    contacts: [
      { id: generateId(), name: 'אבי לוי', role: 'מנהל תפעול', email: 'avi@shefa-market.co.il', phone: '054-5551234', isPrimary: true },
    ],
    services: [],
    assets: [],
    documents: [],
  },
];

// ===== CRUD Operations =====

export function getCustomers(): Customer[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_CUSTOMERS));
      return DEMO_CUSTOMERS;
    }
    const parsed = JSON.parse(data);
    // Validate that data matches new schema - check first item has required fields
    if (Array.isArray(parsed) && parsed.length > 0 && (!parsed[0].contacts || !parsed[0].assets || !parsed[0].documents)) {
      // Old schema data - reset to demo
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_CUSTOMERS));
      return DEMO_CUSTOMERS;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_CUSTOMERS));
    return DEMO_CUSTOMERS;
  }
}

export function saveCustomers(customers: Customer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function getCustomerById(id: string): Customer | undefined {
  return getCustomers().find(c => c.id === id);
}

export function addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'contacts' | 'services' | 'assets' | 'documents'>): Customer {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: generateId(),
    createdAt: new Date().toISOString().split('T')[0],
    contacts: [],
    services: [],
    assets: [],
    documents: [],
  };
  customers.push(newCustomer);
  saveCustomers(customers);
  return newCustomer;
}

export function updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
  const customers = getCustomers();
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return undefined;
  customers[idx] = { ...customers[idx], ...updates };
  saveCustomers(customers);
  return customers[idx];
}

export function deleteCustomer(id: string) {
  const customers = getCustomers().filter(c => c.id !== id);
  saveCustomers(customers);
}

// Generic add/remove helpers
function addItemToCustomer<K extends 'contacts' | 'services' | 'assets' | 'documents'>(
  customerId: string, key: K, item: Omit<Customer[K][number], 'id'>
): Customer[K][number] | undefined {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return undefined;
  const newItem = { ...item, id: generateId() } as Customer[K][number];
  (customer[key] as Customer[K][number][]).push(newItem);
  saveCustomers(customers);
  return newItem;
}

function removeItemFromCustomer<K extends 'contacts' | 'services' | 'assets' | 'documents'>(
  customerId: string, key: K, itemId: string
) {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return;
  (customer[key] as { id: string }[]) = (customer[key] as { id: string }[]).filter(i => i.id !== itemId);
  saveCustomers(customers);
}

export const addContactToCustomer = (cid: string, item: Omit<Contact, 'id'>) => addItemToCustomer(cid, 'contacts', item);
export const addServiceToCustomer = (cid: string, item: Omit<Service, 'id'>) => addItemToCustomer(cid, 'services', item);
export const addAssetToCustomer = (cid: string, item: Omit<Asset, 'id'>) => addItemToCustomer(cid, 'assets', item);
export const addDocumentToCustomer = (cid: string, item: Omit<CustomerDocument, 'id'>) => addItemToCustomer(cid, 'documents', item);

export const removeContactFromCustomer = (cid: string, id: string) => removeItemFromCustomer(cid, 'contacts', id);
export const removeServiceFromCustomer = (cid: string, id: string) => removeItemFromCustomer(cid, 'services', id);
export const removeAssetFromCustomer = (cid: string, id: string) => removeItemFromCustomer(cid, 'assets', id);
export const removeDocumentFromCustomer = (cid: string, id: string) => removeItemFromCustomer(cid, 'documents', id);
