export interface ProjectTask {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee: string;
  dueDate: string;
  notes: string;
}

export interface Project {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  tasks: ProjectTask[];
  notes: string;
  createdAt: string;
}

const PROJECT_STORAGE_KEY = 'secureops-crm-projects';

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

const PROJECT_STATUS_LABELS: Record<Project['status'], string> = {
  planning: 'תכנון',
  active: 'פעיל',
  'on-hold': 'מושהה',
  completed: 'הושלם',
  cancelled: 'בוטל',
};

const TASK_STATUS_LABELS: Record<ProjectTask['status'], string> = {
  todo: 'לביצוע',
  'in-progress': 'בתהליך',
  done: 'הושלם',
};

export const PROJECT_STATUSES: { value: Project['status']; label: string }[] = [
  { value: 'planning', label: 'תכנון' },
  { value: 'active', label: 'פעיל' },
  { value: 'on-hold', label: 'מושהה' },
  { value: 'completed', label: 'הושלם' },
  { value: 'cancelled', label: 'בוטל' },
];

export const PROJECT_PRIORITIES: { value: Project['priority']; label: string }[] = [
  { value: 'low', label: 'נמוך' },
  { value: 'medium', label: 'בינוני' },
  { value: 'high', label: 'גבוה' },
  { value: 'critical', label: 'קריטי' },
];

export const TASK_STATUSES: { value: ProjectTask['status']; label: string }[] = [
  { value: 'todo', label: 'לביצוע' },
  { value: 'in-progress', label: 'בתהליך' },
  { value: 'done', label: 'הושלם' },
];

export const getProjectStatusLabel = (s: Project['status']) => PROJECT_STATUS_LABELS[s];
export const getTaskStatusLabel = (s: ProjectTask['status']) => TASK_STATUS_LABELS[s];

// CRUD

export function getProjects(): Project[] {
  try {
    const data = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
}

export function addProject(project: Omit<Project, 'id' | 'createdAt' | 'tasks'>): Project {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: generateId(),
    createdAt: new Date().toISOString().split('T')[0],
    tasks: [],
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>): Project | undefined {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return undefined;
  projects[idx] = { ...projects[idx], ...updates };
  saveProjects(projects);
  return projects[idx];
}

export function deleteProject(id: string) {
  saveProjects(getProjects().filter(p => p.id !== id));
}

export function addTaskToProject(projectId: string, task: Omit<ProjectTask, 'id'>): ProjectTask | undefined {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return undefined;
  const newTask: ProjectTask = { ...task, id: generateId() };
  project.tasks.push(newTask);
  saveProjects(projects);
  return newTask;
}

export function updateTaskInProject(projectId: string, taskId: string, updates: Partial<ProjectTask>) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  const idx = project.tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;
  project.tasks[idx] = { ...project.tasks[idx], ...updates };
  saveProjects(projects);
}

export function removeTaskFromProject(projectId: string, taskId: string) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  project.tasks = project.tasks.filter(t => t.id !== taskId);
  saveProjects(projects);
}
