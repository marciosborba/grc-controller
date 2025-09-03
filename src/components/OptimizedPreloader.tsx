import React, { useEffect, useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';

interface OptimizedPreloaderProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

export const OptimizedPreloader: React.FC<OptimizedPreloaderProps> = ({ 
  onComplete, 
  minDisplayTime = 1000 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Inicializando...');
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { label: 'Inicializando aplicação...', duration: 200 },
    { label: 'Carregando autenticação...', duration: 300 },
    { label: 'Verificando permissões...', duration: 200 },
    { label: 'Preparando interface...', duration: 300 },
    { label: 'Finalizando...', duration: 200 }
  ];

  useEffect(() => {
    let currentProgress = 0;
    let stepIndex = 0;
    const startTime = Date.now();

    const updateProgress = () => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        setCurrentStep(step.label);
        
        const stepProgress = (100 / steps.length);
        const targetProgress = (stepIndex + 1) * stepProgress;
        
        const progressInterval = setInterval(() => {
          currentProgress += 2;
          setProgress(Math.min(currentProgress, targetProgress));
          
          if (currentProgress >= targetProgress) {
            clearInterval(progressInterval);
            stepIndex++;
            
            if (stepIndex < steps.length) {
              setTimeout(updateProgress, 50);
            } else {
              // Garantir tempo mínimo de exibição
              const elapsedTime = Date.now() - startTime;
              const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
              
              setTimeout(() => {
                setProgress(100);
                setCurrentStep('Pronto!');
                setIsComplete(true);
                
                setTimeout(() => {
                  onComplete?.();
                }, 300);
              }, remainingTime);
            }
          }
        }, step.duration / (stepProgress / 2));
      }
    };

    updateProgress();
  }, [minDisplayTime, onComplete]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        {/* Logo e título */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Shield className="h-16 w-16 text-primary animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary/60 animate-spin" />
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              GRC Controller
            </h1>
            <p className="text-sm text-muted-foreground">
              Governance, Risk & Compliance Platform
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-3">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{currentStep}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Indicadores de recursos */}
        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              progress > 20 ? 'bg-green-500' : 'bg-muted'
            }`} />
            <span>Auth</span>
          </div>
          
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              progress > 60 ? 'bg-green-500' : 'bg-muted'
            }`} />
            <span>Database</span>
          </div>
          
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              progress > 90 ? 'bg-green-500' : 'bg-muted'
            }`} />
            <span>Interface</span>
          </div>
        </div>

        {/* Versão */}
        <div className="text-xs text-muted-foreground/60">
          v2.0.0 - Enterprise Edition
        </div>
      </div>
    </div>
  );
};

export default OptimizedPreloader;