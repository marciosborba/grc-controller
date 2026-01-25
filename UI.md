# GRC Controller - Guia de Estilo Premium (UI/UX)

Este documento descreve os padrões de design "Premium" e "Storytelling" utilizados no sistema. Use estas diretrizes para criar novos dashboards, cards e elementos visuais consistentes.

## 1. Filosofia de Design
*   **Storytelling**: Os dados devem contar uma história. Não exiba apenas números; explique o contexto (ex: "Ambiente Estável" vs "Risco Crítico").
*   **Visual Premium**: Use sombras suaves, bordas coloridas sutis, ícones grandes em marca d'água e micro-interações (hover, transitions).
*   **Hierarquia Clara**: Números grandes para métricas importantes, cores semânticas para status e tipografia hierárquica.

## 2. Paleta de Cores Semântica
Use variações de opacidade para criar profundidade.
*   **Azul (Info/Nav)**: `text-blue-600`, `bg-blue-100`, `border-blue-500`
*   **Roxo (Apps/Negócio)**: `text-purple-600`, `bg-purple-100`, `border-purple-500`
*   **Verde (Seguro/CMDB)**: `text-emerald-600`, `bg-emerald-100`, `border-emerald-500`
*   **Vermelho (Crítico)**: `text-red-500`, `bg-red-500/10`
*   **Laranja (Alto Risco)**: `text-orange-500`, `bg-orange-500/10`

---

## 3. Componentes Padrão

### A. Card de Navegação (Premium)
Cartões grandes para entrada em módulos, com ícone de fundo e borda superior colorida.

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, IconName } from 'lucide-react';

<Card 
  className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-blue-500"
  onClick={() => navigate('/route')}
>
  {/* Ícone de Fundo (Marca d'água) */}
  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
    <IconName className="h-24 w-24 text-blue-500" />
  </div>

  <CardHeader>
    <CardTitle className="flex items-center gap-3 text-xl">
      {/* Ícone Pequeno com Fundo */}
      <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
        <IconName className="h-6 w-6 text-blue-600" />
      </div>
      Título do Módulo
    </CardTitle>
  </CardHeader>

  <CardContent>
    <p className="text-muted-foreground mb-4">
      Descrição curta e atrativa do que este módulo faz.
    </p>
    {/* Link de Ação Animado */}
    <div className="flex items-center text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
      Acessar Agora <ArrowRight className="h-4 w-4 ml-1" />
    </div>
  </CardContent>
</Card>
```

### B. Card de Métrica (Simples & Limpo)
Para exibição de totais confiáveis ("Reliable Data").

```tsx
<Card>
  <CardContent className="p-6 flex items-center gap-4">
    {/* Ícone Redondo Colorido */}
    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
      <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">Label da Métrica</p>
      <h3 className="text-3xl font-bold text-foreground">1,234</h3>
    </div>
  </CardContent>
</Card>
```

### C. Card de "Storytelling" (Status Dinâmico)
Muda de cor e ícone baseado no estado dos dados.

```tsx
// Lógica de exemplo
const status = isCritical ? {
  title: "Risco Detectado",
  color: "text-red-500",
  bg: "bg-red-500/10",
  icon: AlertTriangle
} : {
  title: "Ambiente Seguro",
  color: "text-green-500",
  bg: "bg-green-500/10",
  icon: CheckCircle
};

// Componente
<Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
  <div className="absolute top-0 right-0 p-3 opacity-10">
    <status.icon className="h-24 w-24" />
  </div>
  <CardHeader className="pb-2">
    <CardTitle className={`text-lg font-bold flex items-center gap-2 ${status.color}`}>
      {status.title}
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground font-medium text-sm leading-relaxed">
      {status.desc}
    </p>
    <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
      Status Atual
    </div>
  </CardContent>
</Card>
```

## 4. Header de Página
Cabeçalhos grandes e impactantes.

```tsx
<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
  <div>
    <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 text-primary">
      <Icon className="h-10 w-10" />
      Título da Página
    </h1>
    <p className="text-lg text-muted-foreground mt-2 max-w-2xl">
      Subtítulo explicativo que dá contexto ao usuário.
    </p>
  </div>
  <div className="flex gap-2">
    <Button variant="outline">Ação Secundária</Button>
    <Button className="bg-primary text-white shadow-lg shadow-primary/20">
      Ação Principal
    </Button>
  </div>
</div>
```

## 5. Micro-interações
*   Sempre use `transition-all` ou `transition-colors` em elementos interativos.
*   Nos botões e cards, adicione `hover:shadow-lg` ou `hover:border-color`.
*   Use `group` e `group-hover` para animar ícones filhos quando o pai é hoverado (ex: mover seta para a direita).
