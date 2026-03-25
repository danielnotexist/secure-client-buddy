export interface Customer {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'trial';
  monthlyPayment: number;
  notes: string;
  createdAt: string;
  services: Service[];
  servers: Server[];
  firewalls: Firewall[];
}

export interface Service {
  id: string;
  name: string;
  type: 'backup' | 'dr' | 'email-security' | 'edr' | 'mdr' | 'dlp' | 'rmm' | 'firewall' | 'other';
  status: 'active' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  price: number;
  notes: string;
}

export interface Server {
  id: string;
  name: string;
  ip: string;
  os: string;
  type: 'physical' | 'virtual' | 'cloud';
  status: 'online' | 'offline' | 'maintenance';
  backupEnabled: boolean;
  notes: string;
}

export interface Firewall {
  id: string;
  name: string;
  model: string;
  ip: string;
  location: string;
  status: 'active' | 'inactive' | 'needs-update';
  lastUpdate: string;
  notes: string;
}

const SERVICE_TYPE_LABELS: Record<Service['type'], string> = {
  'backup': 'גיבוי',
  'dr': 'התאוששות מאסון',
  'email-security': 'אבטחת מיילים',
  'edr': 'EDR',
  'mdr': 'MDR',
  'dlp': 'DLP',
  'rmm': 'RMM',
  'firewall': 'פיירוול',
  'other': 'אחר',
};

export const getServiceTypeLabel = (type: Service['type']) => SERVICE_TYPE_LABELS[type];

const STATUS_LABELS = {
  active: 'פעיל',
  inactive: 'לא פעיל',
  trial: 'ניסיון',
  expired: 'פג תוקף',
  pending: 'ממתין',
  online: 'מחובר',
  offline: 'מנותק',
  maintenance: 'תחזוקה',
  'needs-update': 'דרוש עדכון',
};

export const getStatusLabel = (status: string) => STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

const STORAGE_KEY = 'secureops-crm-customers';

const DEMO_CUSTOMERS: Customer[] = [
  {
    id: generateId(),
    name: 'חברת אלפא טכנולוגיות',
    contactName: 'יוסי כהן',
    email: 'yossi@alpha-tech.co.il',
    phone: '050-1234567',
    status: 'active',
    monthlyPayment: 4500,
    notes: 'לקוח VIP, דורש SLA מהיר',
    createdAt: '2024-01-15',
    services: [
      { id: generateId(), name: 'גיבוי שרתים', type: 'backup', status: 'active', startDate: '2024-01-15', endDate: '2025-01-15', price: 1500, notes: '' },
      { id: generateId(), name: 'EDR מתקדם', type: 'edr', status: 'active', startDate: '2024-03-01', endDate: '2025-03-01', price: 2000, notes: 'Acronis EDR' },
      { id: generateId(), name: 'אבטחת מיילים', type: 'email-security', status: 'active', startDate: '2024-01-15', endDate: '2025-01-15', price: 1000, notes: '' },
    ],
    servers: [
      { id: generateId(), name: 'DC-01', ip: '192.168.1.10', os: 'Windows Server 2022', type: 'physical', status: 'online', backupEnabled: true, notes: 'Domain Controller ראשי' },
      { id: generateId(), name: 'FS-01', ip: '192.168.1.20', os: 'Windows Server 2019', type: 'virtual', status: 'online', backupEnabled: true, notes: 'File Server' },
    ],
    firewalls: [
      { id: generateId(), name: 'FW-Main', model: 'FortiGate 60F', ip: '10.0.0.1', location: 'משרד ראשי', status: 'active', lastUpdate: '2024-06-01', notes: '' },
    ],
  },
  {
    id: generateId(),
    name: 'משרד עורכי דין ברק',
    contactName: 'דנה ברק',
    email: 'dana@barak-law.co.il',
    phone: '052-9876543',
    status: 'active',
    monthlyPayment: 2800,
    notes: 'רגיש לנושא פרטיות',
    createdAt: '2024-04-10',
    services: [
      { id: generateId(), name: 'גיבוי ענן', type: 'backup', status: 'active', startDate: '2024-04-10', endDate: '2025-04-10', price: 800, notes: '' },
      { id: generateId(), name: 'DLP', type: 'dlp', status: 'active', startDate: '2024-04-10', endDate: '2025-04-10', price: 1200, notes: 'מניעת דליפת מידע' },
      { id: generateId(), name: 'MDR', type: 'mdr', status: 'active', startDate: '2024-05-01', endDate: '2025-05-01', price: 800, notes: '' },
    ],
    servers: [
      { id: generateId(), name: 'SRV-LAW', ip: '192.168.10.5', os: 'Windows Server 2022', type: 'cloud', status: 'online', backupEnabled: true, notes: 'שרת ניהול תיקים' },
    ],
    firewalls: [
      { id: generateId(), name: 'FW-Office', model: 'Sophos XGS 87', ip: '10.10.0.1', location: 'משרד תל אביב', status: 'active', lastUpdate: '2024-08-15', notes: '' },
    ],
  },
  {
    id: generateId(),
    name: 'רשת מרכולים שפע',
    contactName: 'אבי לוי',
    email: 'avi@shefa-market.co.il',
    phone: '054-5551234',
    status: 'trial',
    monthlyPayment: 0,
    notes: 'תקופת ניסיון - 30 יום',
    createdAt: '2024-11-01',
    services: [
      { id: generateId(), name: 'RMM ניטור', type: 'rmm', status: 'pending', startDate: '2024-11-01', endDate: '2024-12-01', price: 0, notes: 'ניסיון חינם' },
    ],
    servers: [],
    firewalls: [],
  },
];

export function getCustomers(): Customer[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_CUSTOMERS));
    return DEMO_CUSTOMERS;
  }
  return JSON.parse(data);
}

export function saveCustomers(customers: Customer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function getCustomerById(id: string): Customer | undefined {
  return getCustomers().find(c => c.id === id);
}

export function addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'services' | 'servers' | 'firewalls'>): Customer {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: generateId(),
    createdAt: new Date().toISOString().split('T')[0],
    services: [],
    servers: [],
    firewalls: [],
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

export function addServiceToCustomer(customerId: string, service: Omit<Service, 'id'>): Service | undefined {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return undefined;
  const newService = { ...service, id: generateId() };
  customer.services.push(newService);
  saveCustomers(customers);
  return newService;
}

export function addServerToCustomer(customerId: string, server: Omit<Server, 'id'>): Server | undefined {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return undefined;
  const newServer = { ...server, id: generateId() };
  customer.servers.push(newServer);
  saveCustomers(customers);
  return newServer;
}

export function addFirewallToCustomer(customerId: string, firewall: Omit<Firewall, 'id'>): Firewall | undefined {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return undefined;
  const newFirewall = { ...firewall, id: generateId() };
  customer.firewalls.push(newFirewall);
  saveCustomers(customers);
  return newFirewall;
}

export function removeServiceFromCustomer(customerId: string, serviceId: string) {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return;
  customer.services = customer.services.filter(s => s.id !== serviceId);
  saveCustomers(customers);
}

export function removeServerFromCustomer(customerId: string, serverId: string) {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return;
  customer.servers = customer.servers.filter(s => s.id !== serverId);
  saveCustomers(customers);
}

export function removeFirewallFromCustomer(customerId: string, firewallId: string) {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return;
  customer.firewalls = customer.firewalls.filter(f => f.id !== firewallId);
  saveCustomers(customers);
}
