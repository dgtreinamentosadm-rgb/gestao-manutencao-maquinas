"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { 
  LayoutDashboard, 
  Settings, 
  Calendar, 
  FileText, 
  Bell,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wrench,
  BarChart3,
  Users,
  Shield
} from 'lucide-react';

import DashboardOverview from '@/components/DashboardOverview';
import MachineManagement from '@/components/MachineManagement';
import { Machine, MaintenanceTask, DashboardStats } from '@/lib/types';
import { 
  mockMachines, 
  mockMaintenanceTasks, 
  calculateDashboardStats,
  getStatusColor,
  getPriorityColor,
  generateNextMaintenanceTask,
  generateInitialMaintenanceTasks
} from '@/lib/data';

// Função para formatação consistente de data (evita hidratação)
function formatDateSafely(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export default function MaintenanceApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [machines, setMachines] = useState<Machine[]>(mockMachines);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(mockMaintenanceTasks);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(
    calculateDashboardStats(mockMachines, mockMaintenanceTasks)
  );

  // Filtros para tarefas
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>('all');
  const [taskFilterPriority, setTaskFilterPriority] = useState<string>('all');

  // Atualizar estatísticas quando dados mudarem
  useEffect(() => {
    setDashboardStats(calculateDashboardStats(machines, maintenanceTasks));
  }, [machines, maintenanceTasks]);

  // Funções para gerenciar máquinas
  const handleAddMachine = (machineData: Omit<Machine, 'id'>) => {
    // CORRIGIDO: Usar timestamp fixo para evitar diferenças servidor/cliente
    const newMachine: Machine = {
      ...machineData,
      id: `machine_${1733760000000 + Math.floor(Math.random() * 1000)}`
    };
    
    // Gerar tarefas iniciais baseadas no plano de manutenção
    const initialTasks = generateInitialMaintenanceTasks(newMachine);
    
    setMachines(prev => [...prev, newMachine]);
    setMaintenanceTasks(prev => [...prev, ...initialTasks]);
    
    // Notificação de sucesso
    if (initialTasks.length > 0) {
      toast({
        title: "Máquina cadastrada com sucesso!",
        description: `${initialTasks.length} tarefas de manutenção foram agendadas automaticamente.`,
      });
    }
  };

  const handleUpdateMachine = (id: string, updates: Partial<Machine>) => {
    setMachines(prev => prev.map(machine => {
      if (machine.id === id) {
        const updatedMachine = { ...machine, ...updates };
        
        // Se o plano de manutenção foi alterado, gerar novas tarefas se necessário
        if (updates.maintenancePlan) {
          const newItems = updates.maintenancePlan.filter(item => 
            item.isActive && !machine.maintenancePlan.find(existing => existing.id === item.id)
          );
          
          if (newItems.length > 0) {
            const newTasks = generateInitialMaintenanceTasks({ ...updatedMachine, maintenancePlan: newItems });
            setMaintenanceTasks(prev => [...prev, ...newTasks]);
            
            toast({
              title: "Plano de manutenção atualizado!",
              description: `${newTasks.length} novas tarefas foram agendadas.`,
            });
          }
        }
        
        return updatedMachine;
      }
      return machine;
    }));
  };

  const handleDeleteMachine = (id: string) => {
    setMachines(prev => prev.filter(machine => machine.id !== id));
    setMaintenanceTasks(prev => prev.filter(task => task.machineId !== id));
  };

  // Funções para gerenciar tarefas com agendamento automático
  const handleUpdateTaskStatus = (taskId: string, status: MaintenanceTask['status']) => {
    setMaintenanceTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        // CORRIGIDO: Usar data fixa para evitar diferenças servidor/cliente
        const completedDate = status === 'completed' ? '2024-12-09' : undefined;
        const updatedTask = { 
          ...task, 
          status,
          completedDate
        };
        
        // Se a tarefa foi concluída e é preventiva, gerar próxima OS automaticamente
        if (status === 'completed' && task.type === 'preventive' && task.preventiveItemId) {
          const machine = machines.find(m => m.id === task.machineId);
          if (machine) {
            const nextTask = generateNextMaintenanceTask(updatedTask, machine);
            if (nextTask) {
              // Adicionar a próxima tarefa
              setMaintenanceTasks(current => [...current, nextTask]);
              
              // Atualizar a máquina com as informações atualizadas do plano
              setMachines(currentMachines => currentMachines.map(m => 
                m.id === machine.id ? machine : m
              ));
              
              // Notificação de agendamento automático
              toast({
                title: "Manutenção concluída!",
                description: `Próxima manutenção agendada para ${formatDateSafely(nextTask.scheduledDate)}`,
              });
            } else {
              toast({
                title: "Manutenção concluída!",
                description: "Tarefa finalizada com sucesso.",
              });
            }
          }
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const handleAddMaintenanceTask = (taskData: Omit<MaintenanceTask, 'id'>) => {
    // CORRIGIDO: Usar timestamp fixo para evitar diferenças servidor/cliente
    const newTask: MaintenanceTask = {
      ...taskData,
      id: `task_${1733760000000 + Math.floor(Math.random() * 1000)}`
    };
    setMaintenanceTasks(prev => [...prev, newTask]);
  };

  // Filtrar tarefas
  const filteredTasks = maintenanceTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                         task.machineName.toLowerCase().includes(taskSearchTerm.toLowerCase());
    const matchesStatus = taskFilterStatus === 'all' || task.status === taskFilterStatus;
    const matchesPriority = taskFilterPriority === 'all' || task.priority === taskFilterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const upcomingTasks = maintenanceTasks.filter(task => 
    task.status === 'pending' || task.status === 'overdue'
  ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MaintenancePro</h1>
                <p className="text-xs text-gray-500">Sistema de Manutenção Preventiva</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notificações
                {dashboardStats.overdueMaintenances > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {dashboardStats.overdueMaintenances}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="machines" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Máquinas</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Manutenção</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Análises</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <DashboardOverview
              stats={dashboardStats}
              machines={machines}
              upcomingTasks={upcomingTasks}
              onViewMachines={() => setActiveTab('machines')}
              onViewTasks={() => setActiveTab('maintenance')}
            />
          </TabsContent>

          {/* Machines Tab */}
          <TabsContent value="machines">
            <MachineManagement
              machines={machines}
              onAddMachine={handleAddMachine}
              onUpdateMachine={handleUpdateMachine}
              onDeleteMachine={handleDeleteMachine}
            />
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold">Gestão de Manutenção</h2>
                <Button onClick={() => {
                  // Simular adição de nova tarefa
                  const machine = machines[0];
                  if (machine) {
                    // CORRIGIDO: Usar data fixa para evitar diferenças servidor/cliente
                    const scheduledDate = '2024-12-16'; // Data fixa em vez de Date.now()
                    handleAddMaintenanceTask({
                      machineId: machine.id,
                      machineName: machine.name,
                      type: 'preventive',
                      title: 'Nova Manutenção Preventiva',
                      description: 'Manutenção programada automaticamente',
                      scheduledDate,
                      status: 'pending',
                      priority: 'medium',
                      estimatedDuration: 2
                    });
                  }
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa
                </Button>
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar tarefas..."
                    value={taskSearchTerm}
                    onChange={(e) => setTaskSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={taskFilterStatus} onValueChange={setTaskFilterStatus}>
                  <SelectTrigger className="sm:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="overdue">Atrasada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={taskFilterPriority} onValueChange={setTaskFilterPriority}>
                  <SelectTrigger className="sm:w-48">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Prioridades</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de Tarefas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{task.machineName}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority === 'urgent' ? 'Urgente' :
                             task.priority === 'high' ? 'Alta' :
                             task.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                          {task.status === 'overdue' && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{task.description}</p>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{formatDateSafely(task.scheduledDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{task.estimatedDuration}h</span>
                        </div>
                      </div>

                      {task.assignedTo && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{task.assignedTo}</span>
                        </div>
                      )}

                      {task.cost && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Custo estimado: R$ {task.cost.toLocaleString('pt-BR')}</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {task.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                          >
                            Iniciar
                          </Button>
                        )}
                        {task.status === 'in-progress' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Concluir
                          </Button>
                        )}
                        {task.status === 'completed' && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Concluída
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
                  <p className="text-muted-foreground">
                    {taskSearchTerm || taskFilterStatus !== 'all' || taskFilterPriority !== 'all'
                      ? 'Tente ajustar os filtros de busca'
                      : 'Todas as manutenções estão em dia'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-8">
              <div className="text-center py-6 mt-8">
                <h2 className="text-2xl font-bold lasy-highlight mb-4">Relatórios de Manutenção</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Acesse relatórios detalhados e análises de performance do seu sistema de manutenção
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Relatório Mensal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Resumo completo das atividades de manutenção do mês
                    </p>
                    <Button className="w-full">Gerar Relatório</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Análise de Custos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Breakdown detalhado dos custos de manutenção
                    </p>
                    <Button className="w-full">Visualizar Custos</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Eficiência por Máquina
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Análise de performance e disponibilidade
                    </p>
                    <Button className="w-full">Ver Eficiência</Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Manutenções</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceTasks.filter(t => t.status === 'completed').slice(0, 5).map((task) => (
                      <div key={task.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.machineName} • {task.completedDate ? formatDateSafely(task.completedDate) : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">R$ {task.cost?.toLocaleString('pt-BR') || '0'}</p>
                          <p className="text-sm text-muted-foreground">{task.estimatedDuration}h</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-8">
              <div className="text-center py-6 mt-8">
                <h2 className="text-2xl font-bold mb-4">Análises e Insights</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Obtenha insights valiosos sobre o desempenho do seu sistema de manutenção
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tendências de Manutenção</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Gráfico de tendências seria exibido aqui</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Custos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Manutenção Preventiva</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Manutenção Corretiva</span>
                        <span className="font-medium">30%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Manutenção Preditiva</span>
                        <span className="font-medium">5%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendações do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">Otimização de Intervalos</p>
                        <p className="text-sm text-blue-700">
                          Considere reduzir o intervalo de manutenção da Fresadora Universal para 15 dias
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Performance Excelente</p>
                        <p className="text-sm text-green-700">
                          O Torno CNC Principal mantém 98% de disponibilidade
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Atenção Necessária</p>
                        <p className="text-sm text-yellow-700">
                          Máquina de Solda apresenta paradas frequentes - investigar causa raiz
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}