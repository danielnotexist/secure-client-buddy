import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCustomerById, updateCustomer, addServiceToCustomer, addServerToCustomer, addFirewallToCustomer,
  removeServiceFromCustomer, removeServerFromCustomer, removeFirewallFromCustomer,
  getServiceTypeLabel, type Customer, type Service, type Server, type Firewall
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
import { ArrowRight, Plus, Trash2, Server as ServerIcon, Shield, Wrench, User } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [serviceDialog, setServiceDialog] = useState(false);
  const [serverDialog, setServerDialog] = useState(false);
  const [firewallDialog, setFirewallDialog] = useState(false);

  useEffect(() => {
    if (id) {
      const c = getCustomerById(id);
      if (c) setCustomer(c);
      else navigate("/customers");
    }
  }, [id, navigate]);

  if (!customer) return null;

  const refresh = () => setCustomer(getCustomerById(customer.id) || customer);

  const handleAddService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addServiceToCustomer(customer.id, {
      name: fd.get("name") as string,
      type: fd.get("type") as Service["type"],
      status: fd.get("status") as Service["status"],
      startDate: fd.get("startDate") as string,
      endDate: fd.get("endDate") as string,
      price: Number(fd.get("price")),
      notes: fd.get("notes") as string,
    });
    refresh();
    setServiceDialog(false);
    toast.success("שירות נוסף");
  };

  const handleAddServer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addServerToCustomer(customer.id, {
      name: fd.get("name") as string,
      ip: fd.get("ip") as string,
      os: fd.get("os") as string,
      type: fd.get("type") as Server["type"],
      status: fd.get("status") as Server["status"],
      backupEnabled: fd.get("backupEnabled") === "on",
      notes: fd.get("notes") as string,
    });
    refresh();
    setServerDialog(false);
    toast.success("שרת נוסף");
  };

  const handleAddFirewall = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addFirewallToCustomer(customer.id, {
      name: fd.get("name") as string,
      model: fd.get("model") as string,
      ip: fd.get("ip") as string,
      location: fd.get("location") as string,
      status: fd.get("status") as Firewall["status"],
      lastUpdate: fd.get("lastUpdate") as string,
      notes: fd.get("notes") as string,
    });
    refresh();
    setFirewallDialog(false);
    toast.success("פיירוול נוסף");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">{customer.contactName} • {customer.email} • {customer.phone}</p>
        </div>
        <div className="mr-auto">
          <StatusBadge status={customer.status} />
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">תשלום חודשי</p>
            <p className="text-2xl font-bold text-primary mt-1">₪{customer.monthlyPayment.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">שירותים</p>
            <p className="text-2xl font-bold text-foreground mt-1">{customer.services.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">שרתים</p>
            <p className="text-2xl font-bold text-foreground mt-1">{customer.servers.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">פיירוולים</p>
            <p className="text-2xl font-bold text-foreground mt-1">{customer.firewalls.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="w-full justify-start bg-muted/30">
          <TabsTrigger value="services" className="gap-2"><Wrench className="h-4 w-4" />שירותים</TabsTrigger>
          <TabsTrigger value="servers" className="gap-2"><ServerIcon className="h-4 w-4" />שרתים</TabsTrigger>
          <TabsTrigger value="firewalls" className="gap-2"><Shield className="h-4 w-4" />פיירוולים</TabsTrigger>
          <TabsTrigger value="info" className="gap-2"><User className="h-4 w-4" />פרטים</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">שירותים ({customer.services.length})</h3>
            <Dialog open={serviceDialog} onOpenChange={setServiceDialog}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" />הוסף שירות</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>הוספת שירות</DialogTitle></DialogHeader>
                <form onSubmit={handleAddService} className="space-y-3">
                  <div className="space-y-1"><Label>שם השירות</Label><Input name="name" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>סוג</Label>
                      <Select name="type" defaultValue="backup">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(['backup','dr','email-security','edr','mdr','dlp','rmm','firewall','other'] as const).map(t => (
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
            <div className="text-center py-8 text-muted-foreground">אין שירותים</div>
          ) : (
            <div className="grid gap-3">
              {customer.services.map(s => (
                <Card key={s.id} className="bg-muted/20 border-border">
                  <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{getServiceTypeLabel(s.type)} • ₪{s.price}/חודש</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.startDate} → {s.endDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={s.status} />
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { removeServiceFromCustomer(customer.id, s.id); refresh(); toast.success("שירות הוסר"); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Servers Tab */}
        <TabsContent value="servers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">שרתים ({customer.servers.length})</h3>
            <Dialog open={serverDialog} onOpenChange={setServerDialog}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" />הוסף שרת</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>הוספת שרת</DialogTitle></DialogHeader>
                <form onSubmit={handleAddServer} className="space-y-3">
                  <div className="space-y-1"><Label>שם השרת</Label><Input name="name" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>כתובת IP</Label><Input name="ip" dir="ltr" required /></div>
                    <div className="space-y-1"><Label>מערכת הפעלה</Label><Input name="os" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>סוג</Label>
                      <Select name="type" defaultValue="virtual">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="physical">פיזי</SelectItem>
                          <SelectItem value="virtual">וירטואלי</SelectItem>
                          <SelectItem value="cloud">ענן</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>סטטוס</Label>
                      <Select name="status" defaultValue="online">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">מחובר</SelectItem>
                          <SelectItem value="offline">מנותק</SelectItem>
                          <SelectItem value="maintenance">תחזוקה</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch name="backupEnabled" id="backupEnabled" />
                    <Label htmlFor="backupEnabled">גיבוי מופעל</Label>
                  </div>
                  <div className="space-y-1"><Label>הערות</Label><Textarea name="notes" /></div>
                  <Button type="submit" className="w-full">הוסף</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {customer.servers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">אין שרתים</div>
          ) : (
            <div className="grid gap-3">
              {customer.servers.map(s => (
                <Card key={s.id} className="bg-muted/20 border-border">
                  <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{s.ip} • {s.os} • {s.type === 'physical' ? 'פיזי' : s.type === 'virtual' ? 'וירטואלי' : 'ענן'}</p>
                      {s.backupEnabled && <p className="text-xs text-success mt-1">✓ גיבוי מופעל</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={s.status} />
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { removeServerFromCustomer(customer.id, s.id); refresh(); toast.success("שרת הוסר"); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Firewalls Tab */}
        <TabsContent value="firewalls" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">פיירוולים ({customer.firewalls.length})</h3>
            <Dialog open={firewallDialog} onOpenChange={setFirewallDialog}>
              <DialogTrigger asChild><Button size="sm" className="gap-1"><Plus className="h-4 w-4" />הוסף פיירוול</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>הוספת פיירוול</DialogTitle></DialogHeader>
                <form onSubmit={handleAddFirewall} className="space-y-3">
                  <div className="space-y-1"><Label>שם</Label><Input name="name" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>דגם</Label><Input name="model" required /></div>
                    <div className="space-y-1"><Label>כתובת IP</Label><Input name="ip" dir="ltr" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label>מיקום</Label><Input name="location" /></div>
                    <div className="space-y-1">
                      <Label>סטטוס</Label>
                      <Select name="status" defaultValue="active">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">פעיל</SelectItem>
                          <SelectItem value="inactive">לא פעיל</SelectItem>
                          <SelectItem value="needs-update">דרוש עדכון</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1"><Label>עדכון אחרון</Label><Input name="lastUpdate" type="date" dir="ltr" /></div>
                  <div className="space-y-1"><Label>הערות</Label><Textarea name="notes" /></div>
                  <Button type="submit" className="w-full">הוסף</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {customer.firewalls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">אין פיירוולים</div>
          ) : (
            <div className="grid gap-3">
              {customer.firewalls.map(f => (
                <Card key={f.id} className="bg-muted/20 border-border">
                  <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-foreground">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.model} • {f.ip} • {f.location}</p>
                      <p className="text-xs text-muted-foreground mt-1">עדכון אחרון: {f.lastUpdate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={f.status} />
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { removeFirewallFromCustomer(customer.id, f.id); refresh(); toast.success("פיירוול הוסר"); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info">
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">שם החברה</Label><p className="font-medium text-foreground">{customer.name}</p></div>
                <div><Label className="text-muted-foreground">איש קשר</Label><p className="font-medium text-foreground">{customer.contactName}</p></div>
                <div><Label className="text-muted-foreground">אימייל</Label><p className="font-medium text-foreground" dir="ltr">{customer.email}</p></div>
                <div><Label className="text-muted-foreground">טלפון</Label><p className="font-medium text-foreground" dir="ltr">{customer.phone}</p></div>
                <div><Label className="text-muted-foreground">תאריך הצטרפות</Label><p className="font-medium text-foreground">{customer.createdAt}</p></div>
                <div><Label className="text-muted-foreground">תשלום חודשי</Label><p className="font-medium text-primary">₪{customer.monthlyPayment.toLocaleString()}</p></div>
              </div>
              {customer.notes && (
                <div><Label className="text-muted-foreground">הערות</Label><p className="text-foreground mt-1">{customer.notes}</p></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
