// Tipos para o sistema de manutenção preventiva

export interface Machine {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  location: string;
  status: 'operational' | 'maintenance' | 'stopped' | 'critical';
  installationDate: string;
  acquisitionDate: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  operatingHours?: number;
  maintenancePlan: PreventiveMaintenanceItem[];
}

export interface PreventiveMaintenanceItem {
  id: string;
  taskName: string;
  description: string;
  scheduleType: 'time' | 'usage';
  // Para agendamento por tempo
  intervalValue?: number;
  intervalUnit?: 'days' | 'weeks' | 'months' | 'years';
  // Para agendamento por uso
  usageLimit?: number;
  usageUnit?: 'hours' | 'cycles' | 'tons' | 'km';
  currentUsage?: number;
  isActive: boolean;
  lastExecutionDate?: string;
  nextScheduledDate?: string;
}

export interface MaintenanceTask {
  id: string;
  machineId: string;
  machineName: string;
  type: 'preventive' | 'corrective' | 'predictive';
  title: string;
  description: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedDuration: number; // em horas
  actualDuration?: number;
  assignedTo?: string;
  cost?: number;
  notes?: string;
  preventiveItemId?: string; // Referência ao item do plano de manutenção
}

export interface DashboardStats {
  totalMachines: number;
  operationalMachines: number;
  machinesInMaintenance: number;
  criticalMachines: number;
  pendingMaintenances: number;
  overdueMaintenances: number;
  completedThisMonth: number;
  totalCostThisMonth: number;
  averageCompletionTime: number;
  maintenanceEfficiency: number;
}

export interface MaintenanceNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

// Tipos para relatórios
export interface MaintenanceReport {
  id: string;
  title: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  data: {
    totalTasks: number;
    completedTasks: number;
    totalCost: number;
    averageDuration: number;
    machineEfficiency: Record<string, number>;
  };
}

// Enums para facilitar o uso
export const ScheduleType = {
  TIME: 'time' as const,
  USAGE: 'usage' as const
};

export const IntervalUnit = {
  DAYS: 'days' as const,
  WEEKS: 'weeks' as const,
  MONTHS: 'months' as const,
  YEARS: 'years' as const
};

export const UsageUnit = {
  HOURS: 'hours' as const,
  CYCLES: 'cycles' as const,
  TONS: 'tons' as const,
  KM: 'km' as const
};

export const TaskStatus = {
  PENDING: 'pending' as const,
  IN_PROGRESS: 'in-progress' as const,
  COMPLETED: 'completed' as const,
  OVERDUE: 'overdue' as const
};

export const TaskPriority = {
  URGENT: 'urgent' as const,
  HIGH: 'high' as const,
  MEDIUM: 'medium' as const,
  LOW: 'low' as const
};

export const MachineStatus = {
  OPERATIONAL: 'operational' as const,
  MAINTENANCE: 'maintenance' as const,
  STOPPED: 'stopped' as const,
  CRITICAL: 'critical' as const
};