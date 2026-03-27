import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCustomerById, updateCustomer,
  addContactToCustomer, addServiceToCustomer, addAssetToCustomer, addDocumentToCustomer,
  addTicketToCustomer, removeTicketFromCustomer, updateTicketInCustomer,
  removeContactFromCustomer, removeServiceFromCustomer, removeAssetFromCustomer, removeDocumentFromCustomer,
  getServiceTypeLabel, getStatusLabel, SERVICE_TYPES, ASSET_CATEGORIES, DOCUMENT_CATEGORIES, INDUSTRIES,
  TICKET_STATUSES, TICKET_PRIORITIES,
  type Customer, type Service, type Asset, type Contact, type CustomerDocument, type Ticket,
} from "@/lib/crm-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowRight, Plus, Trash2, User, Wrench, HardDrive, FileText, Phone, Mail,
  Globe, MapPin, Building2, Calendar, CreditCard, Users, Star, Download, Eye,
  TicketCheck, AlertCircle, ImagePlus, Camera, Pencil, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [serviceDialog, setServiceDialog] = useState(false);
  const [assetDialog, setAssetDialog] = useState(false);
  const [contactDialog, setContactDialog] = useState(false);
  const [documentDialog, setDocumentDialog] = useState(false);
  const [ticketDialog, setTicketDialog] = useState(false);
  const [editTicketData, setEditTicketData] = useState<Ticket | null>(null);
  const [closeTicketData, setCloseTicketData] = useState<Ticket | null>(null);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const ticketImageRef = useRef<HTMLInputElement>(null);
  const [ticketImagePreview, setTicketImagePreview] = useState('');

  useEffect(() => {
    if (id) {
      const c = getCustomerById(id);
      if (c) setCustomer(c);
      else navigate("/customers");
    }
  }, [id, navigate]);

  if (!customer) return null;

  const refresh = () => setCustomer(getCustomerById(customer.id) || customer);
  const primaryContact = customer.contacts.find(c => c.isPrimary) || customer.contacts[0];

  // ===== Handlers =====

  const handleAddContact = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addContactToCustomer(customer.id, {
      name: fd.get("name") as string,
      role: fd.get("role") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      isPrimary: customer.contacts.length === 0,
    });
    refresh();
    setContactDialog(false);
    toast.success("איש קשר נוסף");
  };

  const handleAddService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addServiceToCustomer(customer.id, {
      name: fd.get("name") as string,
      type: fd.get("type") as Service["type"],
      status: fd.get("status") as Service["status"],
      vendor: fd.get("vendor") as string,
      licenseCount: Number(fd.get("licenseCount") || 0),
      startDate: fd.get("startDate") as string,
      endDate: fd.get("endDate") as string,
      price: Number(fd.get("price")),
      notes: fd.get("notes") as string,
    });
    refresh();
    setServiceDialog(false);
    toast.success("שירות נוסף");
  };

  const handleAddAsset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addAssetToCustomer(customer.id, {
      name: fd.get("name") as string,
      category: fd.get("category") as string,
      model: fd.get("model") as string,
      manufacturer: fd.get("manufacturer") as string,
      serialNumber: fd.get("serialNumber") as string,
      ip: fd.get("ip") as string,
      location: fd.get("location") as string,
      status: fd.get("status") as Asset["status"],
      purchaseDate: fd.get("purchaseDate") as string,
      warrantyEnd: fd.get("warrantyEnd") as string,
      notes: fd.get("notes") as string,
      properties: {},
    });
    refresh();
    setAssetDialog(false);
    toast.success("נכס נוסף");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        addDocumentToCustomer(customer.id, {
          name: file.name,
          type: file.type,
          dataUrl: reader.result as string,
          uploadedAt: new Date().toISOString().split('T')[0],
          category: file.type.startsWith('image/') ? 'photo' : 'other',
          notes: '',
        });
        refresh();
        toast.success(`הקובץ "${file.name}" הועלה`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateCustomer(customer.id, { avatarUrl: reader.result as string });
      refresh();
      toast.success("תמונת לקוח עודכנה");
    };
    reader.readAsDataURL(file);
  };

  const handleAddTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const now = new Date().toISOString().split('T')[0];
    addTicketToCustomer(customer.id, {
      subject: fd.get("subject") as string,
      description: fd.get("description") as string,
      status: fd.get("status") as Ticket["status"],
      priority: fd.get("priority") as Ticket["priority"],
      assignee: fd.get("assignee") as string,
      createdAt: now,
      updatedAt: now,
      imageUrl: ticketImagePreview,
      notes: fd.get("notes") as string,
      resolution: '',
    });
    refresh();
    setTicketDialog(false);
    setTicketImagePreview('');
    toast.success("קריאה נוספה");
  };

  const handleTicketImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setTicketImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleTicketStatusChange = (ticketId: string, newStatus: Ticket['status']) => {
    updateTicketInCustomer(customer.id, ticketId, { status: newStatus, updatedAt: new Date().toISOString().split('T')[0] });
    refresh();
    toast.success("סטטוס קריאה עודכן");
  };

  const handleEditTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editTicketData) return;
    const fd = new FormData(e.currentTarget);
    updateTicketInCustomer(customer.id, editTicketData.id, {
      subject: fd.get("subject") as string,
      description: fd.get("description") as string,
      priority: fd.get("priority") as Ticket["priority"],
      assignee: fd.get("assignee") as string,
      notes: fd.get("notes") as string,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    refresh();
    setEditTicketData(null);
    toast.success("קריאה עודכנה");
  };

  const handleCloseTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!closeTicketData) return;
    const fd = new FormData(e.currentTarget);
    updateTicketInCustomer(customer.id, closeTicketData.id, {
      status: fd.get("status") as Ticket["status"],
      resolution: fd.get("resolution") as string,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    refresh();
    setCloseTicketData(null);
    toast.success("קריאה נסגרה");
  };

  const handleSaveInfo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateCustomer(customer.id, {
      name: fd.get("name") as string,
      industry: fd.get("industry") as string,
      website: fd.get("website") as string,
      address: fd.get("address") as string,
      city: fd.get("city") as string,
      status: fd.get("status") as Customer["status"],
      monthlyPayment: Number(fd.get("monthlyPayment")),
      contractStart: fd.get("contractStart") as string,
      contractEnd: fd.get("contractEnd") as string,
      notes: fd.get("notes") as string,
    });
    refresh();
    setEditMode(false);
    toast.success("פרטים עודכנו");
  };

  const totalServicesCost = customer.services.reduce((s, srv) => s + srv.price, 0);
  const openTickets = (customer.tickets || []).filter(t => t.status === 'open' || t.status === 'in-progress').length;

  const priorityColor: Record<string, string> = {
    low: 'bg-muted/50 text-muted-foreground',
    medium: 'bg-blue-500/15 text-blue-400',
    high: 'bg-orange-500/15 text-orange-400',
    critical: 'bg-red-500/15 text-red-400',
  };
  const priorityLabel: Record<string, string> = {
    low: 'נמוך', medium: 'בינוני', high: 'גבוה', critical: 'קריטי',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
          <Avatar className="h-14 w-14">
            {customer.avatarUrl ? <AvatarImage src={customer.avatarUrl} alt={customer.name} /> : null}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">{customer.name[0]}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
            <StatusBadge status={customer.status} />
            {customer.industry && (
              <Badge variant="secondary" className="text-xs">{customer.industry}</Badge>
            )}
            {openTickets > 0 && (
              <Badge variant="destructive" className="text-xs gap-1">
                <TicketCheck className="h-3 w-3" />{openTickets} קריאות פתוחות
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
            {primaryContact && (
              <>
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{primaryContact.name}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /><span dir="ltr">{primaryContact.phone}</span></span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /><span dir="ltr">{primaryContact.email}</span></span>
              </>
            )}
            {customer.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{customer.city}</span>}
            {customer.website && <a href={customer.website} target="_blank" className="flex items-center gap-1 text-primary hover:underline"><Globe className="h-3.5 w-3.5" /><span dir="ltr">{customer.website.replace('https://', '')}</span></a>}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'תשלום חודשי', value: `₪${customer.monthlyPayment.toLocaleString()}`, sub: '', highlight: true },
          { label: 'שירותים', value: customer.services.length, sub: `₪${totalServicesCost.toLocaleString()}/חודש` },
          { label: 'נכסים', value: customer.assets.length },
          { label: 'אנשי קשר', value: customer.contacts.length },
          { label: 'מסמכים', value: customer.documents.length },
          { label: 'קריאות פתוחות', value: openTickets, alert: openTickets > 0 },
        ].map((item, i) => (
          <Card key={i} className={`border-border ${item.alert ? 'bg-red-50 border-red-200' : ''}`}>
            <CardContent className="p-4 text-center">
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
              <p className={`text-xl font-bold mt-1 ${item.highlight ? 'text-primary' : item.alert ? 'text-red-600' : 'text-foreground'}`}>{item.value}</p>
              {item.sub && <p className="text-[11px] text-muted-foreground">{item.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="w-full justify-start bg-muted/30 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="services" className="gap-1.5"><Wrench className="h-4 w-4" />שירותים</TabsTrigger>
          <TabsTrigger value="assets" className="gap-1.5"><HardDrive className="h-4 w-4" />נכסים</TabsTrigger>
          <TabsTrigger value="tickets" className="gap-1.5 relative">
            <TicketCheck className="h-4 w-4" />קריאות
            {openTickets > 0 && <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{openTickets}</span>}
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-1.5"><Users className="h-4 w-4" />אנשי קשר</TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5"><FileText className="h-4 w-4" />מסמכים</TabsTrigger>
          <TabsTrigger value="info" className="gap-1.5"><Building2 className="h-4 w-4" />פרטי חברה</TabsTrigger>
        </TabsList>

        {/* ===== SERVICES TAB ===== */}
        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">שירותים ({customer.services.length})</h3>
            <Dialog open={serviceDialog} onOpenChange={setServiceDialog}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" />הוסף שירות</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>הוספת שירות</DialogTitle></DialogHeader>
                <form onSubmit={handleAddService} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>שם השירות</Label><Input name="name" required /></div>
                    <div className="space-y-1"><Label>ספק</Label><Input name="vendor" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label>סוג</Label>
                      <Select name="type" defaultValue="backup">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map(t => (
                            <SelectItem key={t} value={t}>{getServiceTypeLabel(t)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>סטטוס</Label>
                      <Select name="status" defaultValue="active">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">פעיל</SelectItem>
                          <SelectItem value="pending">ממתין</SelectItem>
                          <SelectItem value="expired">פג תוקף</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>רישיונות</Label><Input name="licenseCount" type="number" dir="ltr" defaultValue={0} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>תאריך התחלה</Label><Input name="startDate" type="date" dir="ltr" required /></div>
                    <div className="space-y-1"><Label>תאריך סיום</Label><Input name="endDate" type="date" dir="ltr" required /></div>
                  </div>
                  <div className="space-y-1"><Label>מחיר חודשי (₪)</Label><Input name="price" type="number" dir="ltr" defaultValue={0} /></div>
                  <div className="space-y-1"><Label>הערות</Label><Textarea name="notes" /></div>
                  <Button type="submit" className="w-full">הוסף</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {customer.services.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>אין שירותים. לחץ על "הוסף שירות" להתחיל.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {customer.services.map(s => (
                <Card key={s.id} className="bg-card border-border hover:border-glow transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{s.name}</p>
                          <StatusBadge status={s.status} />
                          <Badge variant="outline" className="text-xs">{getServiceTypeLabel(s.type)}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 mt-2 text-sm text-muted-foreground">
                          {s.vendor && <span>ספק: <strong className="text-foreground">{s.vendor}</strong></span>}
                          <span>מחיר: <strong className="text-primary">₪{s.price}/חודש</strong></span>
                          {s.licenseCount > 0 && <span>רישיונות: <strong className="text-foreground">{s.licenseCount}</strong></span>}
                          <span>{s.startDate} → {s.endDate}</span>
                        </div>
                        {s.notes && <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded">{s.notes}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => { removeServiceFromCustomer(customer.id, s.id); refresh(); toast.success("שירות הוסר"); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== ASSETS TAB ===== */}
        <TabsContent value="assets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">נכסים ({customer.assets.length})</h3>
            <Dialog open={assetDialog} onOpenChange={setAssetDialog}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" />הוסף נכס</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>הוספת נכס</DialogTitle></DialogHeader>
                <form onSubmit={handleAddAsset} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>שם</Label><Input name="name" required /></div>
                    <div className="space-y-1">
                      <Label>קטגוריה</Label>
                      <Select name="category" defaultValue="שרת">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ASSET_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>יצרן</Label><Input name="manufacturer" /></div>
                    <div className="space-y-1"><Label>דגם</Label><Input name="model" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>מספר סריאלי</Label><Input name="serialNumber" dir="ltr" /></div>
                    <div className="space-y-1"><Label>כתובת IP</Label><Input name="ip" dir="ltr" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>מיקום</Label><Input name="location" /></div>
                    <div className="space-y-1">
                      <Label>סטטוס</Label>
                      <Select name="status" defaultValue="online">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">מחובר</SelectItem>
                          <SelectItem value="offline">מנותק</SelectItem>
                          <SelectItem value="maintenance">תחזוקה</SelectItem>
                          <SelectItem value="needs-update">דרוש עדכון</SelectItem>
                          <SelectItem value="retired">פורק</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>תאריך רכישה</Label><Input name="purchaseDate" type="date" dir="ltr" /></div>
                    <div className="space-y-1"><Label>סוף אחריות</Label><Input name="warrantyEnd" type="date" dir="ltr" /></div>
                  </div>
                  <div className="space-y-1"><Label>הערות</Label><Textarea name="notes" /></div>
                  <Button type="submit" className="w-full">הוסף</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {customer.assets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HardDrive className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>אין נכסים. לחץ על "הוסף נכס" להתחיל.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {customer.assets.map(a => (
                <Card key={a.id} className="bg-card border-border hover:border-glow transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{a.name}</p>
                          <StatusBadge status={a.status} />
                          <Badge variant="secondary" className="text-xs">{a.category}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 mt-2 text-sm text-muted-foreground">
                          {a.manufacturer && <span>יצרן: <strong className="text-foreground">{a.manufacturer}</strong></span>}
                          {a.model && <span>דגם: <strong className="text-foreground">{a.model}</strong></span>}
                          {a.ip && <span>IP: <strong className="text-foreground" dir="ltr">{a.ip}</strong></span>}
                          {a.location && <span>מיקום: <strong className="text-foreground">{a.location}</strong></span>}
                          {a.serialNumber && <span>סריאלי: <strong className="text-foreground" dir="ltr">{a.serialNumber}</strong></span>}
                          {a.purchaseDate && <span>רכישה: <strong className="text-foreground">{a.purchaseDate}</strong></span>}
                          {a.warrantyEnd && <span>אחריות עד: <strong className="text-foreground">{a.warrantyEnd}</strong></span>}
                        </div>
                        {Object.keys(a.properties).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(a.properties).map(([k, v]) => (
                              <Badge key={k} variant="outline" className="text-xs">{k}: {v}</Badge>
                            ))}
                          </div>
                        )}
                        {a.notes && <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded">{a.notes}</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => { removeAssetFromCustomer(customer.id, a.id); refresh(); toast.success("נכס הוסר"); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== TICKETS TAB ===== */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">קריאות שירות ({(customer.tickets || []).length})</h3>
            <Dialog open={ticketDialog} onOpenChange={(o) => { setTicketDialog(o); if (!o) setTicketImagePreview(''); }}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" />קריאה חדשה</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>פתיחת קריאה חדשה</DialogTitle></DialogHeader>
                <form onSubmit={handleAddTicket} className="space-y-3">
                  <div className="space-y-1"><Label>נושא הקריאה</Label><Input name="subject" required placeholder="לדוגמה: תקלה במדפסת" /></div>
                  <div className="space-y-1"><Label>תיאור</Label><Textarea name="description" placeholder="פירוט הבעיה..." /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>סטטוס</Label>
                      <Select name="status" defaultValue="open">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TICKET_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>עדיפות</Label>
                      <Select name="priority" defaultValue="medium">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TICKET_PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1"><Label>מטפל</Label><Input name="assignee" placeholder="שם הטכנאי..." /></div>
                  <div className="space-y-1">
                    <Label>תמונה מצורפת</Label>
                    <div className="flex items-center gap-2">
                      <input ref={ticketImageRef} type="file" accept="image/*" className="hidden" onChange={handleTicketImageSelect} />
                      <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => ticketImageRef.current?.click()}>
                        <ImagePlus className="h-4 w-4" />צרף תמונה
                      </Button>
                      {ticketImagePreview && <img src={ticketImagePreview} alt="preview" className="h-10 w-10 rounded object-cover" />}
                    </div>
                  </div>
                  <div className="space-y-1"><Label>הערות</Label><Textarea name="notes" /></div>
                  <Button type="submit" className="w-full">פתח קריאה</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {(customer.tickets || []).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TicketCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>אין קריאות שירות. לחץ על "קריאה חדשה" להתחיל.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {(customer.tickets || []).map(ticket => (
                <Card key={ticket.id} className={`border-border hover:border-glow transition-all ${(ticket.status === 'open' || ticket.status === 'in-progress') ? 'border-r-4 border-r-red-500/60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1 min-w-0">
                        {ticket.imageUrl && (
                          <a href={ticket.imageUrl} target="_blank" className="shrink-0">
                            <img src={ticket.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />
                          </a>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground">{ticket.subject}</p>
                            <StatusBadge status={ticket.status} />
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[ticket.priority]}`}>
                              {priorityLabel[ticket.priority]}
                            </span>
                          </div>
                          {ticket.description && <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span>נפתח: {ticket.createdAt}</span>
                            <span>עודכן: {ticket.updatedAt}</span>
                            {ticket.assignee && <span>מטפל: <strong className="text-foreground">{ticket.assignee}</strong></span>}
                          </div>
                          {ticket.resolution && (
                            <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
                              <span className="font-medium text-emerald-400">פתרון: </span>
                              <span className="text-foreground">{ticket.resolution}</span>
                            </div>
                          )}
                          {ticket.notes && !ticket.resolution && <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded">{ticket.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditTicketData(ticket)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400" onClick={() => setCloseTicketData(ticket)}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => { removeTicketFromCustomer(customer.id, ticket.id); refresh(); toast.success("קריאה נמחקה"); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== CONTACTS TAB ===== */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">אנשי קשר ({customer.contacts.length})</h3>
            <Dialog open={contactDialog} onOpenChange={setContactDialog}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" />הוסף איש קשר</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>הוספת איש קשר</DialogTitle></DialogHeader>
                <form onSubmit={handleAddContact} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>שם</Label><Input name="name" required /></div>
                    <div className="space-y-1"><Label>תפקיד</Label><Input name="role" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>אימייל</Label><Input name="email" type="email" dir="ltr" /></div>
                    <div className="space-y-1"><Label>טלפון</Label><Input name="phone" dir="ltr" /></div>
                  </div>
                  <Button type="submit" className="w-full">הוסף</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {customer.contacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>אין אנשי קשר.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customer.contacts.map(c => (
                <Card key={c.id} className="bg-card border-border hover:border-glow transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-1">
                              {c.name}
                              {c.isPrimary && <Star className="h-3.5 w-3.5 text-warning fill-warning" />}
                            </p>
                            <p className="text-xs text-muted-foreground">{c.role}</p>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {c.email && <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span dir="ltr">{c.email}</span></p>}
                          {c.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span dir="ltr">{c.phone}</span></p>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { removeContactFromCustomer(customer.id, c.id); refresh(); toast.success("איש קשר הוסר"); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== DOCUMENTS TAB ===== */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">מסמכים ותמונות ({customer.documents.length})</h3>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button size="sm" className="gap-1" onClick={() => fileInputRef.current?.click()}>
                <Plus className="h-4 w-4" />העלה קובץ
              </Button>
            </div>
          </div>
          {customer.documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>אין מסמכים. לחץ על "העלה קובץ" להתחיל.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customer.documents.map(doc => (
                <Card key={doc.id} className="bg-card border-border hover:border-glow transition-all overflow-hidden">
                  <CardContent className="p-0">
                    {doc.type.startsWith('image/') ? (
                      <div className="h-40 bg-muted/30 overflow-hidden">
                        <img src={doc.dataUrl} alt={doc.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-40 bg-muted/20 flex items-center justify-center">
                        <FileText className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="font-medium text-foreground text-sm truncate">{doc.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{doc.uploadedAt}</span>
                        <div className="flex gap-1">
                          <a href={doc.dataUrl} download={doc.name}>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                          </a>
                          {doc.type.startsWith('image/') && (
                            <a href={doc.dataUrl} target="_blank">
                              <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                            </a>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { removeDocumentFromCustomer(customer.id, doc.id); refresh(); toast.success("מסמך הוסר"); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== INFO TAB ===== */}
        <TabsContent value="info">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">פרטי החברה</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'ביטול' : 'עריכה'}
              </Button>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <form onSubmit={handleSaveInfo} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label>שם החברה</Label><Input name="name" defaultValue={customer.name} required /></div>
                    <div className="space-y-1">
                      <Label>תחום</Label>
                      <Select name="industry" defaultValue={customer.industry}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>אתר אינטרנט</Label><Input name="website" defaultValue={customer.website} dir="ltr" /></div>
                    <div className="space-y-1">
                      <Label>סטטוס</Label>
                      <Select name="status" defaultValue={customer.status}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">פעיל</SelectItem>
                          <SelectItem value="inactive">לא פעיל</SelectItem>
                          <SelectItem value="trial">ניסיון</SelectItem>
                          <SelectItem value="prospect">פוטנציאלי</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>כתובת</Label><Input name="address" defaultValue={customer.address} /></div>
                    <div className="space-y-1"><Label>עיר</Label><Input name="city" defaultValue={customer.city} /></div>
                    <div className="space-y-1"><Label>תשלום חודשי (₪)</Label><Input name="monthlyPayment" type="number" defaultValue={customer.monthlyPayment} dir="ltr" /></div>
                    <div className="space-y-1"><Label>תחילת חוזה</Label><Input name="contractStart" type="date" defaultValue={customer.contractStart} dir="ltr" /></div>
                    <div className="space-y-1"><Label>סיום חוזה</Label><Input name="contractEnd" type="date" defaultValue={customer.contractEnd} dir="ltr" /></div>
                  </div>
                  <div className="space-y-1"><Label>הערות</Label><Textarea name="notes" defaultValue={customer.notes} rows={4} /></div>
                  <Button type="submit">שמור שינויים</Button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                    <InfoField icon={<Building2 className="h-4 w-4" />} label="שם החברה" value={customer.name} />
                    <InfoField icon={<Building2 className="h-4 w-4" />} label="תחום" value={customer.industry} />
                    <InfoField icon={<Globe className="h-4 w-4" />} label="אתר" value={customer.website} dir="ltr" />
                    <InfoField icon={<MapPin className="h-4 w-4" />} label="כתובת" value={`${customer.address}${customer.city ? `, ${customer.city}` : ''}`} />
                    <InfoField icon={<CreditCard className="h-4 w-4" />} label="תשלום חודשי" value={`₪${customer.monthlyPayment.toLocaleString()}`} highlight />
                    <InfoField icon={<Calendar className="h-4 w-4" />} label="תקופת חוזה" value={customer.contractStart && customer.contractEnd ? `${customer.contractStart} → ${customer.contractEnd}` : 'לא הוגדר'} />
                    <InfoField icon={<Calendar className="h-4 w-4" />} label="תאריך הצטרפות" value={customer.createdAt} />
                  </div>
                  {customer.notes && (
                    <div className="border-t border-border pt-4">
                      <Label className="text-muted-foreground text-xs">הערות</Label>
                      <p className="text-foreground mt-1 whitespace-pre-wrap bg-muted/20 p-3 rounded-lg">{customer.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Ticket Dialog */}
      <Dialog open={!!editTicketData} onOpenChange={(o) => !o && setEditTicketData(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>עריכת קריאה</DialogTitle></DialogHeader>
          {editTicketData && (
            <form onSubmit={handleEditTicket} className="space-y-3">
              <div className="space-y-1"><Label>נושא</Label><Input name="subject" defaultValue={editTicketData.subject} required /></div>
              <div className="space-y-1"><Label>תיאור</Label><Textarea name="description" defaultValue={editTicketData.description} /></div>
              <div className="space-y-1">
                <Label>עדיפות</Label>
                <Select name="priority" defaultValue={editTicketData.priority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TICKET_PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>מטפל</Label><Input name="assignee" defaultValue={editTicketData.assignee} /></div>
              <div className="space-y-1"><Label>הערות</Label><Textarea name="notes" defaultValue={editTicketData.notes} /></div>
              <Button type="submit" className="w-full">שמור שינויים</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Close Ticket Dialog */}
      <Dialog open={!!closeTicketData} onOpenChange={(o) => !o && setCloseTicketData(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>סגירת קריאה</DialogTitle></DialogHeader>
          {closeTicketData && (
            <form onSubmit={handleCloseTicket} className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="font-semibold text-foreground">{closeTicketData.subject}</p>
              </div>
              <div className="space-y-1">
                <Label>סטטוס סגירה</Label>
                <Select name="status" defaultValue="resolved">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resolved">נפתר</SelectItem>
                    <SelectItem value="closed">סגור</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>פתרון / סיבת סגירה</Label>
                <Textarea name="resolution" required placeholder="תאר את הפתרון או סיבת הסגירה..." rows={4} />
              </div>
              <Button type="submit" className="w-full">סגור קריאה</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoField({ icon, label, value, dir, highlight }: { icon: React.ReactNode; label: string; value: string; dir?: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`font-medium ${highlight ? 'text-primary' : 'text-foreground'}`} dir={dir}>{value || '—'}</p>
      </div>
    </div>
  );
}