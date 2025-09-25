import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, Target, TrendingUp } from 'lucide-react';

export function PlanejamentoBasico() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Planejamento de Auditoria</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Planos Ativos</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Trabalhos Planejados</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Auditores Envolvidos</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-muted-foreground">Execução</p>
                <p className="text-2xl font-bold">75%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Planos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Planos Estratégicos 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <h4 className="font-medium">Plano Anual de Auditoria</h4>
                  <p className="text-sm text-muted-foreground">Janeiro - Dezembro 2025</p>
                </div>
                <Badge variant="secondary">Em Execução</Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <div>
                  <h4 className="font-medium">Auditoria de TI</h4>
                  <p className="text-sm text-muted-foreground">Q2 2025</p>
                </div>
                <Badge variant="outline">Planejado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recursos e Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Orçamento Total</span>
                <span className="font-medium">R$ 850.000</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Consumido</span>
                <span className="font-medium">R$ 315.000</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Disponível</span>
                <span className="font-medium text-green-600">R$ 535.000</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '37%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground text-center">37% do orçamento utilizado</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status do Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Status do Componente:</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                FUNCIONANDO
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span>Timestamp:</span>
              <span className="text-sm text-muted-foreground">
                {new Date().toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Versão:</span>
              <span className="text-sm">1.0.0 - Básico</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}