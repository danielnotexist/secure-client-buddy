import { useState, useMemo } from "react";
import { getCustomers, addCustomer, deleteCustomer, type Customer } from "@/lib/crm-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
      c.contactName.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s)
    );
  }, [customers, search]);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newCustomer = addCustomer({
      name: fd.get("name") as string,
      contactName: fd.get("contactName") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      status: fd.get("status") as Customer["status"],
      monthlyPayment: Number(fd.get("monthlyPayment")),
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
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              לקוח חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>הוספת לקוח חדש</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>שם החברה</Label>
                <Input name="name" required />
              </div>
              <div className="space-y-2">
                <Label>איש קשר</Label>
                <Input name="contactName" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>אימייל</Label>
                  <Input name="email" type="email" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>טלפון</Label>
                  <Input name="phone" dir="ltr" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>סטטוס</Label>
                  <Select name="status" defaultValue="active">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">פעיל</SelectItem>
                      <SelectItem value="inactive">לא פעיל</SelectItem>
                      <SelectItem value="trial">ניסיון</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>תשלום חודשי (₪)</Label>
                  <Input name="monthlyPayment" type="number" defaultValue={0} dir="ltr" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>הערות</Label>
                <Textarea name="notes" />
              </div>
              <Button type="submit" className="w-full">הוסף לקוח</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש לקוח..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      <div className="grid gap-3">
        {filtered.map((customer) => (
          <Card key={customer.id} className="bg-card border-border hover:border-glow transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-lg">{customer.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{customer.contactName} • {customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={customer.status} />
                  <span className="text-sm font-medium text-foreground">₪{customer.monthlyPayment.toLocaleString()}/חודש</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/customers/${customer.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span>{customer.services.length} שירותים</span>
                <span>{customer.servers.length} שרתים</span>
                <span>{customer.firewalls.length} פיירוולים</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">לא נמצאו לקוחות</div>
        )}
      </div>
    </div>
  );
}
