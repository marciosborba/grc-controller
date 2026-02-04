// Serviço para gerenciar Templates de Riscos no Banco de Dados
import { supabase } from '@/integrations/supabase/client';
import type { 
  RiskTemplate, 
  CreateRiskTemplateDTO, 
  UpdateRiskTemplateDTO, 
  RiskTemplateFilters,
  RiskTemplateStats 
} from '@/types/riskTemplate';

export class RiskTemplateService {
  
  /**
   * Buscar todos os templates com filtros
   */
  static async getTemplates(filters?: RiskTemplateFilters): Promise<RiskTemplate[]> {
    let query = supabase
      .from('risk_templates')
      .select(`
        *,
        controls:risk_template_controls(id, control_description, control_order),
        kris:risk_template_kris(id, kri_description, kri_order),
        tags:risk_template_tags(id, tag),
        userRatings:risk_template_ratings(id, user_id, rating, created_at)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }
    
    if (filters?.riskLevel) {
      query = query.eq('risk_level', filters.riskLevel);
    }
    
    if (filters?.isPopular !== undefined) {
      query = query.eq('is_popular', filters.isPopular);
    }
    
    if (filters?.alexRiskSuggested !== undefined) {
      query = query.eq('alex_risk_suggested', filters.alexRiskSuggested);
    }
    
    if (filters?.minRating) {
      query = query.gte('rating', filters.minRating);
    }
    
    if (filters?.createdBy) {
      query = query.eq('created_by', filters.createdBy);
    }

    // Busca por texto
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar templates:', error);
      throw new Error('Falha ao carregar templates de risco');
    }

    return data?.map(this.transformTemplate) || [];
  }

  /**
   * Buscar template por ID
   */
  static async getTemplateById(id: string): Promise<RiskTemplate | null> {
    const { data, error } = await supabase
      .from('risk_templates')
      .select(`
        *,
        controls:risk_template_controls(id, control_description, control_order),
        kris:risk_template_kris(id, kri_description, kri_order),
        tags:risk_template_tags(id, tag),
        userRatings:risk_template_ratings(id, user_id, rating, created_at)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar template:', error);
      return null;
    }

    return data ? this.transformTemplate(data) : null;
  }

  /**
   * Criar novo template
   */
  static async createTemplate(templateData: CreateRiskTemplateDTO): Promise<RiskTemplate> {
    const templateId = `${templateData.category.toLowerCase().substring(0, 3)}-${Date.now()}`;
    
    // Iniciar transação
    const { data: template, error: templateError } = await supabase
      .from('risk_templates')
      .insert({
        id: templateId,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        industry: templateData.industry,
        risk_level: templateData.riskLevel,
        probability: templateData.probability,
        impact: templateData.impact,
        methodology: templateData.methodology,
        created_by: templateData.createdBy,
        alex_risk_suggested: templateData.alexRiskSuggested || false,
        status: 'active'
      })
      .select()
      .single();

    if (templateError) {
      console.error('Erro ao criar template:', templateError);
      throw new Error('Falha ao criar template de risco');
    }

    // Inserir controles
    if (templateData.controls.length > 0) {
      const controlsData = templateData.controls.map((control, index) => ({
        template_id: templateId,
        control_description: control,
        control_order: index + 1
      }));

      const { error: controlsError } = await supabase
        .from('risk_template_controls')
        .insert(controlsData);

      if (controlsError) {
        console.error('Erro ao inserir controles:', controlsError);
      }
    }

    // Inserir KRIs
    if (templateData.kris.length > 0) {
      const krisData = templateData.kris.map((kri, index) => ({
        template_id: templateId,
        kri_description: kri,
        kri_order: index + 1
      }));

      const { error: krisError } = await supabase
        .from('risk_template_kris')
        .insert(krisData);

      if (krisError) {
        console.error('Erro ao inserir KRIs:', krisError);
      }
    }

    // Inserir tags
    if (templateData.tags.length > 0) {
      const tagsData = templateData.tags.map(tag => ({
        template_id: templateId,
        tag: tag.toLowerCase()
      }));

      const { error: tagsError } = await supabase
        .from('risk_template_tags')
        .insert(tagsData);

      if (tagsError) {
        console.error('Erro ao inserir tags:', tagsError);
      }
    }

    // Registrar auditoria
    await this.createAuditRecord(templateId, 'create', templateData.createdBy, null, template);

    // Retornar template completo
    const fullTemplate = await this.getTemplateById(templateId);
    if (!fullTemplate) {
      throw new Error('Falha ao recuperar template criado');
    }

    return fullTemplate;
  }

  /**
   * Atualizar template
   */
  static async updateTemplate(id: string, updates: UpdateRiskTemplateDTO, updatedBy: string): Promise<RiskTemplate> {
    // Buscar dados atuais para auditoria
    const currentTemplate = await this.getTemplateById(id);
    if (!currentTemplate) {
      throw new Error('Template não encontrado');
    }

    // Atualizar dados principais
    const { data: updatedTemplate, error: updateError } = await supabase
      .from('risk_templates')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        ...(updates.category && { category: updates.category }),
        ...(updates.industry && { industry: updates.industry }),
        ...(updates.riskLevel && { risk_level: updates.riskLevel }),
        ...(updates.probability && { probability: updates.probability }),
        ...(updates.impact && { impact: updates.impact }),
        ...(updates.methodology && { methodology: updates.methodology }),
        ...(updates.alexRiskSuggested !== undefined && { alex_risk_suggested: updates.alexRiskSuggested }),
        ...(updates.status && { status: updates.status })
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar template:', updateError);
      throw new Error('Falha ao atualizar template');
    }

    // Atualizar controles se fornecidos
    if (updates.controls) {
      // Remover controles existentes
      await supabase
        .from('risk_template_controls')
        .delete()
        .eq('template_id', id);

      // Inserir novos controles
      if (updates.controls.length > 0) {
        const controlsData = updates.controls.map((control, index) => ({
          template_id: id,
          control_description: control,
          control_order: index + 1
        }));

        await supabase
          .from('risk_template_controls')
          .insert(controlsData);
      }
    }

    // Atualizar KRIs se fornecidos
    if (updates.kris) {
      await supabase
        .from('risk_template_kris')
        .delete()
        .eq('template_id', id);

      if (updates.kris.length > 0) {
        const krisData = updates.kris.map((kri, index) => ({
          template_id: id,
          kri_description: kri,
          kri_order: index + 1
        }));

        await supabase
          .from('risk_template_kris')
          .insert(krisData);
      }
    }

    // Atualizar tags se fornecidas
    if (updates.tags) {
      await supabase
        .from('risk_template_tags')
        .delete()
        .eq('template_id', id);

      if (updates.tags.length > 0) {
        const tagsData = updates.tags.map(tag => ({
          template_id: id,
          tag: tag.toLowerCase()
        }));

        await supabase
          .from('risk_template_tags')
          .insert(tagsData);
      }
    }

    // Registrar auditoria
    await this.createAuditRecord(id, 'update', updatedBy, currentTemplate, updatedTemplate);

    // Retornar template atualizado
    const fullTemplate = await this.getTemplateById(id);
    if (!fullTemplate) {
      throw new Error('Falha ao recuperar template atualizado');
    }

    return fullTemplate;
  }

  /**
   * Avaliar template
   */
  static async rateTemplate(templateId: string, userId: string, rating: number): Promise<void> {
    // Inserir ou atualizar avaliação
    const { error } = await supabase
      .from('risk_template_ratings')
      .upsert({
        template_id: templateId,
        user_id: userId,
        rating: rating
      });

    if (error) {
      console.error('Erro ao avaliar template:', error);
      throw new Error('Falha ao registrar avaliação');
    }

    // Recalcular rating médio
    await this.updateTemplateRating(templateId);
  }

  /**
   * Incrementar contador de uso
   */
  static async incrementUsage(templateId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_template_usage', {
      template_id: templateId
    });

    if (error) {
      console.error('Erro ao incrementar uso:', error);
      // Fallback manual
      const { data: template } = await supabase
        .from('risk_templates')
        .select('usage_count')
        .eq('id', templateId)
        .single();

      if (template) {
        await supabase
          .from('risk_templates')
          .update({ usage_count: template.usage_count + 1 })
          .eq('id', templateId);
      }
    }
  }

  /**
   * Obter estatísticas da biblioteca
   */
  static async getStats(): Promise<RiskTemplateStats> {
    const { data: templates } = await supabase
      .from('risk_templates')
      .select('category, risk_level, rating, usage_count, is_popular, alex_risk_suggested')
      .eq('status', 'active');

    if (!templates) {
      return {
        totalTemplates: 0,
        templatesByCategory: {},
        templatesByRiskLevel: {},
        averageRating: 0,
        totalUsage: 0,
        popularTemplates: 0,
        alexSuggestedTemplates: 0
      };
    }

    const stats: RiskTemplateStats = {
      totalTemplates: templates.length,
      templatesByCategory: {},
      templatesByRiskLevel: {},
      averageRating: templates.reduce((sum, t) => sum + t.rating, 0) / templates.length,
      totalUsage: templates.reduce((sum, t) => sum + t.usage_count, 0),
      popularTemplates: templates.filter(t => t.is_popular).length,
      alexSuggestedTemplates: templates.filter(t => t.alex_risk_suggested).length
    };

    // Agrupar por categoria
    templates.forEach(template => {
      stats.templatesByCategory[template.category] = 
        (stats.templatesByCategory[template.category] || 0) + 1;
      
      stats.templatesByRiskLevel[template.risk_level] = 
        (stats.templatesByRiskLevel[template.risk_level] || 0) + 1;
    });

    return stats;
  }

  /**
   * Transformar dados do banco para o formato da aplicação
   */
  private static transformTemplate(data: any): RiskTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      industry: data.industry,
      riskLevel: data.risk_level,
      probability: data.probability,
      impact: data.impact,
      methodology: data.methodology,
      usageCount: data.usage_count,
      rating: data.rating,
      isPopular: data.is_popular,
      isFavorite: data.is_favorite,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      alexRiskSuggested: data.alex_risk_suggested,
      totalRatings: data.total_ratings,
      status: data.status,
      controls: data.controls?.map((c: any) => ({
        id: c.id,
        templateId: data.id,
        controlDescription: c.control_description,
        controlOrder: c.control_order,
        createdAt: new Date(c.created_at)
      })) || [],
      kris: data.kris?.map((k: any) => ({
        id: k.id,
        templateId: data.id,
        kriDescription: k.kri_description,
        kriOrder: k.kri_order,
        createdAt: new Date(k.created_at)
      })) || [],
      tags: data.tags?.map((t: any) => ({
        id: t.id,
        templateId: data.id,
        tag: t.tag,
        createdAt: new Date(t.created_at)
      })) || [],
      userRatings: data.userRatings?.map((r: any) => ({
        id: r.id,
        templateId: data.id,
        userId: r.user_id,
        rating: r.rating,
        createdAt: new Date(r.created_at)
      })) || []
    };
  }

  /**
   * Atualizar rating médio do template
   */
  private static async updateTemplateRating(templateId: string): Promise<void> {
    const { data: ratings } = await supabase
      .from('risk_template_ratings')
      .select('rating')
      .eq('template_id', templateId);

    if (ratings && ratings.length > 0) {
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      const roundedRating = Math.round(averageRating * 10) / 10;

      await supabase
        .from('risk_templates')
        .update({ 
          rating: roundedRating,
          total_ratings: ratings.length,
          is_popular: ratings.length >= 10 && roundedRating >= 4.0
        })
        .eq('id', templateId);
    }
  }

  /**
   * Criar registro de auditoria
   */
  private static async createAuditRecord(
    templateId: string, 
    action: string, 
    changedBy: string, 
    oldValues: any, 
    newValues: any
  ): Promise<void> {
    await supabase
      .from('risk_template_audit')
      .insert({
        template_id: templateId,
        action: action,
        changed_by: changedBy,
        old_values: oldValues,
        new_values: newValues
      });
  }
}