import { useState, useMemo } from "react";
import { getCustomers, addCustomer, deleteCustomer, type Customer } from "@/lib/crm-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Trash2, Eye, Building2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { INDUSTRIES } from "@/lib/crm-data";
import { Badge } from "@/components/ui/badge";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!search) return customers;
    const s = search.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.contacts.some(ct => ct.name.toLowerCase().includes(s) || ct.email.toLowerCase().includes(s)) ||
      c.industry.toLowerCase().includes(s) ||
      c.city.toLowerCase().includes(s)
    );
  }, [customers, search]);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newCustomer = addCustomer({
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
    setCustomers(prev => [...prev, newCustomer]);
    setDialogOpen(false);
    toast.success("לקוח נוסף בהצלחה");
  };

  const handleDelete = (id: string) => {
    deleteCustomer(id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    toast.success("לקוח נמחק");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">לקוחות</h1>
          <p className="text-muted-foreground text-sm mt-1">{customers.length} לקוחות במערכת</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />לקוח חדש</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>הוספת לקוח חדש</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>שם החברה</Label><Input name="name" required /></div>
                <div className="space-y-1">
                  <Label>תחום</Label>
                  <Select name="industry" defaultValue="טכנולוגיה">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>כתובת</Label><Input name="address" /></div>
                <div className="space-y-1"><Label>עיר</Label><Input name="city" /></div>
              </div>
              <div className="space-y-1"><Label>אתר אינטרנט</Label><Input name="website" dir="ltr" placeholder="https://" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>סטטוס</Label>
                  <Select name="status" defaultValue="active">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">פעיל</SelectItem>
                      <SelectItem value="inactive">לא פעיל</SelectItem>
                      <SelectItem value="trial">ניסיון</SelectItem>
                      <SelectItem value="prospect">פוטנציאלי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>תשלום חודשי (₪)</Label><Input name="monthlyPayment" type="number" defaultValue={0} dir="ltr" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>תחילת חוזה</Label><Input name="contractStart" type="date" dir="ltr" /></div>
                <div className="space-y-1"><Label>סיום חוזה</Label><Input name="contractEnd" type="date" dir="ltr" /></div>
              </div>
              <div className="space-y-1"><Label>הערות</Label><Textarea name="notes" /></div>
              <Button type="submit" className="w-full">הוסף לקוח</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="חיפוש לפי שם, תחום, עיר, איש קשר..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
      </div>

      <div className="grid gap-3">
        {filtered.map((customer) => {
          const primary = customer.contacts.find(c => c.isPrimary) || customer.contacts[0];
          return (
            <Card key={customer.id} className="bg-card border-border hover:border-glow transition-all cursor-pointer" onClick={() => navigate(`/customers/${customer.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-lg">{customer.name[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
                        <StatusBadge status={customer.status} />
                        {customer.industry && <Badge variant="secondary" className="text-xs">{customer.industry}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap">
                        {primary && <span>{primary.name} • <span dir="ltr">{primary.phone}</span></span>}
                        {customer.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{customer.city}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <span className="text-sm font-medium text-primary">₪{customer.monthlyPayment.toLocaleString()}/חודש</span>
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/customers/${customer.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{customer.services.length} שירותים</span>
                  <span>{customer.assets.length} נכסים</span>
                  <span>{customer.contacts.length} אנשי קשר</span>
                  <span>{customer.documents.length} מסמכים</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">לא נמצאו לקוחות</div>
        )}
      </div>
    </div>
  );
}
