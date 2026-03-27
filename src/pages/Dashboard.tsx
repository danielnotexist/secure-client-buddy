import { useMemo } from "react";
import { getCustomers } from "@/lib/crm-data";
import { getProjects } from "@/lib/projects-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HardDrive, DollarSign, Activity, AlertTriangle, Wrench, TicketCheck, FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Dashboard() {
  const customers = useMemo(() => getCustomers(), []);
  const projects = useMemo(() => getProjects(), []);
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.monthlyPayment, 0);
    const totalAssets = customers.reduce((sum, c) => sum + c.assets.length, 0);
    const totalServices = customers.reduce((sum, c) => sum + c.services.length, 0);
    const expiringServices = customers.flatMap(c => c.services).filter(s => {
      const end = new Date(s.endDate);
      const now = new Date();
      const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff < 30 && diff > 0;
    }).length;
    const openTickets = customers.reduce((sum, c) => sum + (c.tickets || []).filter(t => t.status === 'open' || t.status === 'in-progress').length, 0);
    const activeProjects = projects.filter(p => p.status === 'active').length;

    return { totalCustomers, activeCustomers, totalRevenue, totalAssets, totalServices, expiringServices, openTickets, activeProjects };
  }, [customers, projects]);

  const cards = [
    { title: 'סה"כ לקוחות', value: stats.totalCustomers, icon: Users, color: "bg-primary/15 text-primary" },
    { title: "לקוחות פעילים", value: stats.activeCustomers, icon: Activity, color: "bg-emerald-500/15 text-emerald-400" },
    { title: "הכנסה חודשית", value: `₪${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-primary/15 text-primary" },
    { title: "נכסים מנוהלים", value: stats.totalAssets, icon: HardDrive, color: "bg-violet-500/15 text-violet-400" },
    { title: "שירותים פעילים", value: stats.totalServices, icon: Wrench, color: "bg-sky-500/15 text-sky-400" },
    { title: "פרויקטים פעילים", value: stats.activeProjects, icon: FolderKanban, color: "bg-indigo-500/15 text-indigo-400" },
    { title: "קריאות פתוחות", value: stats.openTickets, icon: TicketCheck, color: stats.openTickets > 0 ? "bg-red-500/15 text-red-400" : "bg-muted/50 text-muted-foreground" },
    { title: "שירותים שפגים בקרוב", value: stats.expiringServices, icon: AlertTriangle, color: stats.expiringServices > 0 ? "bg-amber-500/15 text-amber-400" : "bg-muted/50 text-muted-foreground" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">לוח בקרה</h1>
        <p className="text-muted-foreground text-sm mt-1">סקירה כללית של מערכת ניהול הלקוחות</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="border-border hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold text-foreground leading-tight">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Customers */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">לקוחות אחרונים</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {customers.slice(0, 5).map((customer) => {
              const primary = customer.contacts.find(c => c.isPrimary) || customer.contacts[0];
              const openTickets = (customer.tickets || []).filter(t => t.status === 'open' || t.status === 'in-progress').length;
              return (
                <div
                  key={customer.id}
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      {customer.avatarUrl ? <AvatarImage src={customer.avatarUrl} alt={customer.name} /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{customer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate">{customer.name}</p>
                        <StatusBadge status={customer.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{primary?.name || 'ללא איש קשר'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-left">
                      <p className="text-sm font-bold text-primary">₪{customer.monthlyPayment.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{customer.services.length} שירותים • {customer.assets.length} נכסים</p>
                    </div>
                    {openTickets > 0 && (
                      <span className="bg-red-50 text-red-600 text-xs font-medium px-2 py-1 rounded-full">{openTickets} קריאות</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
