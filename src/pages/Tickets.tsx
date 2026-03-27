import { useState, useMemo } from "react";
import {
  getCustomers, updateTicketInCustomer, removeTicketFromCustomer, addTicketToCustomer,
  TICKET_STATUSES, TICKET_PRIORITIES,
  type Customer, type Ticket,
} from "@/lib/crm-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, TicketCheck, Plus, Trash2, Pencil, CheckCircle2, Clock, AlertCircle, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface TicketWithCustomer {
  ticket: Ticket;
  customerId: string;
  customerName: string;
}

const priorityColor: Record<string, string> = {
  low: 'bg-muted/50 text-muted-foreground',
  medium: 'bg-blue-500/15 text-blue-400',
  high: 'bg-orange-500/15 text-orange-400',
  critical: 'bg-red-500/15 text-red-400',
};
const priorityLabel: Record<string, string> = {
  low: 'נמוך', medium: 'בינוני', high: 'גבוה', critical: 'קריטי',
};

export default function Tickets() {
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<TicketWithCustomer | null>(null);
  const [closeDialog, setCloseDialog] = useState<TicketWithCustomer | null>(null);
  const navigate = useNavigate();

  const refresh = () => setCustomers(getCustomers());

  const allTickets: TicketWithCustomer[] = useMemo(() => {
    return customers.flatMap(c =>
      (c.tickets || []).map(t => ({ ticket: t, customerId: c.id, customerName: c.name }))
    );
  }, [customers]);

  const filtered = useMemo(() => {
    let items = allTickets;
    if (statusFilter !== "all") items = items.filter(t => t.ticket.status === statusFilter);
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(t =>
        t.ticket.subject.toLowerCase().includes(s) ||
        t.customerName.toLowerCase().includes(s) ||
        t.ticket.assignee?.toLowerCase().includes(s)
      );
    }
    return items.sort((a, b) => new Date(b.ticket.updatedAt).getTime() - new Date(a.ticket.updatedAt).getTime());
  }, [allTickets, search, statusFilter]);

  const stats = useMemo(() => ({
    total: allTickets.length,
    open: allTickets.filter(t => t.ticket.status === 'open').length,
    inProgress: allTickets.filter(t => t.ticket.status === 'in-progress').length,
    resolved: allTickets.filter(t => t.ticket.status === 'resolved' || t.ticket.status === 'closed').length,
  }), [allTickets]);

  const handleAddTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const customerId = fd.get("customerId") as string;
    const now = new Date().toISOString().split('T')[0];
    addTicketToCustomer(customerId, {
      subject: fd.get("subject") as string,
      description: fd.get("description") as string,
      status: fd.get("status") as Ticket["status"],
      priority: fd.get("priority") as Ticket["priority"],
      assignee: fd.get("assignee") as string,
      createdAt: now,
      updatedAt: now,
      imageUrl: '',
      notes: fd.get("notes") as string,
      resolution: '',
    });
    refresh();
    setAddDialog(false);
    toast.success("קריאה נוספה");
  };

  const handleEditTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDialog) return;
    const fd = new FormData(e.currentTarget);
    updateTicketInCustomer(editDialog.customerId, editDialog.ticket.id, {
      subject: fd.get("subject") as string,
      description: fd.get("description") as string,
      priority: fd.get("priority") as Ticket["priority"],
      assignee: fd.get("assignee") as string,
      notes: fd.get("notes") as string,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    refresh();
    setEditDialog(null);
    toast.success("קריאה עודכנה");
  };

  const handleCloseTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!closeDialog) return;
    const fd = new FormData(e.currentTarget);
    const newStatus = fd.get("status") as Ticket["status"];
    updateTicketInCustomer(closeDialog.customerId, closeDialog.ticket.id, {
      status: newStatus,
      resolution: fd.get("resolution") as string,
      updatedAt: new Date().toISOString().split('T')[0],
    });
    refresh();
    setCloseDialog(null);
    toast.success("קריאה נסגרה");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">קריאות שירות</h1>
          <p className="text-muted-foreground text-sm mt-1">ניהול כל הקריאות מכל הלקוחות</p>
        </div>
        <Button className="gap-2" onClick={() => setAddDialog(true)}>
          <Plus className="h-4 w-4" />קריאה חדשה
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'סה"כ קריאות', value: stats.total, icon: TicketCheck, color: "bg-primary/15 text-primary" },
          { label: 'פתוחות', value: stats.open, icon: AlertCircle, color: "bg-red-500/15 text-red-400" },
          { label: 'בטיפול', value: stats.inProgress, icon: Clock, color: "bg-amber-500/15 text-amber-400" },
          { label: 'נפתרו/נסגרו', value: stats.resolved, icon: CheckCircle2, color: "bg-emerald-500/15 text-emerald-400" },
        ].map((s, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="חיפוש לפי נושא, לקוח, מטפל..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            {TICKET_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <TicketCheck className="h-14 w-14 mx-auto mb-4 opacity-20" />
            <p className="text-lg">אין קריאות</p>
          </div>
        )}
        {filtered.map(({ ticket, customerId, customerName }) => (
          <Card key={ticket.id} className={`border-border hover:border-glow transition-all ${(ticket.status === 'open' || ticket.status === 'in-progress') ? 'border-r-4 border-r-red-500/60' : ''}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground">{ticket.subject}</p>
                    <StatusBadge status={ticket.status} />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[ticket.priority]}`}>
                      {priorityLabel[ticket.priority]}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/customers/${customerId}`)}
                    className="text-sm text-primary hover:underline mt-1 inline-block"
                  >
                    {customerName}
                  </button>
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
                  {ticket.notes && !ticket.resolution && (
                    <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded">{ticket.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditDialog({ ticket, customerId, customerName })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400" onClick={() => setCloseDialog({ ticket, customerId, customerName })}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { removeTicketFromCustomer(customerId, ticket.id); refresh(); toast.success("קריאה נמחקה"); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>קריאה חדשה</DialogTitle></DialogHeader>
          <form onSubmit={handleAddTicket} className="space-y-3">
            <div className="space-y-1">
              <Label>לקוח</Label>
              <Select name="customerId" required>
                <SelectTrigger><SelectValue placeholder="בחר לקוח..." /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>נושא</Label><Input name="subject" required /></div>
            <div className="space-y-1"><Label>תיאור</Label><Textarea name="description" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>סטטוס</Label>
                <Select name="status" defaultValue="open">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TICKET_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>עדיפות</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TICKET_PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>מטפל</Label><Input name="assignee" /></div>
            <div className="space-y-1"><Label>הערות</Label><Textarea name="notes" /></div>
            <Button type="submit" className="w-full">פתח קריאה</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={(o) => !o && setEditDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>עריכת קריאה</DialogTitle></DialogHeader>
          {editDialog && (
            <form onSubmit={handleEditTicket} className="space-y-3">
              <div className="space-y-1"><Label>נושא</Label><Input name="subject" defaultValue={editDialog.ticket.subject} required /></div>
              <div className="space-y-1"><Label>תיאור</Label><Textarea name="description" defaultValue={editDialog.ticket.description} /></div>
              <div className="space-y-1">
                <Label>עדיפות</Label>
                <Select name="priority" defaultValue={editDialog.ticket.priority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TICKET_PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>מטפל</Label><Input name="assignee" defaultValue={editDialog.ticket.assignee} /></div>
              <div className="space-y-1"><Label>הערות</Label><Textarea name="notes" defaultValue={editDialog.ticket.notes} /></div>
              <Button type="submit" className="w-full">שמור שינויים</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Close/Resolve Dialog */}
      <Dialog open={!!closeDialog} onOpenChange={(o) => !o && setCloseDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>סגירת קריאה</DialogTitle></DialogHeader>
          {closeDialog && (
            <form onSubmit={handleCloseTicket} className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="font-semibold text-foreground">{closeDialog.ticket.subject}</p>
                <p className="text-sm text-muted-foreground mt-1">{closeDialog.customerName}</p>
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
