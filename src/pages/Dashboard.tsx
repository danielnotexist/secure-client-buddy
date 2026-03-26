import { useMemo } from "react";
import { getCustomers } from "@/lib/crm-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HardDrive, DollarSign, Activity, AlertTriangle, Wrench, TicketCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";

export default function Dashboard() {
  const customers = useMemo(() => getCustomers(), []);
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.monthlyPayment, 0);
    const totalAssets = customers.reduce((sum, c) => sum + c.assets.length, 0);
    const totalServices = customers.reduce((sum, c) => sum + c.services.length, 0);
    const totalDocuments = customers.reduce((sum, c) => sum + c.documents.length, 0);
    const expiringServices = customers.flatMap(c => c.services).filter(s => {
      const end = new Date(s.endDate);
      const now = new Date();
      const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff < 30 && diff > 0;
    }).length;
    const openTickets = customers.reduce((sum, c) => sum + (c.tickets || []).filter(t => t.status === 'open' || t.status === 'in-progress').length, 0);

    return { totalCustomers, activeCustomers, totalRevenue, totalAssets, totalServices, totalDocuments, expiringServices, openTickets };
  }, [customers]);

  const cards = [
    { title: 'סה"כ לקוחות', value: stats.totalCustomers, icon: Users, accent: "text-primary" },
    { title: "לקוחות פעילים", value: stats.activeCustomers, icon: Activity, accent: "text-success" },
    { title: "הכנסה חודשית", value: `₪${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, accent: "text-primary" },
    { title: "נכסים מנוהלים", value: stats.totalAssets, icon: HardDrive, accent: "text-primary" },
    { title: "שירותים פעילים", value: stats.totalServices, icon: Wrench, accent: "text-primary" },
    { title: "שירותים שפגים בקרוב", value: stats.expiringServices, icon: AlertTriangle, accent: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">לוח בקרה</h1>
        <p className="text-muted-foreground text-sm mt-1">סקירה כללית של מערכת ניהול הלקוחות</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="bg-card border-border hover:border-glow transition-all duration-300 cursor-pointer glow-cyber">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.accent}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">לקוחות אחרונים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {customers.slice(0, 5).map((customer) => {
              const primary = customer.contacts.find(c => c.isPrimary) || customer.contacts[0];
              return (
                <div
                  key={customer.id}
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{customer.name}</p>
                        <StatusBadge status={customer.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">{primary?.name || 'ללא איש קשר'}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-primary">₪{customer.monthlyPayment.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{customer.services.length} שירותים • {customer.assets.length} נכסים</p>
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
