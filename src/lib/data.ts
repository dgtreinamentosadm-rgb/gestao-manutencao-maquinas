import { Machine, MaintenanceTask, DashboardStats, PreventiveMaintenanceItem } from './types';

// Função para formatar data de forma consistente (evita problemas de hidratação)
function formatDateConsistently(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

// Dados mockados para máquinas com planos de manutenção preventiva
export const mockMachines: Machine[] = [
  {
    id: '1',
    name: 'Torno CNC Principal',
    model: 'CNC-2000X',
    manufacturer: 'TechMach',
    serialNumber: 'TM-2000-001',
    location: 'Setor A - Linha 1',
    status: 'operational',
    installationDate: '2022-01-15',
    acquisitionDate: '2021-12-10',
    lastMaintenanceDate: '2024-11-15',
    nextMaintenanceDate: '2025-02-15',
    operatingHours: 2450,
    maintenancePlan: [
      {
        id: 'mp1',
        taskName: 'Troca de óleo hidráulico',
        description: 'Substituição completa do óleo hidráulico e filtros',
        scheduleType: 'time',
        intervalValue: 3,
        intervalUnit: 'months',
        isActive: true,
        lastExecutionDate: '2024-11-15',
        nextScheduledDate: '2025-02-15'
      },
      {
        id: 'mp2',
        taskName: 'Verificação de rolamentos',
        description: 'Inspeção e lubrificação dos rolamentos principais',
        scheduleType: 'usage',
        usageLimit: 500,
        usageUnit: 'hours',
        currentUsage: 150,
        isActive: true,
        lastExecutionDate: '2024-10-01',
        nextScheduledDate: '2024-12-20'
      },
      {
        id: 'mp3',
        taskName: 'Calibração de precisão',
        description: 'Verificação e ajuste da precisão dimensional',
        scheduleType: 'time',
        intervalValue: 6,
        intervalUnit: 'months',
        isActive: true,
        lastExecutionDate: '2024-08-01',
        nextScheduledDate: '2025-02-01'
      }
    ]
  },
  {
    id: '2',
    name: 'Fresadora Universal',
    model: 'FU-500',
    manufacturer: 'MachineWorks',
    serialNumber: 'MW-FU-002',
    location: 'Setor B - Linha 2',
    status: 'maintenance',
    installationDate: '2021-08-20',
    acquisitionDate: '2021-07-15',
    lastMaintenanceDate: '2024-12-01',
    nextMaintenanceDate: '2024-12-15',
    operatingHours: 3200,
    maintenancePlan: [
      {
        id: 'mp4',
        taskName: 'Manutenção do sistema de refrigeração',
        description: 'Limpeza e verificação do sistema de refrigeração',
        scheduleType: 'time',
        intervalValue: 2,
        intervalUnit: 'months',
        isActive: true,
        lastExecutionDate: '2024-10-15',
        nextScheduledDate: '2024-12-15'
      },
      {
        id: 'mp5',
        taskName: 'Substituição de correias',
        description: 'Troca das correias de transmissão',
        scheduleType: 'usage',
        usageLimit: 800,
        usageUnit: 'hours',
        currentUsage: 650,
        isActive: true,
        lastExecutionDate: '2024-07-10',
        nextScheduledDate: '2025-01-05'
      }
    ]
  },
  {
    id: '3',
    name: 'Prensa Hidráulica',
    model: 'PH-1000',
    manufacturer: 'HydroPress',
    serialNumber: 'HP-1000-003',
    location: 'Setor C - Linha 1',
    status: 'operational',
    installationDate: '2023-03-10',
    acquisitionDate: '2023-02-20',
    lastMaintenanceDate: '2024-11-20',
    nextMaintenanceDate: '2024-12-20',
    operatingHours: 1800,
    maintenancePlan: [
      {
        id: 'mp6',
        taskName: 'Verificação do sistema hidráulico',
        description: 'Inspeção de vazamentos e pressão do sistema',
        scheduleType: 'time',
        intervalValue: 1,
        intervalUnit: 'months',
        isActive: true,
        lastExecutionDate: '2024-11-20',
        nextScheduledDate: '2024-12-20'
      },
      {
        id: 'mp7',
        taskName: 'Troca de vedações',
        description: 'Substituição de vedações e anéis de vedação',
        scheduleType: 'usage',
        usageLimit: 1000,
        usageUnit: 'cycles',
        currentUsage: 750,
        isActive: true,
        lastExecutionDate: '2024-09-15',
        nextScheduledDate: '2025-01-10'
      }
    ]
  },
  {
    id: '4',
    name: 'Máquina de Solda',
    model: 'MS-300A',
    manufacturer: 'WeldTech',
    serialNumber: 'WT-MS-004',
    location: 'Setor D - Bancada 1',
    status: 'critical',
    installationDate: '2020-11-05',
    acquisitionDate: '2020-10-15',
    lastMaintenanceDate: '2024-10-10',
    nextMaintenanceDate: '2024-12-10',
    operatingHours: 4500,
    maintenancePlan: [
      {
        id: 'mp8',
        taskName: 'Limpeza dos eletrodos',
        description: 'Limpeza e verificação dos eletrodos de solda',
        scheduleType: 'usage',
        usageLimit: 200,
        usageUnit: 'hours',
        currentUsage: 180,
        isActive: true,
        lastExecutionDate: '2024-11-01',
        nextScheduledDate: '2024-12-15'
      },
      {
        id: 'mp9',
        taskName: 'Verificação de cabos e conexões',
        description: 'Inspeção de cabos elétricos e conexões',
        scheduleType: 'time',
        intervalValue: 3,
        intervalUnit: 'months',
        isActive: true,
        lastExecutionDate: '2024-09-10',
        nextScheduledDate: '2024-12-10'
      }
    ]
  }
];

// Dados mockados para tarefas de manutenção
export const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: 't1',
    machineId: '1',
    machineName: 'Torno CNC Principal',
    type: 'preventive',
    title: 'Troca de óleo hidráulico',
    description: 'Substituição completa do óleo hidráulico e filtros do sistema',
    scheduledDate: '2025-02-15',
    status: 'pending',
    priority: 'medium',
    estimatedDuration: 3,
    assignedTo: 'João Silva',
    cost: 850,
    preventiveItemId: 'mp1'
  },
  {
    id: 't2',
    machineId: '2',
    machineName: 'Fresadora Universal',
    type: 'preventive',
    title: 'Manutenção do sistema de refrigeração',
    description: 'Limpeza e verificação completa do sistema de refrigeração',
    scheduledDate: '2024-12-15',
    status: 'in-progress',
    priority: 'high',
    estimatedDuration: 4,
    assignedTo: 'Maria Santos',
    cost: 650,
    preventiveItemId: 'mp4'
  },
  {
    id: 't3',
    machineId: '4',
    machineName: 'Máquina de Solda',
    type: 'preventive',
    title: 'Verificação de cabos e conexões',
    description: 'Inspeção detalhada de cabos elétricos e conexões',
    scheduledDate: '2024-12-10',
    status: 'overdue',
    priority: 'urgent',
    estimatedDuration: 2,
    assignedTo: 'Carlos Oliveira',
    cost: 300,
    preventiveItemId: 'mp9'
  },
  {
    id: 't4',
    machineId: '3',
    machineName: 'Prensa Hidráulica',
    type: 'preventive',
    title: 'Verificação do sistema hidráulico',
    description: 'Inspeção de vazamentos e verificação da pressão do sistema',
    scheduledDate: '2024-12-20',
    status: 'pending',
    priority: 'medium',
    estimatedDuration: 2,
    assignedTo: 'Ana Costa',
    cost: 400,
    preventiveItemId: 'mp6'
  },
  {
    id: 't5',
    machineId: '1',
    machineName: 'Torno CNC Principal',
    type: 'corrective',
    title: 'Reparo no sistema de alimentação',
    description: 'Correção de problema no sistema de alimentação de material',
    scheduledDate: '2024-11-25',
    completedDate: '2024-11-26',
    status: 'completed',
    priority: 'high',
    estimatedDuration: 6,
    actualDuration: 7,
    assignedTo: 'Pedro Alves',
    cost: 1200,
    notes: 'Substituída peça defeituosa no alimentador'
  },
  {
    id: 't6',
    machineId: '2',
    machineName: 'Fresadora Universal',
    type: 'preventive',
    title: 'Substituição de correias',
    description: 'Troca das correias de transmissão do motor principal',
    scheduledDate: '2025-01-05',
    status: 'pending',
    priority: 'medium',
    estimatedDuration: 3,
    assignedTo: 'Roberto Lima',
    cost: 450,
    preventiveItemId: 'mp5'
  }
];

// Função para calcular estatísticas do dashboard
export function calculateDashboardStats(machines: Machine[], tasks: MaintenanceTask[]): DashboardStats {
  const totalMachines = machines.length;
  const operationalMachines = machines.filter(m => m.status === 'operational').length;
  const machinesInMaintenance = machines.filter(m => m.status === 'maintenance').length;
  const criticalMachines = machines.filter(m => m.status === 'critical').length;
  
  const pendingMaintenances = tasks.filter(t => t.status === 'pending').length;
  const overdueMaintenances = tasks.filter(t => t.status === 'overdue').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const completedThisMonth = tasks.filter(t => {
    if (!t.completedDate) return false;
    const completedDate = new Date(t.completedDate);
    return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear;
  }).length;
  
  const totalCostThisMonth = tasks
    .filter(t => {
      if (!t.completedDate) return false;
      const completedDate = new Date(t.completedDate);
      return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + (t.cost || 0), 0);
  
  const completedTasks = tasks.filter(t => t.status === 'completed' && t.actualDuration);
  const averageCompletionTime = completedTasks.length > 0
    ? completedTasks.reduce((sum, t) => sum + (t.actualDuration || 0), 0) / completedTasks.length
    : 0;
  
  const onTimeTasks = tasks.filter(t => 
    t.status === 'completed' && 
    t.scheduledDate && 
    t.completedDate &&
    new Date(t.completedDate) <= new Date(t.scheduledDate)
  ).length;
  
  const totalCompletedTasks = tasks.filter(t => t.status === 'completed').length;
  const maintenanceEfficiency = totalCompletedTasks > 0 ? (onTimeTasks / totalCompletedTasks) * 100 : 0;
  
  return {
    totalMachines,
    operationalMachines,
    machinesInMaintenance,
    criticalMachines,
    pendingMaintenances,
    overdueMaintenances,
    completedThisMonth,
    totalCostThisMonth,
    averageCompletionTime,
    maintenanceEfficiency
  };
}

// Função para obter cor baseada no status
export function getStatusColor(status: string): string {
  switch (status) {
    case 'operational':
      return 'bg-green-100 text-green-800';
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800';
    case 'stopped':
      return 'bg-gray-100 text-gray-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-blue-100 text-blue-800';
    case 'in-progress':
      return 'bg-orange-100 text-orange-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Função para obter cor baseada na prioridade
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Função para formatar data de forma consistente entre servidor e cliente
export function formatDate(dateString: string): string {
  return formatDateConsistently(dateString);
}

// Função para calcular próxima data de manutenção baseada no tipo de agendamento
export function calculateNextMaintenanceDate(
  item: PreventiveMaintenanceItem,
  completionDate: Date = new Date()
): Date {
  const nextDate = new Date(completionDate);
  
  if (item.scheduleType === 'time' && item.intervalValue && item.intervalUnit) {
    switch (item.intervalUnit) {
      case 'days':
        nextDate.setDate(nextDate.getDate() + item.intervalValue);
        break;
      case 'weeks':
        nextDate.setDate(nextDate.getDate() + (item.intervalValue * 7));
        break;
      case 'months':
        nextDate.setMonth(nextDate.getMonth() + item.intervalValue);
        break;
      case 'years':
        nextDate.setFullYear(nextDate.getFullYear() + item.intervalValue);
        break;
    }
  }
  
  return nextDate;
}

// Função para gerar automaticamente a próxima OS após conclusão
export function generateNextMaintenanceTask(
  completedTask: MaintenanceTask,
  machine: Machine,
  completionDate: Date = new Date()
): MaintenanceTask | null {
  if (completedTask.type !== 'preventive' || !completedTask.preventiveItemId) {
    return null;
  }
  
  const preventiveItem = machine.maintenancePlan.find(
    item => item.id === completedTask.preventiveItemId
  );
  
  if (!preventiveItem || !preventiveItem.isActive) {
    return null;
  }
  
  const nextDate = calculateNextMaintenanceDate(preventiveItem, completionDate);
  
  // Para agendamentos por uso, só gera nova OS se o limite de uso for atingido
  if (preventiveItem.scheduleType === 'usage') {
    if (!preventiveItem.currentUsage || !preventiveItem.usageLimit) {
      return null;
    }
    
    if (preventiveItem.currentUsage < preventiveItem.usageLimit) {
      // Reset do contador de uso
      preventiveItem.currentUsage = 0;
      return null;
    }
  }
  
  const newTask: MaintenanceTask = {
    id: `auto_${Date.now()}`,
    machineId: machine.id,
    machineName: machine.name,
    type: 'preventive',
    title: preventiveItem.taskName,
    description: preventiveItem.description,
    scheduledDate: nextDate.toISOString().split('T')[0],
    status: 'pending',
    priority: 'medium',
    estimatedDuration: completedTask.estimatedDuration,
    assignedTo: completedTask.assignedTo,
    cost: completedTask.cost,
    preventiveItemId: preventiveItem.id
  };
  
  // Atualizar o item do plano de manutenção
  preventiveItem.lastExecutionDate = completionDate.toISOString().split('T')[0];
  preventiveItem.nextScheduledDate = nextDate.toISOString().split('T')[0];
  
  if (preventiveItem.scheduleType === 'usage') {
    preventiveItem.currentUsage = 0;
  }
  
  return newTask;
}

// Função para gerar primeira OS ao cadastrar máquina com plano de manutenção
export function generateInitialMaintenanceTasks(machine: Machine): MaintenanceTask[] {
  const tasks: MaintenanceTask[] = [];
  
  machine.maintenancePlan.forEach(item => {
    if (!item.isActive) return;
    
    let scheduledDate: Date;
    
    if (item.scheduleType === 'time' && item.intervalValue && item.intervalUnit) {
      scheduledDate = calculateNextMaintenanceDate(item, new Date(machine.acquisitionDate));
    } else if (item.scheduleType === 'usage' && item.usageLimit) {
      // Para agendamento por uso, agenda para uma data estimada baseada no uso médio
      const estimatedDays = Math.ceil(item.usageLimit / 8); // Assumindo 8 horas de uso por dia
      scheduledDate = new Date(machine.acquisitionDate);
      scheduledDate.setDate(scheduledDate.getDate() + estimatedDays);
    } else {
      return; // Pula se não tiver configuração válida
    }
    
    const task: MaintenanceTask = {
      id: `init_${machine.id}_${item.id}`,
      machineId: machine.id,
      machineName: machine.name,
      type: 'preventive',
      title: item.taskName,
      description: item.description,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      status: 'pending',
      priority: 'medium',
      estimatedDuration: 2, // Duração padrão
      preventiveItemId: item.id
    };
    
    tasks.push(task);
    
    // Atualizar o item do plano
    item.nextScheduledDate = scheduledDate.toISOString().split('T')[0];
  });
  
  return tasks;
}