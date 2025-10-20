"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Activity,
  Wrench
} from 'lucide-react';
import { Machine, MaintenanceTask, DashboardStats } from '@/lib/types';
import { getStatusColor, formatDate } from '@/lib/data';

interface DashboardOverviewProps {
  stats: DashboardStats;
  machines: Machine[];
  upcomingTasks: MaintenanceTask[];
  onViewMachines: () => void;
  onViewTasks: () => void;
}

export default function DashboardOverview({ 
  stats, 
  machines, 
  upcomingTasks, 
  onViewMachines, 
  onViewTasks 
}: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Header com espaçamento melhorado */}
      <div className="text-center py-6 mt-2">
        <h2 className="text-3xl font-bold mb-4">Dashboard de Manutenção</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Visão geral do sistema de manutenção preventiva e status das máquinas
        </p>
      </div>

      {/* Alertas Críticos */}
      {(stats.overdueMaintenances > 0 || stats.criticalMachines > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.overdueMaintenances > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-red-700">Manutenções em atraso</span>
                <Badge variant="destructive">{stats.overdueMaintenances}</Badge>
              </div>
            )}
            {stats.criticalMachines > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-red-700">Máquinas em estado crítico</span>
                <Badge variant="destructive">{stats.criticalMachines}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Máquinas</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMachines}</div>
            <p className="text-xs text-muted-foreground">
              {stats.operationalMachines} operacionais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenções Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingMaintenances}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueMaintenances} em atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas este Mês</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              R$ {stats.totalCostThisMonth.toLocaleString('pt-BR')} gastos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenanceEfficiency.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Tempo médio: {stats.averageCompletionTime.toFixed(1)}h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status das Máquinas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Status das Máquinas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Operacionais</span>
                <div className="flex items-center gap-2">
                  <Progress value={(stats.operationalMachines / stats.totalMachines) * 100} className="w-20" />
                  <span className="text-sm font-medium">{stats.operationalMachines}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Em Manutenção</span>
                <div className="flex items-center gap-2">
                  <Progress value={(stats.machinesInMaintenance / stats.totalMachines) * 100} className="w-20" />
                  <span className="text-sm font-medium">{stats.machinesInMaintenance}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Críticas</span>
                <div className="flex items-center gap-2">
                  <Progress value={(stats.criticalMachines / stats.totalMachines) * 100} className="w-20" />
                  <span className="text-sm font-medium">{stats.criticalMachines}</span>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" onClick={onViewMachines}>
              Ver Todas as Máquinas
            </Button>
          </CardContent>
        </Card>

        {/* Próximas Manutenções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Próximas Manutenções
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {upcomingTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.machineName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">
                      {formatDate(task.scheduledDate)}
                    </p>
                    <Badge className={getStatusColor(task.status)} variant="outline">
                      {task.status === 'pending' ? 'Pendente' :
                       task.status === 'overdue' ? 'Atrasada' : task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {upcomingTasks.length === 0 && (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Todas as manutenções estão em dia!
                </p>
              </div>
            )}
            
            <Button variant="outline" className="w-full" onClick={onViewTasks}>
              Ver Todas as Tarefas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lista Resumida de Máquinas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Resumo das Máquinas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {machines.map((machine) => (
              <div key={machine.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{machine.name}</h4>
                  <Badge className={getStatusColor(machine.status)} variant="outline">
                    {machine.status === 'operational' ? 'Operacional' :
                     machine.status === 'maintenance' ? 'Manutenção' :
                     machine.status === 'critical' ? 'Crítica' : 'Parada'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{machine.location}</p>
                <div className="text-xs text-muted-foreground">
                  <p>Modelo: {machine.model}</p>
                  <p>Próxima manutenção: {
                    machine.nextMaintenanceDate 
                      ? formatDate(machine.nextMaintenanceDate)
                      : 'Não agendada'
                  }</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}