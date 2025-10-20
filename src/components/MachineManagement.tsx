"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { Machine, PreventiveMaintenanceItem } from '@/lib/types';
import { getStatusColor, generateInitialMaintenanceTasks } from '@/lib/data';

interface MachineManagementProps {
  machines: Machine[];
  onAddMachine: (machine: Omit<Machine, 'id'>) => void;
  onUpdateMachine: (id: string, updates: Partial<Machine>) => void;
  onDeleteMachine: (id: string) => void;
}

export default function MachineManagement({ 
  machines, 
  onAddMachine, 
  onUpdateMachine, 
  onDeleteMachine 
}: MachineManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Estado para o formulário de máquina
  const [machineForm, setMachineForm] = useState({
    name: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    location: '',
    status: 'operational' as Machine['status'],
    installationDate: '',
    acquisitionDate: '',
    operatingHours: 0,
    maintenancePlan: [] as PreventiveMaintenanceItem[]
  });

  // Estado para o item de manutenção sendo editado
  const [maintenanceItemForm, setMaintenanceItemForm] = useState({
    taskName: '',
    description: '',
    scheduleType: 'time' as 'time' | 'usage',
    intervalValue: 1,
    intervalUnit: 'months' as 'days' | 'weeks' | 'months' | 'years',
    usageLimit: 100,
    usageUnit: 'hours' as 'hours' | 'cycles' | 'tons' | 'km',
    isActive: true
  });

  const resetForms = () => {
    setMachineForm({
      name: '',
      model: '',
      manufacturer: '',
      serialNumber: '',
      location: '',
      status: 'operational',
      installationDate: '',
      acquisitionDate: '',
      operatingHours: 0,
      maintenancePlan: []
    });
    setMaintenanceItemForm({
      taskName: '',
      description: '',
      scheduleType: 'time',
      intervalValue: 1,
      intervalUnit: 'months',
      usageLimit: 100,
      usageUnit: 'hours',
      isActive: true
    });
  };

  const handleAddMaintenanceItem = () => {
    if (!maintenanceItemForm.taskName.trim()) return;

    const newItem: PreventiveMaintenanceItem = {
      id: `mp_${Date.now()}`,
      taskName: maintenanceItemForm.taskName,
      description: maintenanceItemForm.description,
      scheduleType: maintenanceItemForm.scheduleType,
      intervalValue: maintenanceItemForm.scheduleType === 'time' ? maintenanceItemForm.intervalValue : undefined,
      intervalUnit: maintenanceItemForm.scheduleType === 'time' ? maintenanceItemForm.intervalUnit : undefined,
      usageLimit: maintenanceItemForm.scheduleType === 'usage' ? maintenanceItemForm.usageLimit : undefined,
      usageUnit: maintenanceItemForm.scheduleType === 'usage' ? maintenanceItemForm.usageUnit : undefined,
      currentUsage: maintenanceItemForm.scheduleType === 'usage' ? 0 : undefined,
      isActive: maintenanceItemForm.isActive
    };

    setMachineForm(prev => ({
      ...prev,
      maintenancePlan: [...prev.maintenancePlan, newItem]
    }));

    // Reset do formulário de item
    setMaintenanceItemForm({
      taskName: '',
      description: '',
      scheduleType: 'time',
      intervalValue: 1,
      intervalUnit: 'months',
      usageLimit: 100,
      usageUnit: 'hours',
      isActive: true
    });
  };

  const handleRemoveMaintenanceItem = (itemId: string) => {
    setMachineForm(prev => ({
      ...prev,
      maintenancePlan: prev.maintenancePlan.filter(item => item.id !== itemId)
    }));
  };

  const handleSubmitMachine = () => {
    if (!machineForm.name.trim() || !machineForm.model.trim()) return;

    const machineData = {
      ...machineForm,
      operatingHours: Number(machineForm.operatingHours)
    };

    if (editingMachine) {
      onUpdateMachine(editingMachine.id, machineData);
      setIsEditDialogOpen(false);
      setEditingMachine(null);
    } else {
      onAddMachine(machineData);
      setIsAddDialogOpen(false);
    }

    resetForms();
  };

  const handleEditMachine = (machine: Machine) => {
    setEditingMachine(machine);
    setMachineForm({
      name: machine.name,
      model: machine.model,
      manufacturer: machine.manufacturer,
      serialNumber: machine.serialNumber,
      location: machine.location,
      status: machine.status,
      installationDate: machine.installationDate,
      acquisitionDate: machine.acquisitionDate,
      operatingHours: machine.operatingHours || 0,
      maintenancePlan: [...machine.maintenancePlan]
    });
    setIsEditDialogOpen(true);
  };

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const MachineFormDialog = ({ isOpen, onClose, title }: { isOpen: boolean; onClose: () => void; title: string }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas da Máquina */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Máquina *</Label>
              <Input
                id="name"
                value={machineForm.name}
                onChange={(e) => setMachineForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Torno CNC Principal"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                value={machineForm.model}
                onChange={(e) => setMachineForm(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Ex: CNC-2000X"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input
                id="manufacturer"
                value={machineForm.manufacturer}
                onChange={(e) => setMachineForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                placeholder="Ex: TechMach"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Número de Série</Label>
              <Input
                id="serialNumber"
                value={machineForm.serialNumber}
                onChange={(e) => setMachineForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                placeholder="Ex: TM-2000-001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={machineForm.location}
                onChange={(e) => setMachineForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Setor A - Linha 1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={machineForm.status} onValueChange={(value: Machine['status']) => 
                setMachineForm(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="maintenance">Em Manutenção</SelectItem>
                  <SelectItem value="stopped">Parada</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="acquisitionDate">Data de Aquisição</Label>
              <Input
                id="acquisitionDate"
                type="date"
                value={machineForm.acquisitionDate}
                onChange={(e) => setMachineForm(prev => ({ ...prev, acquisitionDate: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="installationDate">Data de Instalação</Label>
              <Input
                id="installationDate"
                type="date"
                value={machineForm.installationDate}
                onChange={(e) => setMachineForm(prev => ({ ...prev, installationDate: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="operatingHours">Horas de Operação</Label>
              <Input
                id="operatingHours"
                type="number"
                value={machineForm.operatingHours}
                onChange={(e) => setMachineForm(prev => ({ ...prev, operatingHours: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Plano de Manutenção Preventiva */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Plano de Manutenção Preventiva</h3>
            </div>
            
            {/* Formulário para Adicionar Item de Manutenção */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Adicionar Item de Manutenção</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome/Descrição da Tarefa *</Label>
                    <Input
                      value={maintenanceItemForm.taskName}
                      onChange={(e) => setMaintenanceItemForm(prev => ({ ...prev, taskName: e.target.value }))}
                      placeholder="Ex: Troca de óleo hidráulico"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tipo de Agendamento</Label>
                    <Select 
                      value={maintenanceItemForm.scheduleType} 
                      onValueChange={(value: 'time' | 'usage') => 
                        setMaintenanceItemForm(prev => ({ ...prev, scheduleType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time">Por Tempo</SelectItem>
                        <SelectItem value="usage">Por Uso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Descrição Detalhada</Label>
                  <Textarea
                    value={maintenanceItemForm.description}
                    onChange={(e) => setMaintenanceItemForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição detalhada da tarefa de manutenção"
                    rows={2}
                  />
                </div>
                
                {maintenanceItemForm.scheduleType === 'time' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Intervalo</Label>
                      <Input
                        type="number"
                        min="1"
                        value={maintenanceItemForm.intervalValue}
                        onChange={(e) => setMaintenanceItemForm(prev => ({ 
                          ...prev, 
                          intervalValue: Number(e.target.value) 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unidade de Tempo</Label>
                      <Select 
                        value={maintenanceItemForm.intervalUnit} 
                        onValueChange={(value: 'days' | 'weeks' | 'months' | 'years') => 
                          setMaintenanceItemForm(prev => ({ ...prev, intervalUnit: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Dias</SelectItem>
                          <SelectItem value="weeks">Semanas</SelectItem>
                          <SelectItem value="months">Meses</SelectItem>
                          <SelectItem value="years">Anos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Limite de Uso</Label>
                      <Input
                        type="number"
                        min="1"
                        value={maintenanceItemForm.usageLimit}
                        onChange={(e) => setMaintenanceItemForm(prev => ({ 
                          ...prev, 
                          usageLimit: Number(e.target.value) 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unidade de Uso</Label>
                      <Select 
                        value={maintenanceItemForm.usageUnit} 
                        onValueChange={(value: 'hours' | 'cycles' | 'tons' | 'km') => 
                          setMaintenanceItemForm(prev => ({ ...prev, usageUnit: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Horas de Operação</SelectItem>
                          <SelectItem value="cycles">Ciclos</SelectItem>
                          <SelectItem value="tons">Produção em Toneladas</SelectItem>
                          <SelectItem value="km">Quilômetros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                <Button onClick={handleAddMaintenanceItem} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item ao Plano
                </Button>
              </CardContent>
            </Card>
            
            {/* Lista de Itens do Plano de Manutenção */}
            {machineForm.maintenancePlan.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Itens do Plano de Manutenção</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {machineForm.maintenancePlan.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.taskName}</h4>
                            <Badge variant={item.isActive ? "default" : "secondary"}>
                              {item.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {item.scheduleType === 'time' ? (
                                <>
                                  <Calendar className="w-3 h-3" />
                                  A cada {item.intervalValue} {
                                    item.intervalUnit === 'days' ? 'dias' :
                                    item.intervalUnit === 'weeks' ? 'semanas' :
                                    item.intervalUnit === 'months' ? 'meses' : 'anos'
                                  }
                                </>
                              ) : (
                                <>
                                  <Activity className="w-3 h-3" />
                                  A cada {item.usageLimit} {
                                    item.usageUnit === 'hours' ? 'horas' :
                                    item.usageUnit === 'cycles' ? 'ciclos' :
                                    item.usageUnit === 'tons' ? 'toneladas' : 'km'
                                  }
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMaintenanceItem(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmitMachine} className="flex-1">
              {editingMachine ? 'Atualizar Máquina' : 'Cadastrar Máquina'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Gestão de Máquinas</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Máquina
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar máquinas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="operational">Operacional</SelectItem>
            <SelectItem value="maintenance">Em Manutenção</SelectItem>
            <SelectItem value="stopped">Parada</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Máquinas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMachines.map((machine) => (
          <Card key={machine.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {machine.name}
                    <Badge className={getStatusColor(machine.status)} variant="outline">
                      {machine.status === 'operational' ? 'Operacional' :
                       machine.status === 'maintenance' ? 'Manutenção' :
                       machine.status === 'critical' ? 'Crítica' : 'Parada'}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{machine.location}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditMachine(machine)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDeleteMachine(machine.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Modelo</p>
                  <p className="font-medium">{machine.model}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fabricante</p>
                  <p className="font-medium">{machine.manufacturer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Série</p>
                  <p className="font-medium">{machine.serialNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Horas de Operação</p>
                  <p className="font-medium">{machine.operatingHours || 0}h</p>
                </div>
              </div>

              {machine.nextMaintenanceDate && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Próxima Manutenção</p>
                    <p className="text-xs text-blue-700">
                      {new Date(machine.nextMaintenanceDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}

              {/* Resumo do Plano de Manutenção */}
              {machine.maintenancePlan.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Plano de Manutenção ({machine.maintenancePlan.filter(item => item.isActive).length} itens ativos)
                  </p>
                  <div className="space-y-1">
                    {machine.maintenancePlan.filter(item => item.isActive).slice(0, 3).map((item) => (
                      <div key={item.id} className="text-xs text-muted-foreground flex items-center gap-2">
                        {item.scheduleType === 'time' ? (
                          <Calendar className="w-3 h-3" />
                        ) : (
                          <Activity className="w-3 h-3" />
                        )}
                        <span>{item.taskName}</span>
                      </div>
                    ))}
                    {machine.maintenancePlan.filter(item => item.isActive).length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{machine.maintenancePlan.filter(item => item.isActive).length - 3} mais...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMachines.length === 0 && (
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma máquina encontrada</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece cadastrando sua primeira máquina'}
          </p>
        </div>
      )}

      {/* Diálogos */}
      <MachineFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          resetForms();
        }}
        title="Cadastrar Nova Máquina"
      />

      <MachineFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingMachine(null);
          resetForms();
        }}
        title="Editar Máquina"
      />
    </div>
  );
}