{/* Environmental Factors */ }
<Card>
    <CardHeader>
        <CardTitle className="text-lg">Fatores Ambientais</CardTitle>
        <CardDescription>
            Contextualize a vulnerabilidade com o ambiente e o ativo afetado
        </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label>Exposição do Ativo (MAV)</Label>
                <Select value={riskFactors.assetExposure} onValueChange={(value) => setRiskFactors(prev => ({ ...prev, assetExposure: value as any }))}>
                    <SelectTrigger style={{ color: '#000000' }} className="dark:[color:#ffffff] [&>span]:[color:#000000] dark:[&>span]:[color:#ffffff]">
                        <SelectValue className="text-black dark:text-white [&>span]:!text-black [&>span]:dark:!text-white" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Internet">Internet (1.2x)</SelectItem>
                        <SelectItem value="Internal">Interna (1.0x)</SelectItem>
                        <SelectItem value="Restricted">Restrita (0.8x)</SelectItem>
                        <SelectItem value="Isolated">Isolada (0.6x)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Criticidade do Ativo (MAC)</Label>
                <Select value={riskFactors.assetCriticality} onValueChange={(value) => setRiskFactors(prev => ({ ...prev, assetCriticality: value as any }))}>
                    <SelectTrigger style={{ color: '#000000' }} className="dark:[color:#ffffff] [&>span]:[color:#000000] dark:[&>span]:[color:#ffffff]">
                        <SelectValue className="text-black dark:text-white [&>span]:!text-black [&>span]:dark:!text-white" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Critical">Crítica (1.15x)</SelectItem>
                        <SelectItem value="High">Alta (1.0x)</SelectItem>
                        <SelectItem value="Medium">Média (0.85x)</SelectItem>
                        <SelectItem value="Low">Baixa (0.7x)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Classificação de Dados (MDC)</Label>
                <Select value={riskFactors.dataClassification} onValueChange={(value) => setRiskFactors(prev => ({ ...prev, dataClassification: value as any }))}>
                    <SelectTrigger style={{ color: '#000000' }} className="dark:[color:#ffffff] [&>span]:[color:#000000] dark:[&>span]:[color:#ffffff]">
                        <SelectValue className="text-black dark:text-white [&>span]:!text-black [&>span]:dark:!text-white" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Restricted">Restrita (1.15x)</SelectItem>
                        <SelectItem value="Confidential">Confidencial (1.0x)</SelectItem>
                        <SelectItem value="Internal">Interna (0.85x)</SelectItem>
                        <SelectItem value="Public">Pública (0.7x)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="p-4 bg-muted rounded-md flex justify-between items-center">
            <div>
                <h4 className="font-medium">Score Ambiental (CVSS Modificado)</h4>
                <p className="text-sm text-muted-foreground">Considerando o ambiente específico</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-1">
                {calculateEnvironmentalScore()}
            </Badge>
        </div>
    </CardContent>
</Card>

{/* Business Impact */ }
<Card>
    <CardHeader>
        <CardTitle className="text-lg">Impacto no Negócio</CardTitle>
        <CardDescription>
            Avalie o impacto financeiro, operaciona e de reputação
        </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
                <Label>Impacto Financeiro</Label>
                <Select value={riskFactors.financialImpact} onValueChange={(value) => setRiskFactors(prev => ({ ...prev, financialImpact: value as any }))}>
                    <SelectTrigger style={{ color: '#000000' }} className="dark:[color:#ffffff] [&>span]:[color:#000000] dark:[&>span]:[color:#ffffff]">
                        <SelectValue className="text-black dark:text-white [&>span]:!text-black [&>span]:dark:!text-white" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Critical">Crítico</SelectItem>
                        <SelectItem value="High">Alto</SelectItem>
                        <SelectItem value="Medium">Médio</SelectItem>
                        <SelectItem value="Low">Baixo</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Impacto na Reputação</Label>
                <Select value={riskFactors.reputationImpact} onValueChange={(value) => setRiskFactors(prev => ({ ...prev, reputationImpact: value as any }))}>
                    <SelectTrigger style={{ color: '#000000' }} className="dark:[color:#ffffff] [&>span]:[color:#000000] dark:[&>span]:[color:#ffffff]">
                        <SelectValue className="text-black dark:text-white [&>span]:!text-black [&>span]:dark:!text-white" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Critical">Crítico</SelectItem>
                        <SelectItem value="High">Alto</SelectItem>
                        <SelectItem value="Medium">Médio</SelectItem>
                        <SelectItem value="Low">Baixo</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Impacto de Compliance</Label>
                <Select value={riskFactors.complianceImpact} onValueChange={(value) => setRiskFactors(prev => ({ ...prev, complianceImpact: value as any }))}>
                    <SelectTrigger style={{ color: '#000000' }} className="dark:[color:#ffffff] [&>span]:[color:#000000] dark:[&>span]:[color:#ffffff]">
                        <SelectValue className="text-black dark:text-white [&>span]:!text-black [&>span]:dark:!text-white" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="High">Alto (Violação)</SelectItem>
                        <SelectItem value="Medium">Médio</SelectItem>
                        <SelectItem value="Low">Baixo</SelectItem>
                        <SelectItem value="None">Nenhum</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Criticidade do Processo</Label>
                <Select value={riskFactors.businessCriticality} onValueChange={(value) => setRiskFactors(prev => ({ ...prev, businessCriticality: value as any }))}>
                    <SelectTrigger style={{ color: '#000000' }} className="dark:[color:#ffffff] [&>span]:[color:#000000] dark:[&>span]:[color:#ffffff]">
                        <SelectValue className="text-black dark:text-white [&>span]:!text-black [&>span]:dark:!text-white" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Critical">Crítica</SelectItem>
                        <SelectItem value="High">Alta</SelectItem>
                        <SelectItem value="Medium">Média</SelectItem>
                        <SelectItem value="Low">Baixa</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
            <div className="flex-1">
                <h4 className="font-semibold text-lg">Score de Risco de Negócio</h4>
                <p className="text-sm text-muted-foreground">Prioridade sugerida para correção</p>
            </div>
            <div className="text-right">
                <div className="text-2xl font-bold">{calculateBusinessRiskScore()}</div>
                <Badge className={`${getRiskLevel(calculateBusinessRiskScore()).color} mt-1`}>
                    {getRiskLevel(calculateBusinessRiskScore()).level}
                </Badge>
            </div>
        </div>
    </CardContent>
</Card>
