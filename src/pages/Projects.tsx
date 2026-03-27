import { useState, useMemo } from "react";
import {
  getProjects, addProject, deleteProject, updateProject,
  addTaskToProject, updateTaskInProject, removeTaskFromProject,
  PROJECT_STATUSES, PROJECT_PRIORITIES, TASK_STATUSES,
  getProjectStatusLabel, getTaskStatusLabel,
  type Project, type ProjectTask,
} from "@/lib/projects-data";
import { getCustomers } from "@/lib/crm-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Search, FolderKanban, CheckCircle2, Clock, ListTodo, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const priorityColor: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

const statusColor: Record<string, string> = {
  planning: 'bg-muted text-muted-foreground',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'on-hold': 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-primary/10 text-primary',
  cancelled: 'bg-red-50 text-red-500',
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(() => getProjects());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [taskDialogProject, setTaskDialogProject] = useState<string | null>(null);
  const customers = useMemo(() => getCustomers(), []);

  const filtered = useMemo(() => {
    if (!search) return projects;
    const s = search.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.customerName.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s)
    );
  }, [projects, search]);

  const refresh = () => setProjects(getProjects());

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const customerId = fd.get("customerId") as string;
    const customer = customers.find(c => c.id === customerId);
    addProject({
      name: fd.get("name") as string,
      customerId,
      customerName: customer?.name || '',
      status: fd.get("status") as Project["status"],
      priority: fd.get("priority") as Project["priority"],
      description: fd.get("description") as string,
      startDate: fd.get("startDate") as string,
      endDate: fd.get("endDate") as string,
      budget: Number(fd.get("budget") || 0),
      notes: fd.get("notes") as string,
    });
    refresh();
    setDialogOpen(false);
    toast.success("פרויקט נוצר בהצלחה");
  };

  const handleAddTask = (e: React.FormEvent<HTMLFormElement>, projectId: string) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addTaskToProject(projectId, {
      title: fd.get("title") as string,
      status: 'todo',
      assignee: fd.get("assignee") as string,
      dueDate: fd.get("dueDate") as string,
      notes: '',
    });
    refresh();
    setTaskDialogProject(null);
    toast.success("משימה נוספה");
  };

  // Stats
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">פרויקטים</h1>
          <p className="text-muted-foreground text-sm mt-1">ניהול ומעקב אחר פרויקטים ללקוחות</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />פרויקט חדש</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>פרויקט חדש</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1"><Label>שם הפרויקט</Label><Input name="name" required /></div>
              <div className="space-y-1">
                <Label>לקוח</Label>
                <Select name="customerId" required>
                  <SelectTrigger><SelectValue placeholder="בחר לקוח..." /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>סטטוס</Label>
                  <Select name="status" defaultValue="planning">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>עדיפות</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROJECT_PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>תאריך התחלה</Label><Input name="startDate" type="date" dir="ltr" /></div>
                <div className="space-y-1"><Label>תאריך סיום</Label><Input name="endDate" type="date" dir="ltr" /></div>
              </div>
              <div className="space-y-1"><Label>תקציב (₪)</Label><Input name="budget" type="number" dir="ltr" defaultValue={0} /></div>
              <div className="space-y-1"><Label>תיאור</Label><Textarea name="description" /></div>
              <div className="space-y-1"><Label>הערות</Label><Textarea name="notes" /></div>
              <Button type="submit" className="w-full">צור פרויקט</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">סה"כ פרויקטים</p>
              <p className="text-2xl font-bold text-foreground">{projects.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">פעילים</p>
              <p className="text-2xl font-bold text-foreground">{activeProjects}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">הושלמו</p>
              <p className="text-2xl font-bold text-foreground">{completedProjects}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <ListTodo className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">משימות פתוחות</p>
              <p className="text-2xl font-bold text-foreground">{projects.reduce((sum, p) => sum + p.tasks.filter(t => t.status !== 'done').length, 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="חיפוש פרויקט..." value={search} onChange={e => setSearch(e.target.value)} className="pr-10" />
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FolderKanban className="h-14 w-14 mx-auto mb-4 opacity-20" />
            <p className="text-lg">אין פרויקטים עדיין</p>
            <p className="text-sm mt-1">לחץ על "פרויקט חדש" כדי להתחיל</p>
          </div>
        )}
        {filtered.map(project => {
          const isExpanded = expandedProject === project.id;
          const doneTasks = project.tasks.filter(t => t.status === 'done').length;
          const totalTasks = project.tasks.length;
          const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

          return (
            <Card key={project.id} className="border-border overflow-hidden">
              <CardContent className="p-0">
                {/* Project Header */}
                <div
                  className="p-5 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg text-foreground">{project.name}</h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusColor[project.status]}`}>
                          {getProjectStatusLabel(project.status)}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${priorityColor[project.priority]}`}>
                          {PROJECT_PRIORITIES.find(p => p.value === project.priority)?.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{project.customerName}</p>
                      {project.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.description}</p>}
                      <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
                        {project.startDate && <span>התחלה: {project.startDate}</span>}
                        {project.endDate && <span>סיום: {project.endDate}</span>}
                        {project.budget > 0 && <span>תקציב: ₪{project.budget.toLocaleString()}</span>}
                        <span>{doneTasks}/{totalTasks} משימות הושלמו</span>
                      </div>
                      {totalTasks > 0 && (
                        <div className="mt-3 max-w-xs">
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={(e) => { e.stopPropagation(); deleteProject(project.id); refresh(); toast.success("פרויקט נמחק"); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Tasks */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/10 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">משימות ({totalTasks})</h4>
                      <Dialog open={taskDialogProject === project.id} onOpenChange={(o) => setTaskDialogProject(o ? project.id : null)}>
                        <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1"><Plus className="h-4 w-4" />משימה חדשה</Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>משימה חדשה</DialogTitle></DialogHeader>
                          <form onSubmit={(e) => handleAddTask(e, project.id)} className="space-y-3">
                            <div className="space-y-1"><Label>כותרת</Label><Input name="title" required /></div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1"><Label>אחראי</Label><Input name="assignee" /></div>
                              <div className="space-y-1"><Label>תאריך יעד</Label><Input name="dueDate" type="date" dir="ltr" /></div>
                            </div>
                            <Button type="submit" className="w-full">הוסף משימה</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {project.tasks.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-6">אין משימות עדיין</p>
                    ) : (
                      <div className="space-y-2">
                        {project.tasks.map(task => (
                          <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                {task.assignee && <span>אחראי: {task.assignee}</span>}
                                {task.dueDate && <span>יעד: {task.dueDate}</span>}
                              </div>
                            </div>
                            <Select value={task.status} onValueChange={v => { updateTaskInProject(project.id, task.id, { status: v as ProjectTask['status'] }); refresh(); }}>
                              <SelectTrigger className="h-8 text-xs w-24"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {TASK_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => { removeTaskFromProject(project.id, task.id); refresh(); toast.success("משימה נמחקה"); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status change */}
                    <div className="flex items-center gap-3 pt-2 border-t border-border">
                      <Label className="text-sm">סטטוס פרויקט:</Label>
                      <Select value={project.status} onValueChange={v => { updateProject(project.id, { status: v as Project['status'] }); refresh(); toast.success("סטטוס עודכן"); }}>
                        <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PROJECT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
