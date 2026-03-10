-- Auto-generated optimization for RLS policies
-- Generated at 2026-02-26T19:21:58.787Z


-- Optimizing policy: Admins and compliance officers can manage policy approvals ON policy_approvals
DROP POLICY IF EXISTS "Admins and compliance officers can manage policy approvals" ON public."policy_approvals";
CREATE POLICY "Admins and compliance officers can manage policy approvals" ON public."policy_approvals"
AS PERMISSIVE
FOR ALL
TO public
USING ((has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) OR has_role(( SELECT (select auth.uid()) AS uid), 'compliance_officer'::app_role) OR has_role(( SELECT (select auth.uid()) AS uid), 'ciso'::app_role)))
;


-- Optimizing policy: Admins can delete custom_fields ON custom_fields
DROP POLICY IF EXISTS "Admins can delete custom_fields" ON public."custom_fields";
CREATE POLICY "Admins can delete custom_fields" ON public."custom_fields"
AS PERMISSIVE
FOR DELETE
TO public
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND ((profiles.is_platform_admin = true) OR ((profiles.tenant_id = custom_fields.tenant_id) AND ('admin'::text = ANY (profiles.roles))))))))
;


-- Optimizing policy: Admins can insert custom_fields ON custom_fields
DROP POLICY IF EXISTS "Admins can insert custom_fields" ON public."custom_fields";
CREATE POLICY "Admins can insert custom_fields" ON public."custom_fields"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND ((profiles.is_platform_admin = true) OR ((profiles.tenant_id = custom_fields.tenant_id) AND ('admin'::text = ANY (profiles.roles))))))));


-- Optimizing policy: Admins can manage modules ON modules
DROP POLICY IF EXISTS "Admins can manage modules" ON public."modules";
CREATE POLICY "Admins can manage modules" ON public."modules"
AS PERMISSIVE
FOR ALL
TO public
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.is_platform_admin = true)))))
;


-- Optimizing policy: Admins can update SSO settings ON tenant_sso_settings
DROP POLICY IF EXISTS "Admins can update SSO settings" ON public."tenant_sso_settings";
CREATE POLICY "Admins can update SSO settings" ON public."tenant_sso_settings"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((( SELECT (select auth.uid()) AS uid) IN ( SELECT profiles.user_id
   FROM profiles
  WHERE ((profiles.tenant_id = tenant_sso_settings.tenant_id) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'ciso'::text]))))))
;


-- Optimizing policy: Admins can update custom_fields ON custom_fields
DROP POLICY IF EXISTS "Admins can update custom_fields" ON public."custom_fields";
CREATE POLICY "Admins can update custom_fields" ON public."custom_fields"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND ((profiles.is_platform_admin = true) OR ((profiles.tenant_id = custom_fields.tenant_id) AND ('admin'::text = ANY (profiles.roles))))))))
;


-- Optimizing policy: Admins can view SSO settings ON tenant_sso_settings
DROP POLICY IF EXISTS "Admins can view SSO settings" ON public."tenant_sso_settings";
CREATE POLICY "Admins can view SSO settings" ON public."tenant_sso_settings"
AS PERMISSIVE
FOR SELECT
TO public
USING ((( SELECT (select auth.uid()) AS uid) IN ( SELECT profiles.user_id
   FROM profiles
  WHERE ((profiles.tenant_id = tenant_sso_settings.tenant_id) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text, 'ciso'::text]))))))
;


-- Optimizing policy: Authenticated users can delete auth_lockouts ON auth_lockouts
DROP POLICY IF EXISTS "Authenticated users can delete auth_lockouts" ON public."auth_lockouts";
CREATE POLICY "Authenticated users can delete auth_lockouts" ON public."auth_lockouts"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((( SELECT (select auth.uid()) AS uid) IN ( SELECT profiles.user_id
   FROM profiles
  WHERE ((profiles.role = 'admin'::text) OR (profiles.is_platform_admin = true)))))
;


-- Optimizing policy: Compliance officers and admins can manage policy approvers ON policy_approvers
DROP POLICY IF EXISTS "Compliance officers and admins can manage policy approvers" ON public."policy_approvers";
CREATE POLICY "Compliance officers and admins can manage policy approvers" ON public."policy_approvers"
AS PERMISSIVE
FOR ALL
TO public
USING ((has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) OR has_role(( SELECT (select auth.uid()) AS uid), 'compliance_officer'::app_role) OR has_role(( SELECT (select auth.uid()) AS uid), 'ciso'::app_role)))
;


-- Optimizing policy: Enable all access for authenticated users based on tenant_id ON processos
DROP POLICY IF EXISTS "Enable all access for authenticated users based on tenant_id" ON public."processos";
CREATE POLICY "Enable all access for authenticated users based on tenant_id" ON public."processos"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id = (( SELECT (( SELECT (select auth.jwt()) AS jwt) ->> 'tenant_id'::text)))::uuid))
;


-- Optimizing policy: Ethics activities tenant access ON ethics_activities
DROP POLICY IF EXISTS "Ethics activities tenant access" ON public."ethics_activities";
CREATE POLICY "Ethics activities tenant access" ON public."ethics_activities"
AS PERMISSIVE
FOR ALL
TO public
USING ((( SELECT (select auth.uid()) AS uid) IN ( SELECT profiles.id
   FROM profiles
  WHERE ((profiles.tenant_id = ethics_activities.tenant_id) OR (profiles.tenant_id IS NULL) OR (profiles.is_platform_admin = true)))))
;


-- Optimizing policy: Ethics attachments tenant access ON ethics_attachments
DROP POLICY IF EXISTS "Ethics attachments tenant access" ON public."ethics_attachments";
CREATE POLICY "Ethics attachments tenant access" ON public."ethics_attachments"
AS PERMISSIVE
FOR ALL
TO public
USING ((( SELECT (select auth.uid()) AS uid) IN ( SELECT profiles.id
   FROM profiles
  WHERE ((profiles.tenant_id = ethics_attachments.tenant_id) OR (profiles.tenant_id IS NULL) OR (profiles.is_platform_admin = true)))))
;


-- Optimizing policy: Ethics categories tenant access ON ethics_categories
DROP POLICY IF EXISTS "Ethics categories tenant access" ON public."ethics_categories";
CREATE POLICY "Ethics categories tenant access" ON public."ethics_categories"
AS PERMISSIVE
FOR ALL
TO public
USING ((( SELECT (select auth.uid()) AS uid) IN ( SELECT profiles.id
   FROM profiles
  WHERE ((profiles.tenant_id = ethics_categories.tenant_id) OR (profiles.tenant_id IS NULL) OR (profiles.is_platform_admin = true)))))
;


-- Optimizing policy: Ethics communications tenant access ON ethics_communications
DROP POLICY IF EXISTS "Ethics communications tenant access" ON public."ethics_communications";
CREATE POLICY "Ethics communications tenant access" ON public."ethics_communications"
AS PERMISSIVE
FOR ALL
TO public
USING ((( SELECT (select auth.uid()) AS uid) IN ( SELECT profiles.id
   FROM profiles
  WHERE ((profiles.tenant_id = ethics_communications.tenant_id) OR (profiles.tenant_id IS NULL) OR (profiles.is_platform_admin = true)))))
;


-- Optimizing policy: Ethics reports tenant access ON ethics_reports
DROP POLICY IF EXISTS "Ethics reports tenant access" ON public."ethics_reports";
CREATE POLICY "Ethics reports tenant access" ON public."ethics_reports"
AS PERMISSIVE
FOR ALL
TO public
USING ((( SELECT (select auth.uid()) AS uid) IN ( SELECT profiles.user_id
   FROM profiles
  WHERE ((profiles.tenant_id = ethics_reports.tenant_id) OR (profiles.tenant_id IS NULL) OR (profiles.is_platform_admin = true)))))
;


-- Optimizing policy: Ethics settings tenant access ON ethics_settings
DROP POLICY IF EXISTS "Ethics settings tenant access" ON public."ethics_settings";
CREATE POLICY "Ethics settings tenant access" ON public."ethics_settings"
AS PERMISSIVE
FOR ALL
TO public
USING ((( SELECT (select auth.uid()) AS uid) IN ( SELECT profiles.id
   FROM profiles
  WHERE ((profiles.tenant_id = ethics_settings.tenant_id) OR (profiles.tenant_id IS NULL) OR (profiles.is_platform_admin = true)))))
;


-- Optimizing policy: Ethics templates tenant access ON ethics_notification_templates
DROP POLICY IF EXISTS "Ethics templates tenant access" ON public."ethics_notification_templates";
CREATE POLICY "Ethics templates tenant access" ON public."ethics_notification_templates"
AS PERMISSIVE
FOR ALL
TO public
USING ((( SELECT (select auth.uid()) AS uid) IN ( SELECT profiles.id
   FROM profiles
  WHERE ((profiles.tenant_id = ethics_notification_templates.tenant_id) OR (profiles.tenant_id IS NULL) OR (profiles.is_platform_admin = true)))))
;


-- Optimizing policy: Only admins can delete profiles ON profiles
DROP POLICY IF EXISTS "Only admins can delete profiles" ON public."profiles";
CREATE POLICY "Only admins can delete profiles" ON public."profiles"
AS PERMISSIVE
FOR DELETE
TO public
USING (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role))
;


-- Optimizing policy: Platform admins can manage all custom roles_delete ON custom_roles
DROP POLICY IF EXISTS "Platform admins can manage all custom roles_delete" ON public."custom_roles";
CREATE POLICY "Platform admins can manage all custom roles_delete" ON public."custom_roles"
AS PERMISSIVE
FOR DELETE
TO public
USING (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role))
;


-- Optimizing policy: Platform admins can manage all custom roles_insert ON custom_roles
DROP POLICY IF EXISTS "Platform admins can manage all custom roles_insert" ON public."custom_roles";
CREATE POLICY "Platform admins can manage all custom roles_insert" ON public."custom_roles"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role));


-- Optimizing policy: Platform admins can manage all custom roles_update ON custom_roles
DROP POLICY IF EXISTS "Platform admins can manage all custom roles_update" ON public."custom_roles";
CREATE POLICY "Platform admins can manage all custom roles_update" ON public."custom_roles"
AS PERMISSIVE
FOR UPDATE
TO public
USING (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role))
WITH CHECK (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role));


-- Optimizing policy: Platform admins can manage all fonts_delete ON font_configurations
DROP POLICY IF EXISTS "Platform admins can manage all fonts_delete" ON public."font_configurations";
CREATE POLICY "Platform admins can manage all fonts_delete" ON public."font_configurations"
AS PERMISSIVE
FOR DELETE
TO public
USING (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role))
;


-- Optimizing policy: Platform admins can manage all fonts_insert ON font_configurations
DROP POLICY IF EXISTS "Platform admins can manage all fonts_insert" ON public."font_configurations";
CREATE POLICY "Platform admins can manage all fonts_insert" ON public."font_configurations"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role));


-- Optimizing policy: Platform admins can manage all fonts_update ON font_configurations
DROP POLICY IF EXISTS "Platform admins can manage all fonts_update" ON public."font_configurations";
CREATE POLICY "Platform admins can manage all fonts_update" ON public."font_configurations"
AS PERMISSIVE
FOR UPDATE
TO public
USING (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role))
WITH CHECK (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role));


-- Optimizing policy: Platform admins can manage all settings_delete ON platform_settings
DROP POLICY IF EXISTS "Platform admins can manage all settings_delete" ON public."platform_settings";
CREATE POLICY "Platform admins can manage all settings_delete" ON public."platform_settings"
AS PERMISSIVE
FOR DELETE
TO public
USING (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role))
;


-- Optimizing policy: Platform admins can manage all settings_insert ON platform_settings
DROP POLICY IF EXISTS "Platform admins can manage all settings_insert" ON public."platform_settings";
CREATE POLICY "Platform admins can manage all settings_insert" ON public."platform_settings"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role));


-- Optimizing policy: Platform admins can manage all settings_update ON platform_settings
DROP POLICY IF EXISTS "Platform admins can manage all settings_update" ON public."platform_settings";
CREATE POLICY "Platform admins can manage all settings_update" ON public."platform_settings"
AS PERMISSIVE
FOR UPDATE
TO public
USING (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role))
WITH CHECK (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role));


-- Optimizing policy: Platform admins can manage all themes_delete ON theme_configurations
DROP POLICY IF EXISTS "Platform admins can manage all themes_delete" ON public."theme_configurations";
CREATE POLICY "Platform admins can manage all themes_delete" ON public."theme_configurations"
AS PERMISSIVE
FOR DELETE
TO public
USING (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role))
;


-- Optimizing policy: Platform admins can manage all themes_insert ON theme_configurations
DROP POLICY IF EXISTS "Platform admins can manage all themes_insert" ON public."theme_configurations";
CREATE POLICY "Platform admins can manage all themes_insert" ON public."theme_configurations"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role));


-- Optimizing policy: Platform admins can manage all themes_update ON theme_configurations
DROP POLICY IF EXISTS "Platform admins can manage all themes_update" ON public."theme_configurations";
CREATE POLICY "Platform admins can manage all themes_update" ON public."theme_configurations"
AS PERMISSIVE
FOR UPDATE
TO public
USING (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role))
WITH CHECK (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role));


-- Optimizing policy: Platform admins can view all custom roles ON custom_roles
DROP POLICY IF EXISTS "Platform admins can view all custom roles" ON public."custom_roles";
CREATE POLICY "Platform admins can view all custom roles" ON public."custom_roles"
AS PERMISSIVE
FOR SELECT
TO public
USING ((has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) OR ((tenant_id IS NULL) OR (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: Risk managers and admins can manage incidents ON security_incidents
DROP POLICY IF EXISTS "Risk managers and admins can manage incidents" ON public."security_incidents";
CREATE POLICY "Risk managers and admins can manage incidents" ON public."security_incidents"
AS PERMISSIVE
FOR ALL
TO public
USING ((has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) OR has_role(( SELECT (select auth.uid()) AS uid), 'risk_manager'::app_role) OR has_role(( SELECT (select auth.uid()) AS uid), 'ciso'::app_role)))
;


-- Optimizing policy: Risk managers and admins can manage vendors ON vendors
DROP POLICY IF EXISTS "Risk managers and admins can manage vendors" ON public."vendors";
CREATE POLICY "Risk managers and admins can manage vendors" ON public."vendors"
AS PERMISSIVE
FOR ALL
TO public
USING ((has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) OR has_role(( SELECT (select auth.uid()) AS uid), 'risk_manager'::app_role) OR has_role(( SELECT (select auth.uid()) AS uid), 'ciso'::app_role)))
;


-- Optimizing policy: Tenant Admins can view own keys ON tenant_keys
DROP POLICY IF EXISTS "Tenant Admins can view own keys" ON public."tenant_keys";
CREATE POLICY "Tenant Admins can view own keys" ON public."tenant_keys"
AS PERMISSIVE
FOR SELECT
TO public
USING ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_tenant_access uta ON ((uta.user_id = ur.user_id)))
  WHERE ((ur.user_id = ( SELECT (select auth.uid()) AS uid)) AND (uta.tenant_id = tenant_keys.tenant_id) AND (ur.role = ANY (ARRAY['admin'::app_role, 'super_admin'::app_role, 'ciso'::app_role]))))))
;


-- Optimizing policy: Users can access acknowledgments from their tenant ON policy_acknowledgments
DROP POLICY IF EXISTS "Users can access acknowledgments from their tenant" ON public."policy_acknowledgments";
CREATE POLICY "Users can access acknowledgments from their tenant" ON public."policy_acknowledgments"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can access change history from their tenant ON policy_change_history
DROP POLICY IF EXISTS "Users can access change history from their tenant" ON public."policy_change_history";
CREATE POLICY "Users can access change history from their tenant" ON public."policy_change_history"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can access metrics from their tenant ON policy_metrics
DROP POLICY IF EXISTS "Users can access metrics from their tenant" ON public."policy_metrics";
CREATE POLICY "Users can access metrics from their tenant" ON public."policy_metrics"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can access notifications from their tenant ON policy_notifications
DROP POLICY IF EXISTS "Users can access notifications from their tenant" ON public."policy_notifications";
CREATE POLICY "Users can access notifications from their tenant" ON public."policy_notifications"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can access vendor_notifications for their tenant ON vendor_notifications
DROP POLICY IF EXISTS "Users can access vendor_notifications for their tenant" ON public."vendor_notifications";
CREATE POLICY "Users can access vendor_notifications for their tenant" ON public."vendor_notifications"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id = ( SELECT vendor_notifications.tenant_id
   FROM auth.users
  WHERE (users.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can access templates from their tenant or global template ON policy_templates
DROP POLICY IF EXISTS "Users can access templates from their tenant or global template" ON public."policy_templates";
CREATE POLICY "Users can access templates from their tenant or global template" ON public."policy_templates"
AS PERMISSIVE
FOR ALL
TO public
USING (((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (is_global = true)))
;


-- Optimizing policy: Users can access vendor_certifications for their tenant ON vendor_certifications
DROP POLICY IF EXISTS "Users can access vendor_certifications for their tenant" ON public."vendor_certifications";
CREATE POLICY "Users can access vendor_certifications for their tenant" ON public."vendor_certifications"
AS PERMISSIVE
FOR ALL
TO public
USING ((EXISTS ( SELECT 1
   FROM vendor_registry vr
  WHERE ((vr.id = vendor_certifications.vendor_id) AND (vr.tenant_id = ( SELECT vr.tenant_id
           FROM auth.users
          WHERE (users.id = ( SELECT (select auth.uid()) AS uid))))))))
;


-- Optimizing policy: Users can access vendor_communications for their tenant ON vendor_communications
DROP POLICY IF EXISTS "Users can access vendor_communications for their tenant" ON public."vendor_communications";
CREATE POLICY "Users can access vendor_communications for their tenant" ON public."vendor_communications"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can access vendor_contacts for their tenant ON vendor_contacts
DROP POLICY IF EXISTS "Users can access vendor_contacts for their tenant" ON public."vendor_contacts";
CREATE POLICY "Users can access vendor_contacts for their tenant" ON public."vendor_contacts"
AS PERMISSIVE
FOR ALL
TO public
USING ((EXISTS ( SELECT 1
   FROM vendor_registry vr
  WHERE ((vr.id = vendor_contacts.vendor_id) AND (vr.tenant_id = ( SELECT vr.tenant_id
           FROM auth.users
          WHERE (users.id = ( SELECT (select auth.uid()) AS uid))))))))
;


-- Optimizing policy: Users can access vendor_contracts for their tenant ON vendor_contracts
DROP POLICY IF EXISTS "Users can access vendor_contracts for their tenant" ON public."vendor_contracts";
CREATE POLICY "Users can access vendor_contracts for their tenant" ON public."vendor_contracts"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can access vendor_incidents for their tenant ON vendor_incidents
DROP POLICY IF EXISTS "Users can access vendor_incidents for their tenant" ON public."vendor_incidents";
CREATE POLICY "Users can access vendor_incidents for their tenant" ON public."vendor_incidents"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can access vendor_performance_metrics for their tenant ON vendor_performance_metrics
DROP POLICY IF EXISTS "Users can access vendor_performance_metrics for their tenant" ON public."vendor_performance_metrics";
CREATE POLICY "Users can access vendor_performance_metrics for their tenant" ON public."vendor_performance_metrics"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can access vendor_risk_action_plans for their tenant ON vendor_risk_action_plans
DROP POLICY IF EXISTS "Users can access vendor_risk_action_plans for their tenant" ON public."vendor_risk_action_plans";
CREATE POLICY "Users can access vendor_risk_action_plans for their tenant" ON public."vendor_risk_action_plans"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id = ( SELECT vendor_risk_action_plans.tenant_id
   FROM auth.users
  WHERE (users.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can access vendor_risks for their tenant ON vendor_risks
DROP POLICY IF EXISTS "Users can access vendor_risks for their tenant" ON public."vendor_risks";
CREATE POLICY "Users can access vendor_risks for their tenant" ON public."vendor_risks"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can create acceptance letters ON risk_acceptance_letters
DROP POLICY IF EXISTS "Users can create acceptance letters" ON public."risk_acceptance_letters";
CREATE POLICY "Users can create acceptance letters" ON public."risk_acceptance_letters"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((created_by = ( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: Users can create analyses ON risk_advanced_analyses
DROP POLICY IF EXISTS "Users can create analyses" ON public."risk_advanced_analyses";
CREATE POLICY "Users can create analyses" ON public."risk_advanced_analyses"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((created_by = ( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: Users can create analyses ON risk_intelligent_analyses
DROP POLICY IF EXISTS "Users can create analyses" ON public."risk_intelligent_analyses";
CREATE POLICY "Users can create analyses" ON public."risk_intelligent_analyses"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((created_by = ( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: Users can create bowtie analyses ON risk_bowtie_analyses
DROP POLICY IF EXISTS "Users can create bowtie analyses" ON public."risk_bowtie_analyses";
CREATE POLICY "Users can create bowtie analyses" ON public."risk_bowtie_analyses"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((created_by = ( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: Users can create comments for incidents in their tenant ON incident_comments
DROP POLICY IF EXISTS "Users can create comments for incidents in their tenant" ON public."incident_comments";
CREATE POLICY "Users can create comments for incidents in their tenant" ON public."incident_comments"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((EXISTS ( SELECT 1
   FROM incidents
  WHERE ((incidents.id = incident_comments.incident_id) AND (incidents.tenant_id = ( SELECT profiles.tenant_id
           FROM profiles
          WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid))))))));


-- Optimizing policy: Users can create monitoring data ON risk_acceptance_monitoring
DROP POLICY IF EXISTS "Users can create monitoring data" ON public."risk_acceptance_monitoring";
CREATE POLICY "Users can create monitoring data" ON public."risk_acceptance_monitoring"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((created_by = ( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: Users can create policies in their tenant ON policies_v2
DROP POLICY IF EXISTS "Users can create policies in their tenant" ON public."policies_v2";
CREATE POLICY "Users can create policies in their tenant" ON public."policies_v2"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: Users can create publications in their tenant ON policy_publications
DROP POLICY IF EXISTS "Users can create publications in their tenant" ON public."policy_publications";
CREATE POLICY "Users can create publications in their tenant" ON public."policy_publications"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: Users can create quantitative models ON risk_quantitative_models
DROP POLICY IF EXISTS "Users can create quantitative models" ON public."risk_quantitative_models";
CREATE POLICY "Users can create quantitative models" ON public."risk_quantitative_models"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((created_by = ( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: Users can create report configs ON risk_report_configs
DROP POLICY IF EXISTS "Users can create report configs" ON public."risk_report_configs";
CREATE POLICY "Users can create report configs" ON public."risk_report_configs"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((created_by = ( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: Users can create reviews in their tenant ON policy_reviews
DROP POLICY IF EXISTS "Users can create reviews in their tenant" ON public."policy_reviews";
CREATE POLICY "Users can create reviews in their tenant" ON public."policy_reviews"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: Users can create scenario analyses ON risk_scenario_analyses
DROP POLICY IF EXISTS "Users can create scenario analyses" ON public."risk_scenario_analyses";
CREATE POLICY "Users can create scenario analyses" ON public."risk_scenario_analyses"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((created_by = ( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: Users can create templates ON risk_library_templates
DROP POLICY IF EXISTS "Users can create templates" ON public."risk_library_templates";
CREATE POLICY "Users can create templates" ON public."risk_library_templates"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((created_by = ( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: Users can create their own AI chat logs ON ai_chat_logs
DROP POLICY IF EXISTS "Users can create their own AI chat logs" ON public."ai_chat_logs";
CREATE POLICY "Users can create their own AI chat logs" ON public."ai_chat_logs"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((( SELECT (select auth.uid()) AS uid) = user_id));


-- Optimizing policy: Users can delete audit data for their tenant ON policy_audits
DROP POLICY IF EXISTS "Users can delete audit data for their tenant" ON public."policy_audits";
CREATE POLICY "Users can delete audit data for their tenant" ON public."policy_audits"
AS PERMISSIVE
FOR DELETE
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can delete checklist responses from their tenant ON vendor_checklist_responses
DROP POLICY IF EXISTS "Users can delete checklist responses from their tenant" ON public."vendor_checklist_responses";
CREATE POLICY "Users can delete checklist responses from their tenant" ON public."vendor_checklist_responses"
AS PERMISSIVE
FOR DELETE
TO public
USING ((vendor_id IN ( SELECT vendor_registry.id
   FROM vendor_registry
  WHERE (vendor_registry.tenant_id = ( SELECT profiles.tenant_id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: Users can delete checklist templates from their tenant ON vendor_checklist_templates
DROP POLICY IF EXISTS "Users can delete checklist templates from their tenant" ON public."vendor_checklist_templates";
CREATE POLICY "Users can delete checklist templates from their tenant" ON public."vendor_checklist_templates"
AS PERMISSIVE
FOR DELETE
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can delete control matches for their tenant ON policy_control_matches
DROP POLICY IF EXISTS "Users can delete control matches for their tenant" ON public."policy_control_matches";
CREATE POLICY "Users can delete control matches for their tenant" ON public."policy_control_matches"
AS PERMISSIVE
FOR DELETE
TO public
USING ((audit_id IN ( SELECT policy_audits.id
   FROM policy_audits
  WHERE (policy_audits.tenant_id IN ( SELECT profiles.tenant_id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: Users can delete mappings of their tenant ON framework_mappings
DROP POLICY IF EXISTS "Users can delete mappings of their tenant" ON public."framework_mappings";
CREATE POLICY "Users can delete mappings of their tenant" ON public."framework_mappings"
AS PERMISSIVE
FOR DELETE
TO public
USING ((tenant_id = ( SELECT (((( SELECT (select auth.jwt()) AS jwt) -> 'app_metadata'::text) ->> 'tenant_id'::text))::uuid AS uuid)))
;


-- Optimizing policy: Users can delete own favorites ON risk_template_favorites
DROP POLICY IF EXISTS "Users can delete own favorites" ON public."risk_template_favorites";
CREATE POLICY "Users can delete own favorites" ON public."risk_template_favorites"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((( SELECT (select auth.uid()) AS uid) = user_id))
;


-- Optimizing policy: Users can delete own report configs ON risk_report_configs
DROP POLICY IF EXISTS "Users can delete own report configs" ON public."risk_report_configs";
CREATE POLICY "Users can delete own report configs" ON public."risk_report_configs"
AS PERMISSIVE
FOR DELETE
TO public
USING ((created_by = ( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: Users can delete own templates ON risk_library_templates
DROP POLICY IF EXISTS "Users can delete own templates" ON public."risk_library_templates";
CREATE POLICY "Users can delete own templates" ON public."risk_library_templates"
AS PERMISSIVE
FOR DELETE
TO public
USING ((created_by = ( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: Users can delete policies in their tenant ON policies_v2
DROP POLICY IF EXISTS "Users can delete policies in their tenant" ON public."policies_v2";
CREATE POLICY "Users can delete policies in their tenant" ON public."policies_v2"
AS PERMISSIVE
FOR DELETE
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can insert audit data for their tenant ON policy_audits
DROP POLICY IF EXISTS "Users can insert audit data for their tenant" ON public."policy_audits";
CREATE POLICY "Users can insert audit data for their tenant" ON public."policy_audits"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: Users can insert checklist responses for their tenant ON vendor_checklist_responses
DROP POLICY IF EXISTS "Users can insert checklist responses for their tenant" ON public."vendor_checklist_responses";
CREATE POLICY "Users can insert checklist responses for their tenant" ON public."vendor_checklist_responses"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((vendor_id IN ( SELECT vendor_registry.id
   FROM vendor_registry
  WHERE (vendor_registry.tenant_id = ( SELECT profiles.tenant_id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))));


-- Optimizing policy: Users can insert checklist templates for their tenant ON vendor_checklist_templates
DROP POLICY IF EXISTS "Users can insert checklist templates for their tenant" ON public."vendor_checklist_templates";
CREATE POLICY "Users can insert checklist templates for their tenant" ON public."vendor_checklist_templates"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: Users can insert comments to vulnerabilities they access ON vulnerability_comments
DROP POLICY IF EXISTS "Users can insert comments to vulnerabilities they access" ON public."vulnerability_comments";
CREATE POLICY "Users can insert comments to vulnerabilities they access" ON public."vulnerability_comments"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((EXISTS ( SELECT 1
   FROM vulnerabilities v
  WHERE ((v.id = vulnerability_comments.vulnerability_id) AND ((v.tenant_id = ((( SELECT (select auth.jwt()) AS jwt) ->> 'tenant_id'::text))::uuid) OR is_platform_admin(( SELECT (select auth.uid()) AS uid)))))));


-- Optimizing policy: Users can insert control matches for their tenant ON policy_control_matches
DROP POLICY IF EXISTS "Users can insert control matches for their tenant" ON public."policy_control_matches";
CREATE POLICY "Users can insert control matches for their tenant" ON public."policy_control_matches"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((audit_id IN ( SELECT policy_audits.id
   FROM policy_audits
  WHERE (policy_audits.tenant_id IN ( SELECT profiles.tenant_id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))));


-- Optimizing policy: Users can insert mappings for their tenant ON framework_mappings
DROP POLICY IF EXISTS "Users can insert mappings for their tenant" ON public."framework_mappings";
CREATE POLICY "Users can insert mappings for their tenant" ON public."framework_mappings"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((tenant_id = ( SELECT (((( SELECT (select auth.jwt()) AS jwt) -> 'app_metadata'::text) ->> 'tenant_id'::text))::uuid AS uuid)));


-- Optimizing policy: Users can insert own favorites ON risk_template_favorites
DROP POLICY IF EXISTS "Users can insert own favorites" ON public."risk_template_favorites";
CREATE POLICY "Users can insert own favorites" ON public."risk_template_favorites"
AS PERMISSIVE
FOR INSERT
TO authenticated

WITH CHECK ((( SELECT (select auth.uid()) AS uid) = user_id));


-- Optimizing policy: Users can insert own ratings ON risk_template_ratings
DROP POLICY IF EXISTS "Users can insert own ratings" ON public."risk_template_ratings";
CREATE POLICY "Users can insert own ratings" ON public."risk_template_ratings"
AS PERMISSIVE
FOR INSERT
TO authenticated

WITH CHECK (((( SELECT (select auth.uid()) AS uid))::text = (user_id)::text));


-- Optimizing policy: Users can insert profiles ON profiles
DROP POLICY IF EXISTS "Users can insert profiles" ON public."profiles";
CREATE POLICY "Users can insert profiles" ON public."profiles"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) OR (( SELECT (select auth.uid()) AS uid) = user_id)));


-- Optimizing policy: Users can manage action items of vulnerabilities they access ON vulnerability_action_items
DROP POLICY IF EXISTS "Users can manage action items of vulnerabilities they access" ON public."vulnerability_action_items";
CREATE POLICY "Users can manage action items of vulnerabilities they access" ON public."vulnerability_action_items"
AS PERMISSIVE
FOR ALL
TO public
USING ((EXISTS ( SELECT 1
   FROM vulnerabilities v
  WHERE ((v.id = vulnerability_action_items.vulnerability_id) AND ((v.tenant_id = ((( SELECT (select auth.jwt()) AS jwt) ->> 'tenant_id'::text))::uuid) OR is_platform_admin(( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: Users can manage custom_field_values of their tenant_delete ON custom_field_values
DROP POLICY IF EXISTS "Users can manage custom_field_values of their tenant_delete" ON public."custom_field_values";
CREATE POLICY "Users can manage custom_field_values of their tenant_delete" ON public."custom_field_values"
AS PERMISSIVE
FOR DELETE
TO public
USING (((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.is_platform_admin = true))))))
;


-- Optimizing policy: Users can manage custom_field_values of their tenant_insert ON custom_field_values
DROP POLICY IF EXISTS "Users can manage custom_field_values of their tenant_insert" ON public."custom_field_values";
CREATE POLICY "Users can manage custom_field_values of their tenant_insert" ON public."custom_field_values"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK (((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.is_platform_admin = true))))));


-- Optimizing policy: Users can manage custom_field_values of their tenant_update ON custom_field_values
DROP POLICY IF EXISTS "Users can manage custom_field_values of their tenant_update" ON public."custom_field_values";
CREATE POLICY "Users can manage custom_field_values of their tenant_update" ON public."custom_field_values"
AS PERMISSIVE
FOR UPDATE
TO public
USING (((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.is_platform_admin = true))))))
WITH CHECK (((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.is_platform_admin = true))))));


-- Optimizing policy: Users can manage own tenant ai_configurations ON ai_configurations
DROP POLICY IF EXISTS "Users can manage own tenant ai_configurations" ON public."ai_configurations";
CREATE POLICY "Users can manage own tenant ai_configurations" ON public."ai_configurations"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant ai_conversation_contexts ON ai_conversation_contexts
DROP POLICY IF EXISTS "Users can manage own tenant ai_conversation_contexts" ON public."ai_conversation_contexts";
CREATE POLICY "Users can manage own tenant ai_conversation_contexts" ON public."ai_conversation_contexts"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant ai_module_prompts ON ai_module_prompts
DROP POLICY IF EXISTS "Users can manage own tenant ai_module_prompts" ON public."ai_module_prompts";
CREATE POLICY "Users can manage own tenant ai_module_prompts" ON public."ai_module_prompts"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant ai_usage_logs_delete ON ai_usage_logs
DROP POLICY IF EXISTS "Users can manage own tenant ai_usage_logs_delete" ON public."ai_usage_logs";
CREATE POLICY "Users can manage own tenant ai_usage_logs_delete" ON public."ai_usage_logs"
AS PERMISSIVE
FOR DELETE
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant ai_usage_logs_insert ON ai_usage_logs
DROP POLICY IF EXISTS "Users can manage own tenant ai_usage_logs_insert" ON public."ai_usage_logs";
CREATE POLICY "Users can manage own tenant ai_usage_logs_insert" ON public."ai_usage_logs"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: Users can manage own tenant ai_usage_logs_update ON ai_usage_logs
DROP POLICY IF EXISTS "Users can manage own tenant ai_usage_logs_update" ON public."ai_usage_logs";
CREATE POLICY "Users can manage own tenant ai_usage_logs_update" ON public."ai_usage_logs"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: Users can manage own tenant ai_workflows ON ai_workflows
DROP POLICY IF EXISTS "Users can manage own tenant ai_workflows" ON public."ai_workflows";
CREATE POLICY "Users can manage own tenant ai_workflows" ON public."ai_workflows"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant api_connections ON api_connections
DROP POLICY IF EXISTS "Users can manage own tenant api_connections" ON public."api_connections";
CREATE POLICY "Users can manage own tenant api_connections" ON public."api_connections"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant backup_configurations ON backup_configurations
DROP POLICY IF EXISTS "Users can manage own tenant backup_configurations" ON public."backup_configurations";
CREATE POLICY "Users can manage own tenant backup_configurations" ON public."backup_configurations"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant email_providers ON email_providers
DROP POLICY IF EXISTS "Users can manage own tenant email_providers" ON public."email_providers";
CREATE POLICY "Users can manage own tenant email_providers" ON public."email_providers"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant integrations ON integrations
DROP POLICY IF EXISTS "Users can manage own tenant integrations" ON public."integrations";
CREATE POLICY "Users can manage own tenant integrations" ON public."integrations"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant legal_bases ON legal_bases
DROP POLICY IF EXISTS "Users can manage own tenant legal_bases" ON public."legal_bases";
CREATE POLICY "Users can manage own tenant legal_bases" ON public."legal_bases"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant mappings ON ai_function_mappings
DROP POLICY IF EXISTS "Users can manage own tenant mappings" ON public."ai_function_mappings";
CREATE POLICY "Users can manage own tenant mappings" ON public."ai_function_mappings"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant mcp_providers ON mcp_providers
DROP POLICY IF EXISTS "Users can manage own tenant mcp_providers" ON public."mcp_providers";
CREATE POLICY "Users can manage own tenant mcp_providers" ON public."mcp_providers"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant processing_activities ON processing_activities
DROP POLICY IF EXISTS "Users can manage own tenant processing_activities" ON public."processing_activities";
CREATE POLICY "Users can manage own tenant processing_activities" ON public."processing_activities"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant sso_providers ON sso_providers
DROP POLICY IF EXISTS "Users can manage own tenant sso_providers" ON public."sso_providers";
CREATE POLICY "Users can manage own tenant sso_providers" ON public."sso_providers"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage own tenant webhook_endpoints ON webhook_endpoints
DROP POLICY IF EXISTS "Users can manage own tenant webhook_endpoints" ON public."webhook_endpoints";
CREATE POLICY "Users can manage own tenant webhook_endpoints" ON public."webhook_endpoints"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage risk_action_activities from their tenant ON risk_action_activities
DROP POLICY IF EXISTS "Users can manage risk_action_activities from their tenant" ON public."risk_action_activities";
CREATE POLICY "Users can manage risk_action_activities from their tenant" ON public."risk_action_activities"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage risk_action_plans from their tenant ON risk_action_plans
DROP POLICY IF EXISTS "Users can manage risk_action_plans from their tenant" ON public."risk_action_plans";
CREATE POLICY "Users can manage risk_action_plans from their tenant" ON public."risk_action_plans"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage risk_communications from their tenant ON risk_communications
DROP POLICY IF EXISTS "Users can manage risk_communications from their tenant" ON public."risk_communications";
CREATE POLICY "Users can manage risk_communications from their tenant" ON public."risk_communications"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage risk_registration_action_plans from their tena ON risk_registration_action_plans
DROP POLICY IF EXISTS "Users can manage risk_registration_action_plans from their tena" ON public."risk_registration_action_plans";
CREATE POLICY "Users can manage risk_registration_action_plans from their tena" ON public."risk_registration_action_plans"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage risk_stakeholders by tenant ON risk_stakeholders
DROP POLICY IF EXISTS "Users can manage risk_stakeholders by tenant" ON public."risk_stakeholders";
CREATE POLICY "Users can manage risk_stakeholders by tenant" ON public."risk_stakeholders"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage tasks of vulnerabilities they access ON remediation_tasks
DROP POLICY IF EXISTS "Users can manage tasks of vulnerabilities they access" ON public."remediation_tasks";
CREATE POLICY "Users can manage tasks of vulnerabilities they access" ON public."remediation_tasks"
AS PERMISSIVE
FOR ALL
TO public
USING ((EXISTS ( SELECT 1
   FROM vulnerabilities v
  WHERE ((v.id = remediation_tasks.vulnerability_id) AND ((v.tenant_id = ((( SELECT (select auth.jwt()) AS jwt) ->> 'tenant_id'::text))::uuid) OR is_platform_admin(( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: Users can manage tenant templates_delete ON ai_grc_prompt_templates
DROP POLICY IF EXISTS "Users can manage tenant templates_delete" ON public."ai_grc_prompt_templates";
CREATE POLICY "Users can manage tenant templates_delete" ON public."ai_grc_prompt_templates"
AS PERMISSIVE
FOR DELETE
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can manage tenant templates_insert ON ai_grc_prompt_templates
DROP POLICY IF EXISTS "Users can manage tenant templates_insert" ON public."ai_grc_prompt_templates";
CREATE POLICY "Users can manage tenant templates_insert" ON public."ai_grc_prompt_templates"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: Users can manage tenant templates_update ON ai_grc_prompt_templates
DROP POLICY IF EXISTS "Users can manage tenant templates_update" ON public."ai_grc_prompt_templates";
CREATE POLICY "Users can manage tenant templates_update" ON public."ai_grc_prompt_templates"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: Users can manage their own tokens ON api_tokens
DROP POLICY IF EXISTS "Users can manage their own tokens" ON public."api_tokens";
CREATE POLICY "Users can manage their own tokens" ON public."api_tokens"
AS PERMISSIVE
FOR ALL
TO public
USING ((( SELECT (select auth.uid()) AS uid) = user_id))
;


-- Optimizing policy: Users can read own favorites ON risk_template_favorites
DROP POLICY IF EXISTS "Users can read own favorites" ON public."risk_template_favorites";
CREATE POLICY "Users can read own favorites" ON public."risk_template_favorites"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((( SELECT (select auth.uid()) AS uid) = user_id))
;


-- Optimizing policy: Users can update audit data for their tenant ON policy_audits
DROP POLICY IF EXISTS "Users can update audit data for their tenant" ON public."policy_audits";
CREATE POLICY "Users can update audit data for their tenant" ON public."policy_audits"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can update checklist responses from their tenant ON vendor_checklist_responses
DROP POLICY IF EXISTS "Users can update checklist responses from their tenant" ON public."vendor_checklist_responses";
CREATE POLICY "Users can update checklist responses from their tenant" ON public."vendor_checklist_responses"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((vendor_id IN ( SELECT vendor_registry.id
   FROM vendor_registry
  WHERE (vendor_registry.tenant_id = ( SELECT profiles.tenant_id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: Users can update checklist templates from their tenant ON vendor_checklist_templates
DROP POLICY IF EXISTS "Users can update checklist templates from their tenant" ON public."vendor_checklist_templates";
CREATE POLICY "Users can update checklist templates from their tenant" ON public."vendor_checklist_templates"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can update control matches for their tenant ON policy_control_matches
DROP POLICY IF EXISTS "Users can update control matches for their tenant" ON public."policy_control_matches";
CREATE POLICY "Users can update control matches for their tenant" ON public."policy_control_matches"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((audit_id IN ( SELECT policy_audits.id
   FROM policy_audits
  WHERE (policy_audits.tenant_id IN ( SELECT profiles.tenant_id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: Users can update mappings of their tenant ON framework_mappings
DROP POLICY IF EXISTS "Users can update mappings of their tenant" ON public."framework_mappings";
CREATE POLICY "Users can update mappings of their tenant" ON public."framework_mappings"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((tenant_id = ( SELECT (((( SELECT (select auth.jwt()) AS jwt) -> 'app_metadata'::text) ->> 'tenant_id'::text))::uuid AS uuid)))
;


-- Optimizing policy: Users can update own ratings ON risk_template_ratings
DROP POLICY IF EXISTS "Users can update own ratings" ON public."risk_template_ratings";
CREATE POLICY "Users can update own ratings" ON public."risk_template_ratings"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (((( SELECT (select auth.uid()) AS uid))::text = (user_id)::text))
WITH CHECK (((( SELECT (select auth.uid()) AS uid))::text = (user_id)::text));


-- Optimizing policy: Users can update own report configs ON risk_report_configs
DROP POLICY IF EXISTS "Users can update own report configs" ON public."risk_report_configs";
CREATE POLICY "Users can update own report configs" ON public."risk_report_configs"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((created_by = ( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: Users can update own templates ON risk_library_templates
DROP POLICY IF EXISTS "Users can update own templates" ON public."risk_library_templates";
CREATE POLICY "Users can update own templates" ON public."risk_library_templates"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((created_by = ( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: Users can update policies in their tenant ON policies_v2
DROP POLICY IF EXISTS "Users can update policies in their tenant" ON public."policies_v2";
CREATE POLICY "Users can update policies in their tenant" ON public."policies_v2"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can update profiles based on permissions ON profiles
DROP POLICY IF EXISTS "Users can update profiles based on permissions" ON public."profiles";
CREATE POLICY "Users can update profiles based on permissions" ON public."profiles"
AS PERMISSIVE
FOR UPDATE
TO public
USING (can_manage_user(( SELECT (select auth.uid()) AS uid), user_id))
WITH CHECK (can_manage_user(( SELECT (select auth.uid()) AS uid), user_id));


-- Optimizing policy: Users can update publications in their tenant ON policy_publications
DROP POLICY IF EXISTS "Users can update publications in their tenant" ON public."policy_publications";
CREATE POLICY "Users can update publications in their tenant" ON public."policy_publications"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can update reviews in their tenant ON policy_reviews
DROP POLICY IF EXISTS "Users can update reviews in their tenant" ON public."policy_reviews";
CREATE POLICY "Users can update reviews in their tenant" ON public."policy_reviews"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can update templates in their tenant ON policy_templates
DROP POLICY IF EXISTS "Users can update templates in their tenant" ON public."policy_templates";
CREATE POLICY "Users can update templates in their tenant" ON public."policy_templates"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can update their own notifications ON notifications
DROP POLICY IF EXISTS "Users can update their own notifications" ON public."notifications";
CREATE POLICY "Users can update their own notifications" ON public."notifications"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((( SELECT (select auth.uid()) AS uid) = user_id))
;


-- Optimizing policy: Users can view acceptance letters ON risk_acceptance_letters
DROP POLICY IF EXISTS "Users can view acceptance letters" ON public."risk_acceptance_letters";
CREATE POLICY "Users can view acceptance letters" ON public."risk_acceptance_letters"
AS PERMISSIVE
FOR SELECT
TO public
USING (((created_by = ( SELECT (select auth.uid()) AS uid)) OR (submitted_by = ( SELECT (select auth.uid()) AS uid))))
;


-- Optimizing policy: Users can view acknowledgments from their tenant ON policy_acknowledgments
DROP POLICY IF EXISTS "Users can view acknowledgments from their tenant" ON public."policy_acknowledgments";
CREATE POLICY "Users can view acknowledgments from their tenant" ON public."policy_acknowledgments"
AS PERMISSIVE
FOR SELECT
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can view audit data for their tenant ON policy_audits
DROP POLICY IF EXISTS "Users can view audit data for their tenant" ON public."policy_audits";
CREATE POLICY "Users can view audit data for their tenant" ON public."policy_audits"
AS PERMISSIVE
FOR SELECT
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can view bowtie analyses ON risk_bowtie_analyses
DROP POLICY IF EXISTS "Users can view bowtie analyses" ON public."risk_bowtie_analyses";
CREATE POLICY "Users can view bowtie analyses" ON public."risk_bowtie_analyses"
AS PERMISSIVE
FOR SELECT
TO public
USING ((created_by = ( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: Users can view checklist responses from their tenant ON vendor_checklist_responses
DROP POLICY IF EXISTS "Users can view checklist responses from their tenant" ON public."vendor_checklist_responses";
CREATE POLICY "Users can view checklist responses from their tenant" ON public."vendor_checklist_responses"
AS PERMISSIVE
FOR SELECT
TO public
USING ((vendor_id IN ( SELECT vendor_registry.id
   FROM vendor_registry
  WHERE (vendor_registry.tenant_id = ( SELECT profiles.tenant_id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: Users can view checklist templates from their tenant ON vendor_checklist_templates
DROP POLICY IF EXISTS "Users can view checklist templates from their tenant" ON public."vendor_checklist_templates";
CREATE POLICY "Users can view checklist templates from their tenant" ON public."vendor_checklist_templates"
AS PERMISSIVE
FOR SELECT
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can view comments for incidents in their tenant ON incident_comments
DROP POLICY IF EXISTS "Users can view comments for incidents in their tenant" ON public."incident_comments";
CREATE POLICY "Users can view comments for incidents in their tenant" ON public."incident_comments"
AS PERMISSIVE
FOR SELECT
TO public
USING ((EXISTS ( SELECT 1
   FROM incidents
  WHERE ((incidents.id = incident_comments.incident_id) AND (incidents.tenant_id = ( SELECT profiles.tenant_id
           FROM profiles
          WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid))))))))
;


-- Optimizing policy: Users can view comments of vulnerabilities they access ON vulnerability_comments
DROP POLICY IF EXISTS "Users can view comments of vulnerabilities they access" ON public."vulnerability_comments";
CREATE POLICY "Users can view comments of vulnerabilities they access" ON public."vulnerability_comments"
AS PERMISSIVE
FOR SELECT
TO public
USING ((EXISTS ( SELECT 1
   FROM vulnerabilities v
  WHERE ((v.id = vulnerability_comments.vulnerability_id) AND ((v.tenant_id = ((( SELECT (select auth.jwt()) AS jwt) ->> 'tenant_id'::text))::uuid) OR is_platform_admin(( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: Users can view control matches for their tenant ON policy_control_matches
DROP POLICY IF EXISTS "Users can view control matches for their tenant" ON public."policy_control_matches";
CREATE POLICY "Users can view control matches for their tenant" ON public."policy_control_matches"
AS PERMISSIVE
FOR SELECT
TO public
USING ((audit_id IN ( SELECT policy_audits.id
   FROM policy_audits
  WHERE (policy_audits.tenant_id IN ( SELECT profiles.tenant_id
           FROM profiles
          WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: Users can view custom_fields of their tenant ON custom_fields
DROP POLICY IF EXISTS "Users can view custom_fields of their tenant" ON public."custom_fields";
CREATE POLICY "Users can view custom_fields of their tenant" ON public."custom_fields"
AS PERMISSIVE
FOR SELECT
TO public
USING (((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.is_platform_admin = true))))))
;


-- Optimizing policy: Users can view history for incidents in their tenant ON incident_history
DROP POLICY IF EXISTS "Users can view history for incidents in their tenant" ON public."incident_history";
CREATE POLICY "Users can view history for incidents in their tenant" ON public."incident_history"
AS PERMISSIVE
FOR SELECT
TO public
USING ((EXISTS ( SELECT 1
   FROM incidents
  WHERE ((incidents.id = incident_history.incident_id) AND (incidents.tenant_id = ( SELECT profiles.tenant_id
           FROM profiles
          WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid))))))))
;


-- Optimizing policy: Users can view history of vulnerabilities they can access ON vulnerability_status_history
DROP POLICY IF EXISTS "Users can view history of vulnerabilities they can access" ON public."vulnerability_status_history";
CREATE POLICY "Users can view history of vulnerabilities they can access" ON public."vulnerability_status_history"
AS PERMISSIVE
FOR SELECT
TO public
USING ((EXISTS ( SELECT 1
   FROM vulnerabilities v
  WHERE ((v.id = vulnerability_status_history.vulnerability_id) AND ((v.tenant_id = ((( SELECT (select auth.jwt()) AS jwt) ->> 'tenant_id'::text))::uuid) OR is_platform_admin(( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: Users can view mappings of their tenant ON framework_mappings
DROP POLICY IF EXISTS "Users can view mappings of their tenant" ON public."framework_mappings";
CREATE POLICY "Users can view mappings of their tenant" ON public."framework_mappings"
AS PERMISSIVE
FOR SELECT
TO public
USING ((tenant_id = ( SELECT (((( SELECT (select auth.jwt()) AS jwt) -> 'app_metadata'::text) ->> 'tenant_id'::text))::uuid AS uuid)))
;


-- Optimizing policy: Users can view metrics from their tenant ON policy_metrics
DROP POLICY IF EXISTS "Users can view metrics from their tenant" ON public."policy_metrics";
CREATE POLICY "Users can view metrics from their tenant" ON public."policy_metrics"
AS PERMISSIVE
FOR SELECT
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can view monitoring data ON risk_acceptance_monitoring
DROP POLICY IF EXISTS "Users can view monitoring data" ON public."risk_acceptance_monitoring";
CREATE POLICY "Users can view monitoring data" ON public."risk_acceptance_monitoring"
AS PERMISSIVE
FOR SELECT
TO public
USING ((created_by = ( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: Users can view own analyses ON risk_advanced_analyses
DROP POLICY IF EXISTS "Users can view own analyses" ON public."risk_advanced_analyses";
CREATE POLICY "Users can view own analyses" ON public."risk_advanced_analyses"
AS PERMISSIVE
FOR SELECT
TO public
USING ((created_by = ( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: Users can view own analyses ON risk_intelligent_analyses
DROP POLICY IF EXISTS "Users can view own analyses" ON public."risk_intelligent_analyses";
CREATE POLICY "Users can view own analyses" ON public."risk_intelligent_analyses"
AS PERMISSIVE
FOR SELECT
TO public
USING ((created_by = ( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: Users can view own report configs ON risk_report_configs
DROP POLICY IF EXISTS "Users can view own report configs" ON public."risk_report_configs";
CREATE POLICY "Users can view own report configs" ON public."risk_report_configs"
AS PERMISSIVE
FOR SELECT
TO public
USING ((created_by = ( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: Users can view own tenant integration_logs ON integration_logs
DROP POLICY IF EXISTS "Users can view own tenant integration_logs" ON public."integration_logs";
CREATE POLICY "Users can view own tenant integration_logs" ON public."integration_logs"
AS PERMISSIVE
FOR SELECT
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can view policies from their tenant ON policies_v2
DROP POLICY IF EXISTS "Users can view policies from their tenant" ON public."policies_v2";
CREATE POLICY "Users can view policies from their tenant" ON public."policies_v2"
AS PERMISSIVE
FOR SELECT
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can view public templates and own templates ON risk_library_templates
DROP POLICY IF EXISTS "Users can view public templates and own templates" ON public."risk_library_templates";
CREATE POLICY "Users can view public templates and own templates" ON public."risk_library_templates"
AS PERMISSIVE
FOR SELECT
TO public
USING (((is_public = true) OR (created_by = ( SELECT (select auth.uid()) AS uid))))
;


-- Optimizing policy: Users can view publications from their tenant ON policy_publications
DROP POLICY IF EXISTS "Users can view publications from their tenant" ON public."policy_publications";
CREATE POLICY "Users can view publications from their tenant" ON public."policy_publications"
AS PERMISSIVE
FOR SELECT
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can view quantitative models ON risk_quantitative_models
DROP POLICY IF EXISTS "Users can view quantitative models" ON public."risk_quantitative_models";
CREATE POLICY "Users can view quantitative models" ON public."risk_quantitative_models"
AS PERMISSIVE
FOR SELECT
TO public
USING ((created_by = ( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: Users can view reviews from their tenant ON policy_reviews
DROP POLICY IF EXISTS "Users can view reviews from their tenant" ON public."policy_reviews";
CREATE POLICY "Users can view reviews from their tenant" ON public."policy_reviews"
AS PERMISSIVE
FOR SELECT
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can view scenario analyses ON risk_scenario_analyses
DROP POLICY IF EXISTS "Users can view scenario analyses" ON public."risk_scenario_analyses";
CREATE POLICY "Users can view scenario analyses" ON public."risk_scenario_analyses"
AS PERMISSIVE
FOR SELECT
TO public
USING ((created_by = ( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: Users can view templates from their tenant or global templates ON policy_templates
DROP POLICY IF EXISTS "Users can view templates from their tenant or global templates" ON public."policy_templates";
CREATE POLICY "Users can view templates from their tenant or global templates" ON public."policy_templates"
AS PERMISSIVE
FOR SELECT
TO public
USING (((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))) OR (tenant_id IS NULL)))
;


-- Optimizing policy: Users can view their own notifications ON notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public."notifications";
CREATE POLICY "Users can view their own notifications" ON public."notifications"
AS PERMISSIVE
FOR SELECT
TO public
USING ((( SELECT (select auth.uid()) AS uid) = user_id))
;


-- Optimizing policy: action_plan_activities_tenant_policy ON action_plan_activities
DROP POLICY IF EXISTS "action_plan_activities_tenant_policy" ON public."action_plan_activities";
CREATE POLICY "action_plan_activities_tenant_policy" ON public."action_plan_activities"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: action_plan_categories_tenant_policy ON action_plan_categories
DROP POLICY IF EXISTS "action_plan_categories_tenant_policy" ON public."action_plan_categories";
CREATE POLICY "action_plan_categories_tenant_policy" ON public."action_plan_categories"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: action_plan_comments_tenant_policy ON action_plan_comments
DROP POLICY IF EXISTS "action_plan_comments_tenant_policy" ON public."action_plan_comments";
CREATE POLICY "action_plan_comments_tenant_policy" ON public."action_plan_comments"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: action_plan_history_tenant_policy ON action_plan_history
DROP POLICY IF EXISTS "action_plan_history_tenant_policy" ON public."action_plan_history";
CREATE POLICY "action_plan_history_tenant_policy" ON public."action_plan_history"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: action_plan_notifications_tenant_policy ON action_plan_notifications
DROP POLICY IF EXISTS "action_plan_notifications_tenant_policy" ON public."action_plan_notifications";
CREATE POLICY "action_plan_notifications_tenant_policy" ON public."action_plan_notifications"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: action_plan_templates_tenant_policy ON action_plan_templates
DROP POLICY IF EXISTS "action_plan_templates_tenant_policy" ON public."action_plan_templates";
CREATE POLICY "action_plan_templates_tenant_policy" ON public."action_plan_templates"
AS PERMISSIVE
FOR ALL
TO public
USING (((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (publico = true)))
;


-- Optimizing policy: action_plans_tenant_policy ON action_plans
DROP POLICY IF EXISTS "action_plans_tenant_policy" ON public."action_plans";
CREATE POLICY "action_plans_tenant_policy" ON public."action_plans"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: applications_tenant_isolation ON applications
DROP POLICY IF EXISTS "applications_tenant_isolation" ON public."applications";
CREATE POLICY "applications_tenant_isolation" ON public."applications"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: assessment_action_items_tenant_policy ON assessment_action_items
DROP POLICY IF EXISTS "assessment_action_items_tenant_policy" ON public."assessment_action_items";
CREATE POLICY "assessment_action_items_tenant_policy" ON public."assessment_action_items"
AS PERMISSIVE
FOR ALL
TO public
USING (((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM platform_admins
  WHERE (platform_admins.user_id = ( SELECT (select auth.uid()) AS uid))))))
;


-- Optimizing policy: assessment_action_plans_tenant_policy ON assessment_action_plans
DROP POLICY IF EXISTS "assessment_action_plans_tenant_policy" ON public."assessment_action_plans";
CREATE POLICY "assessment_action_plans_tenant_policy" ON public."assessment_action_plans"
AS PERMISSIVE
FOR ALL
TO public
USING (((EXISTS ( SELECT 1
   FROM platform_admins
  WHERE (platform_admins.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid))))))
;


-- Optimizing policy: assessment_controls_tenant_policy ON assessment_controls
DROP POLICY IF EXISTS "assessment_controls_tenant_policy" ON public."assessment_controls";
CREATE POLICY "assessment_controls_tenant_policy" ON public."assessment_controls"
AS PERMISSIVE
FOR ALL
TO public
USING (((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM platform_admins
  WHERE (platform_admins.user_id = ( SELECT (select auth.uid()) AS uid))))))
;


-- Optimizing policy: assessment_domains_tenant_policy ON assessment_domains
DROP POLICY IF EXISTS "assessment_domains_tenant_policy" ON public."assessment_domains";
CREATE POLICY "assessment_domains_tenant_policy" ON public."assessment_domains"
AS PERMISSIVE
FOR ALL
TO public
USING (((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM platform_admins
  WHERE (platform_admins.user_id = ( SELECT (select auth.uid()) AS uid))))))
;


-- Optimizing policy: assessment_frameworks_tenant_policy ON assessment_frameworks
DROP POLICY IF EXISTS "assessment_frameworks_tenant_policy" ON public."assessment_frameworks";
CREATE POLICY "assessment_frameworks_tenant_policy" ON public."assessment_frameworks"
AS PERMISSIVE
FOR ALL
TO public
USING (((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (publico = true) OR (EXISTS ( SELECT 1
   FROM platform_admins
  WHERE (platform_admins.user_id = ( SELECT (select auth.uid()) AS uid))))))
;


-- Optimizing policy: assessment_history_tenant_policy ON assessment_history
DROP POLICY IF EXISTS "assessment_history_tenant_policy" ON public."assessment_history";
CREATE POLICY "assessment_history_tenant_policy" ON public."assessment_history"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: assessment_questions_tenant_policy ON assessment_questions
DROP POLICY IF EXISTS "assessment_questions_tenant_policy" ON public."assessment_questions";
CREATE POLICY "assessment_questions_tenant_policy" ON public."assessment_questions"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: assessment_responses_tenant_policy ON assessment_responses
DROP POLICY IF EXISTS "assessment_responses_tenant_policy" ON public."assessment_responses";
CREATE POLICY "assessment_responses_tenant_policy" ON public."assessment_responses"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: assets_tenant_isolation ON assets
DROP POLICY IF EXISTS "assets_tenant_isolation" ON public."assets";
CREATE POLICY "assets_tenant_isolation" ON public."assets"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: audit_apontamentos_tenant_policy ON apontamentos
DROP POLICY IF EXISTS "audit_apontamentos_tenant_policy" ON public."apontamentos";
CREATE POLICY "audit_apontamentos_tenant_policy" ON public."apontamentos"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: audit_controles_tenant_policy ON controles_auditoria
DROP POLICY IF EXISTS "audit_controles_tenant_policy" ON public."controles_auditoria";
CREATE POLICY "audit_controles_tenant_policy" ON public."controles_auditoria"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: audit_execucoes_tenant_policy ON execucoes_teste
DROP POLICY IF EXISTS "audit_execucoes_tenant_policy" ON public."execucoes_teste";
CREATE POLICY "audit_execucoes_tenant_policy" ON public."execucoes_teste"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: audit_links_tenant_policy ON audit_object_links
DROP POLICY IF EXISTS "audit_links_tenant_policy" ON public."audit_object_links";
CREATE POLICY "audit_links_tenant_policy" ON public."audit_object_links"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: audit_logs_tenant_policy ON audit_logs
DROP POLICY IF EXISTS "audit_logs_tenant_policy" ON public."audit_logs";
CREATE POLICY "audit_logs_tenant_policy" ON public."audit_logs"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: audit_trail_tenant_policy ON audit_trail
DROP POLICY IF EXISTS "audit_trail_tenant_policy" ON public."audit_trail";
CREATE POLICY "audit_trail_tenant_policy" ON public."audit_trail"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: avaliacoes_conformidade_tenant_policy ON avaliacoes_conformidade
DROP POLICY IF EXISTS "avaliacoes_conformidade_tenant_policy" ON public."avaliacoes_conformidade";
CREATE POLICY "avaliacoes_conformidade_tenant_policy" ON public."avaliacoes_conformidade"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: biblioteca_sox_tenant_policy ON biblioteca_controles_sox
DROP POLICY IF EXISTS "biblioteca_sox_tenant_policy" ON public."biblioteca_controles_sox";
CREATE POLICY "biblioteca_sox_tenant_policy" ON public."biblioteca_controles_sox"
AS PERMISSIVE
FOR ALL
TO public
USING (((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid)))) OR (is_global = true)))
;


-- Optimizing policy: controles_conformidade_tenant_policy ON controles_conformidade
DROP POLICY IF EXISTS "controles_conformidade_tenant_policy" ON public."controles_conformidade";
CREATE POLICY "controles_conformidade_tenant_policy" ON public."controles_conformidade"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: fila_notif_tenant_policy ON fila_notificacoes_compliance
DROP POLICY IF EXISTS "fila_notif_tenant_policy" ON public."fila_notificacoes_compliance";
CREATE POLICY "fila_notif_tenant_policy" ON public."fila_notificacoes_compliance"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: frameworks_compliance_delete_policy ON frameworks_compliance
DROP POLICY IF EXISTS "frameworks_compliance_delete_policy" ON public."frameworks_compliance";
CREATE POLICY "frameworks_compliance_delete_policy" ON public."frameworks_compliance"
AS PERMISSIVE
FOR DELETE
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: frameworks_compliance_insert_policy ON frameworks_compliance
DROP POLICY IF EXISTS "frameworks_compliance_insert_policy" ON public."frameworks_compliance";
CREATE POLICY "frameworks_compliance_insert_policy" ON public."frameworks_compliance"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: frameworks_compliance_select_policy ON frameworks_compliance
DROP POLICY IF EXISTS "frameworks_compliance_select_policy" ON public."frameworks_compliance";
CREATE POLICY "frameworks_compliance_select_policy" ON public."frameworks_compliance"
AS PERMISSIVE
FOR SELECT
TO public
USING (((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR ((is_standard = true) AND (tenant_id IS NULL))))
;


-- Optimizing policy: frameworks_compliance_update_policy ON frameworks_compliance
DROP POLICY IF EXISTS "frameworks_compliance_update_policy" ON public."frameworks_compliance";
CREATE POLICY "frameworks_compliance_update_policy" ON public."frameworks_compliance"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: hist_notif_tenant_policy ON historico_notificacoes_compliance
DROP POLICY IF EXISTS "hist_notif_tenant_policy" ON public."historico_notificacoes_compliance";
CREATE POLICY "hist_notif_tenant_policy" ON public."historico_notificacoes_compliance"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: instancias_relatorios_conformidade_tenant_policy ON instancias_relatorios_conformidade
DROP POLICY IF EXISTS "instancias_relatorios_conformidade_tenant_policy" ON public."instancias_relatorios_conformidade";
CREATE POLICY "instancias_relatorios_conformidade_tenant_policy" ON public."instancias_relatorios_conformidade"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: metricas_conformidade_tenant_policy ON metricas_conformidade
DROP POLICY IF EXISTS "metricas_conformidade_tenant_policy" ON public."metricas_conformidade";
CREATE POLICY "metricas_conformidade_tenant_policy" ON public."metricas_conformidade"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: planning_atividades_tenant_policy ON cronograma_atividades
DROP POLICY IF EXISTS "planning_atividades_tenant_policy" ON public."cronograma_atividades";
CREATE POLICY "planning_atividades_tenant_policy" ON public."cronograma_atividades"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: planning_dashboards_tenant_policy ON dashboards_planejamento
DROP POLICY IF EXISTS "planning_dashboards_tenant_policy" ON public."dashboards_planejamento";
CREATE POLICY "planning_dashboards_tenant_policy" ON public."dashboards_planejamento"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: planning_iniciativas_tenant_policy ON iniciativas_estrategicas
DROP POLICY IF EXISTS "planning_iniciativas_tenant_policy" ON public."iniciativas_estrategicas";
CREATE POLICY "planning_iniciativas_tenant_policy" ON public."iniciativas_estrategicas"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: planning_kpis_tenant_policy ON kpis_planejamento
DROP POLICY IF EXISTS "planning_kpis_tenant_policy" ON public."kpis_planejamento";
CREATE POLICY "planning_kpis_tenant_policy" ON public."kpis_planejamento"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: planning_marcos_tenant_policy ON marcos_planejamento
DROP POLICY IF EXISTS "planning_marcos_tenant_policy" ON public."marcos_planejamento";
CREATE POLICY "planning_marcos_tenant_policy" ON public."marcos_planejamento"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: planning_medicoes_tenant_policy ON medicoes_kpi
DROP POLICY IF EXISTS "planning_medicoes_tenant_policy" ON public."medicoes_kpi";
CREATE POLICY "planning_medicoes_tenant_policy" ON public."medicoes_kpi"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: planning_notificacoes_tenant_policy ON notificacoes_planejamento
DROP POLICY IF EXISTS "planning_notificacoes_tenant_policy" ON public."notificacoes_planejamento";
CREATE POLICY "planning_notificacoes_tenant_policy" ON public."notificacoes_planejamento"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: planning_objetivos_tenant_policy ON objetivos_estrategicos
DROP POLICY IF EXISTS "planning_objetivos_tenant_policy" ON public."objetivos_estrategicos";
CREATE POLICY "planning_objetivos_tenant_policy" ON public."objetivos_estrategicos"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: planning_planos_tenant_policy ON planos_estrategicos
DROP POLICY IF EXISTS "planning_planos_tenant_policy" ON public."planos_estrategicos";
CREATE POLICY "planning_planos_tenant_policy" ON public."planos_estrategicos"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: planning_riscos_tenant_policy ON riscos_planejamento
DROP POLICY IF EXISTS "planning_riscos_tenant_policy" ON public."riscos_planejamento";
CREATE POLICY "planning_riscos_tenant_policy" ON public."riscos_planejamento"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: planos_acao_conformidade_tenant_policy ON planos_acao_conformidade
DROP POLICY IF EXISTS "planos_acao_conformidade_tenant_policy" ON public."planos_acao_conformidade";
CREATE POLICY "planos_acao_conformidade_tenant_policy" ON public."planos_acao_conformidade"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: planos_aud_anuais_tenant_policy ON planos_auditoria_anuais
DROP POLICY IF EXISTS "planos_aud_anuais_tenant_policy" ON public."planos_auditoria_anuais";
CREATE POLICY "planos_aud_anuais_tenant_policy" ON public."planos_auditoria_anuais"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: platform_admins_delete_safe ON platform_admins
DROP POLICY IF EXISTS "platform_admins_delete_safe" ON public."platform_admins";
CREATE POLICY "platform_admins_delete_safe" ON public."platform_admins"
AS PERMISSIVE
FOR DELETE
TO public
USING (is_platform_admin(( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: platform_admins_insert_safe ON platform_admins
DROP POLICY IF EXISTS "platform_admins_insert_safe" ON public."platform_admins";
CREATE POLICY "platform_admins_insert_safe" ON public."platform_admins"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK (is_platform_admin(( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: platform_admins_select_safe ON platform_admins
DROP POLICY IF EXISTS "platform_admins_select_safe" ON public."platform_admins";
CREATE POLICY "platform_admins_select_safe" ON public."platform_admins"
AS PERMISSIVE
FOR SELECT
TO public
USING (((user_id = ( SELECT (select auth.uid()) AS uid)) OR is_platform_admin(( SELECT (select auth.uid()) AS uid))))
;


-- Optimizing policy: platform_admins_update_safe ON platform_admins
DROP POLICY IF EXISTS "platform_admins_update_safe" ON public."platform_admins";
CREATE POLICY "platform_admins_update_safe" ON public."platform_admins"
AS PERMISSIVE
FOR UPDATE
TO public
USING (is_platform_admin(( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: pref_notif_user_policy ON preferencias_notificacao_compliance
DROP POLICY IF EXISTS "pref_notif_user_policy" ON public."preferencias_notificacao_compliance";
CREATE POLICY "pref_notif_user_policy" ON public."preferencias_notificacao_compliance"
AS PERMISSIVE
FOR ALL
TO public
USING ((user_id = ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: proc_aud_tenant_policy ON procedimentos_auditoria
DROP POLICY IF EXISTS "proc_aud_tenant_policy" ON public."procedimentos_auditoria";
CREATE POLICY "proc_aud_tenant_policy" ON public."procedimentos_auditoria"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: regras_notif_tenant_policy ON regras_notificacao_compliance
DROP POLICY IF EXISTS "regras_notif_tenant_policy" ON public."regras_notificacao_compliance";
CREATE POLICY "regras_notif_tenant_policy" ON public."regras_notificacao_compliance"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: relatorios_conformidade_tenant_policy ON relatorios_conformidade
DROP POLICY IF EXISTS "relatorios_conformidade_tenant_policy" ON public."relatorios_conformidade";
CREATE POLICY "relatorios_conformidade_tenant_policy" ON public."relatorios_conformidade"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: requisitos_compliance_tenant_isolation ON requisitos_compliance
DROP POLICY IF EXISTS "requisitos_compliance_tenant_isolation" ON public."requisitos_compliance";
CREATE POLICY "requisitos_compliance_tenant_isolation" ON public."requisitos_compliance"
AS PERMISSIVE
FOR ALL
TO public
USING (((tenant_id IS NOT NULL) AND (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid))))))
;


-- Optimizing policy: riscos_plan_aud_tenant_policy ON riscos_planejamento_auditoria
DROP POLICY IF EXISTS "riscos_plan_aud_tenant_policy" ON public."riscos_planejamento_auditoria";
CREATE POLICY "riscos_plan_aud_tenant_policy" ON public."riscos_planejamento_auditoria"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: risk_assessments_manage_admin ON risk_assessments
DROP POLICY IF EXISTS "risk_assessments_manage_admin" ON public."risk_assessments";
CREATE POLICY "risk_assessments_manage_admin" ON public."risk_assessments"
AS PERMISSIVE
FOR ALL
TO public
USING (is_platform_admin(( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: tenants_manage_admin_delete ON tenants
DROP POLICY IF EXISTS "tenants_manage_admin_delete" ON public."tenants";
CREATE POLICY "tenants_manage_admin_delete" ON public."tenants"
AS PERMISSIVE
FOR DELETE
TO public
USING (is_platform_admin(( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: tenants_manage_admin_insert ON tenants
DROP POLICY IF EXISTS "tenants_manage_admin_insert" ON public."tenants";
CREATE POLICY "tenants_manage_admin_insert" ON public."tenants"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK (is_platform_admin(( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: tenants_manage_admin_update ON tenants
DROP POLICY IF EXISTS "tenants_manage_admin_update" ON public."tenants";
CREATE POLICY "tenants_manage_admin_update" ON public."tenants"
AS PERMISSIVE
FOR UPDATE
TO public
USING (is_platform_admin(( SELECT (select auth.uid()) AS uid)))
WITH CHECK (is_platform_admin(( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: ui_configurations_delete_policy ON ui_configurations
DROP POLICY IF EXISTS "ui_configurations_delete_policy" ON public."ui_configurations";
CREATE POLICY "ui_configurations_delete_policy" ON public."ui_configurations"
AS PERMISSIVE
FOR DELETE
TO public
USING (((is_global = false) AND ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (user_roles.role = 'admin'::app_role)))))))
;


-- Optimizing policy: ui_configurations_insert_policy ON ui_configurations
DROP POLICY IF EXISTS "ui_configurations_insert_policy" ON public."ui_configurations";
CREATE POLICY "ui_configurations_insert_policy" ON public."ui_configurations"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK (((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (user_roles.role = 'admin'::app_role))))));


-- Optimizing policy: ui_configurations_select_policy ON ui_configurations
DROP POLICY IF EXISTS "ui_configurations_select_policy" ON public."ui_configurations";
CREATE POLICY "ui_configurations_select_policy" ON public."ui_configurations"
AS PERMISSIVE
FOR SELECT
TO public
USING (((is_global = true) OR (tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (user_roles.role = 'admin'::app_role))))))
;


-- Optimizing policy: ui_configurations_update_policy ON ui_configurations
DROP POLICY IF EXISTS "ui_configurations_update_policy" ON public."ui_configurations";
CREATE POLICY "ui_configurations_update_policy" ON public."ui_configurations"
AS PERMISSIVE
FOR UPDATE
TO public
USING (((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (user_roles.role = 'admin'::app_role))))))
;


-- Optimizing policy: unified_ALL_ai_grc_providers_policy ON ai_grc_providers
DROP POLICY IF EXISTS "unified_ALL_ai_grc_providers_policy" ON public."ai_grc_providers";
CREATE POLICY "unified_ALL_ai_grc_providers_policy" ON public."ai_grc_providers"
AS PERMISSIVE
FOR ALL
TO public
USING ((((tenant_id IS NULL) AND ( SELECT profiles.is_platform_admin
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid))))))
;


-- Optimizing policy: unified_ALL_sistemas_policy ON sistemas
DROP POLICY IF EXISTS "unified_ALL_sistemas_policy" ON public."sistemas";
CREATE POLICY "unified_ALL_sistemas_policy" ON public."sistemas"
AS PERMISSIVE
FOR ALL
TO public
USING (((tenant_id = (( SELECT (( SELECT (select auth.jwt()) AS jwt) ->> 'tenant_id'::text)))::uuid) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.is_platform_admin = true))))))
;


-- Optimizing policy: unified_ALL_tenant_modules_policy ON tenant_modules
DROP POLICY IF EXISTS "unified_ALL_tenant_modules_policy" ON public."tenant_modules";
CREATE POLICY "unified_ALL_tenant_modules_policy" ON public."tenant_modules"
AS PERMISSIVE
FOR ALL
TO public
USING (((EXISTS ( SELECT 1
   FROM platform_admins
  WHERE (platform_admins.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.is_platform_admin = true))))))
;


-- Optimizing policy: unified_ALL_user_roles_policy_delete ON user_roles
DROP POLICY IF EXISTS "unified_ALL_user_roles_policy_delete" ON public."user_roles";
CREATE POLICY "unified_ALL_user_roles_policy_delete" ON public."user_roles"
AS PERMISSIVE
FOR DELETE
TO public
USING (((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) AND (tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: unified_ALL_user_roles_policy_insert ON user_roles
DROP POLICY IF EXISTS "unified_ALL_user_roles_policy_insert" ON public."user_roles";
CREATE POLICY "unified_ALL_user_roles_policy_insert" ON public."user_roles"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK (((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) AND (tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))));


-- Optimizing policy: unified_ALL_user_roles_policy_update ON user_roles
DROP POLICY IF EXISTS "unified_ALL_user_roles_policy_update" ON public."user_roles";
CREATE POLICY "unified_ALL_user_roles_policy_update" ON public."user_roles"
AS PERMISSIVE
FOR UPDATE
TO public
USING (((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) AND (tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))))
WITH CHECK (((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) AND (tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))));


-- Optimizing policy: unified_INSERT_activity_logs_policy ON activity_logs
DROP POLICY IF EXISTS "unified_INSERT_activity_logs_policy" ON public."activity_logs";
CREATE POLICY "unified_INSERT_activity_logs_policy" ON public."activity_logs"
AS PERMISSIVE
FOR INSERT
TO public

WITH CHECK ((true OR (( SELECT (select auth.uid()) AS uid) = user_id)));


-- Optimizing policy: unified_SELECT_activity_logs_policy ON activity_logs
DROP POLICY IF EXISTS "unified_SELECT_activity_logs_policy" ON public."activity_logs";
CREATE POLICY "unified_SELECT_activity_logs_policy" ON public."activity_logs"
AS PERMISSIVE
FOR SELECT
TO public
USING (((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN user_tenant_access uta ON ((uta.user_id = ur.user_id)))
  WHERE ((ur.user_id = ( SELECT (select auth.uid()) AS uid)) AND (uta.tenant_id = activity_logs.tenant_id) AND (ur.role = ANY (ARRAY['admin'::app_role, 'super_admin'::app_role, 'ciso'::app_role, 'auditor'::app_role, 'risk_manager'::app_role, 'compliance_officer'::app_role]))))) OR (( SELECT (select auth.uid()) AS uid) = user_id) OR (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) OR has_role(( SELECT (select auth.uid()) AS uid), 'ciso'::app_role)) OR (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = ( SELECT (select auth.uid()) AS uid)) AND (ur.role = 'super_admin'::app_role))))))
;


-- Optimizing policy: unified_SELECT_ai_chat_logs_policy ON ai_chat_logs
DROP POLICY IF EXISTS "unified_SELECT_ai_chat_logs_policy" ON public."ai_chat_logs";
CREATE POLICY "unified_SELECT_ai_chat_logs_policy" ON public."ai_chat_logs"
AS PERMISSIVE
FOR SELECT
TO public
USING ((has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) OR (( SELECT (select auth.uid()) AS uid) = user_id)))
;


-- Optimizing policy: unified_SELECT_ai_grc_prompt_templates_policy ON ai_grc_prompt_templates
DROP POLICY IF EXISTS "unified_SELECT_ai_grc_prompt_templates_policy" ON public."ai_grc_prompt_templates";
CREATE POLICY "unified_SELECT_ai_grc_prompt_templates_policy" ON public."ai_grc_prompt_templates"
AS PERMISSIVE
FOR SELECT
TO public
USING (((is_global = true) OR (created_by = ( SELECT (select auth.uid()) AS uid)) OR (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.id = ( SELECT (select auth.uid()) AS uid))))))
;


-- Optimizing policy: unified_SELECT_ai_usage_logs_policy ON ai_usage_logs
DROP POLICY IF EXISTS "unified_SELECT_ai_usage_logs_policy" ON public."ai_usage_logs";
CREATE POLICY "unified_SELECT_ai_usage_logs_policy" ON public."ai_usage_logs"
AS PERMISSIVE
FOR SELECT
TO public
USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.is_platform_admin = true)))) OR (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid))))))
;


-- Optimizing policy: unified_SELECT_font_configurations_policy ON font_configurations
DROP POLICY IF EXISTS "unified_SELECT_font_configurations_policy" ON public."font_configurations";
CREATE POLICY "unified_SELECT_font_configurations_policy" ON public."font_configurations"
AS PERMISSIVE
FOR SELECT
TO public
USING ((has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) OR ((tenant_id IS NULL) OR (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid))))) OR (tenant_id IS NULL)))
;


-- Optimizing policy: unified_SELECT_platform_settings_policy ON platform_settings
DROP POLICY IF EXISTS "unified_SELECT_platform_settings_policy" ON public."platform_settings";
CREATE POLICY "unified_SELECT_platform_settings_policy" ON public."platform_settings"
AS PERMISSIVE
FOR SELECT
TO public
USING ((has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) OR ((is_public = true) AND ((tenant_id IS NULL) OR (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))) OR ((tenant_id IS NULL) AND (is_public = true))))
;


-- Optimizing policy: unified_SELECT_tenants_policy ON tenants
DROP POLICY IF EXISTS "unified_SELECT_tenants_policy" ON public."tenants";
CREATE POLICY "unified_SELECT_tenants_policy" ON public."tenants"
AS PERMISSIVE
FOR SELECT
TO public
USING ((is_platform_admin(( SELECT (select auth.uid()) AS uid)) OR (id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid))))))
;


-- Optimizing policy: unified_SELECT_theme_configurations_policy ON theme_configurations
DROP POLICY IF EXISTS "unified_SELECT_theme_configurations_policy" ON public."theme_configurations";
CREATE POLICY "unified_SELECT_theme_configurations_policy" ON public."theme_configurations"
AS PERMISSIVE
FOR SELECT
TO public
USING (((tenant_id IS NULL) OR (has_role(( SELECT (select auth.uid()) AS uid), 'admin'::app_role) OR ((tenant_id IS NULL) OR (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid))))))))
;


-- Optimizing policy: vulnerabilities_tenant_isolation_optimized ON vulnerabilities
DROP POLICY IF EXISTS "vulnerabilities_tenant_isolation_optimized" ON public."vulnerabilities";
CREATE POLICY "vulnerabilities_tenant_isolation_optimized" ON public."vulnerabilities"
AS PERMISSIVE
FOR ALL
TO public
USING (((tenant_id = ((( SELECT (select auth.jwt()) AS jwt) ->> 'tenant_id'::text))::uuid) OR is_platform_admin(( SELECT (select auth.uid()) AS uid))))
WITH CHECK (((tenant_id = ((( SELECT (select auth.jwt()) AS jwt) ->> 'tenant_id'::text))::uuid) OR is_platform_admin(( SELECT (select auth.uid()) AS uid))));


-- Optimizing policy: vulnerability_classification_templates_tenant_isolation ON vulnerability_classification_templates
DROP POLICY IF EXISTS "vulnerability_classification_templates_tenant_isolation" ON public."vulnerability_classification_templates";
CREATE POLICY "vulnerability_classification_templates_tenant_isolation" ON public."vulnerability_classification_templates"
AS PERMISSIVE
FOR ALL
TO public
USING ((tenant_id = ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: assessments_read_policy ON assessments
DROP POLICY IF EXISTS "assessments_read_policy" ON public."assessments";
CREATE POLICY "assessments_read_policy" ON public."assessments"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((is_platform_admin(( SELECT (select auth.uid()) AS uid)) OR (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = (select auth.uid()))))))
;


-- Optimizing policy: assessments_insert_policy ON assessments
DROP POLICY IF EXISTS "assessments_insert_policy" ON public."assessments";
CREATE POLICY "assessments_insert_policy" ON public."assessments"
AS PERMISSIVE
FOR INSERT
TO authenticated

WITH CHECK (is_platform_admin(( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: assessments_update_policy ON assessments
DROP POLICY IF EXISTS "assessments_update_policy" ON public."assessments";
CREATE POLICY "assessments_update_policy" ON public."assessments"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (is_platform_admin(( SELECT (select auth.uid()) AS uid)))
WITH CHECK (is_platform_admin(( SELECT (select auth.uid()) AS uid)));


-- Optimizing policy: assessments_delete_policy ON assessments
DROP POLICY IF EXISTS "assessments_delete_policy" ON public."assessments";
CREATE POLICY "assessments_delete_policy" ON public."assessments"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (is_platform_admin(( SELECT (select auth.uid()) AS uid)))
;


-- Optimizing policy: apontamentos_auditoria_tenant_policy ON apontamentos_auditoria
DROP POLICY IF EXISTS "apontamentos_auditoria_tenant_policy" ON public."apontamentos_auditoria";
CREATE POLICY "apontamentos_auditoria_tenant_policy" ON public."apontamentos_auditoria"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: audit_risk_assessments_tenant ON audit_risk_assessments
DROP POLICY IF EXISTS "audit_risk_assessments_tenant" ON public."audit_risk_assessments";
CREATE POLICY "audit_risk_assessments_tenant" ON public."audit_risk_assessments"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: audit_risk_matrix_config_tenant ON audit_risk_matrix_config
DROP POLICY IF EXISTS "audit_risk_matrix_config_tenant" ON public."audit_risk_matrix_config";
CREATE POLICY "audit_risk_matrix_config_tenant" ON public."audit_risk_matrix_config"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: audit_sampling_configs_tenant ON audit_sampling_configs
DROP POLICY IF EXISTS "audit_sampling_configs_tenant" ON public."audit_sampling_configs";
CREATE POLICY "audit_sampling_configs_tenant" ON public."audit_sampling_configs"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: audit_sampling_items_tenant ON audit_sampling_items
DROP POLICY IF EXISTS "audit_sampling_items_tenant" ON public."audit_sampling_items";
CREATE POLICY "audit_sampling_items_tenant" ON public."audit_sampling_items"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: audit_sampling_plans_tenant ON audit_sampling_plans
DROP POLICY IF EXISTS "audit_sampling_plans_tenant" ON public."audit_sampling_plans";
CREATE POLICY "audit_sampling_plans_tenant" ON public."audit_sampling_plans"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: custom_fonts_tenant_policy ON custom_fonts
DROP POLICY IF EXISTS "custom_fonts_tenant_policy" ON public."custom_fonts";
CREATE POLICY "custom_fonts_tenant_policy" ON public."custom_fonts"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((is_platform_admin(( SELECT (select auth.uid()) AS uid)) OR (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))) OR (tenant_id IS NULL)))
WITH CHECK ((is_platform_admin(( SELECT (select auth.uid()) AS uid)) OR (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid))))));


-- Optimizing policy: communication_templates_tenant_policy ON ethics_communication_templates
DROP POLICY IF EXISTS "communication_templates_tenant_policy" ON public."ethics_communication_templates";
CREATE POLICY "communication_templates_tenant_policy" ON public."ethics_communication_templates"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: corrective_actions_tenant_policy ON ethics_corrective_actions
DROP POLICY IF EXISTS "corrective_actions_tenant_policy" ON public."ethics_corrective_actions";
CREATE POLICY "corrective_actions_tenant_policy" ON public."ethics_corrective_actions"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: policy_acknowledgments_tenant_policy ON policy_acknowledgments
DROP POLICY IF EXISTS "policy_acknowledgments_tenant_policy" ON public."policy_acknowledgments";
CREATE POLICY "policy_acknowledgments_tenant_policy" ON public."policy_acknowledgments"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: metrics_tenant_policy ON policy_metrics
DROP POLICY IF EXISTS "metrics_tenant_policy" ON public."policy_metrics";
CREATE POLICY "metrics_tenant_policy" ON public."policy_metrics"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: notifications_tenant_policy ON policy_notifications
DROP POLICY IF EXISTS "notifications_tenant_policy" ON public."policy_notifications";
CREATE POLICY "notifications_tenant_policy" ON public."policy_notifications"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: templates_tenant_policy ON policy_templates
DROP POLICY IF EXISTS "templates_tenant_policy" ON public."policy_templates";
CREATE POLICY "templates_tenant_policy" ON public."policy_templates"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: risk_assessments_read_own ON risk_assessments
DROP POLICY IF EXISTS "risk_assessments_read_own" ON public."risk_assessments";
CREATE POLICY "risk_assessments_read_own" ON public."risk_assessments"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: privacy_incidents_tenant_policy ON privacy_incidents
DROP POLICY IF EXISTS "privacy_incidents_tenant_policy" ON public."privacy_incidents";
CREATE POLICY "privacy_incidents_tenant_policy" ON public."privacy_incidents"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: data_inventory_tenant_policy ON data_inventory
DROP POLICY IF EXISTS "data_inventory_tenant_policy" ON public."data_inventory";
CREATE POLICY "data_inventory_tenant_policy" ON public."data_inventory"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: data_subject_requests_tenant_policy ON data_subject_requests
DROP POLICY IF EXISTS "data_subject_requests_tenant_policy" ON public."data_subject_requests";
CREATE POLICY "data_subject_requests_tenant_policy" ON public."data_subject_requests"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: consents_tenant_policy ON consents
DROP POLICY IF EXISTS "consents_tenant_policy" ON public."consents";
CREATE POLICY "consents_tenant_policy" ON public."consents"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: vendor_assessments_tenant_policy ON vendor_assessments
DROP POLICY IF EXISTS "vendor_assessments_tenant_policy" ON public."vendor_assessments";
CREATE POLICY "vendor_assessments_tenant_policy" ON public."vendor_assessments"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: vendor_registry_tenant_policy ON vendor_registry
DROP POLICY IF EXISTS "vendor_registry_tenant_policy" ON public."vendor_registry";
CREATE POLICY "vendor_registry_tenant_policy" ON public."vendor_registry"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: witnesses_tenant_policy ON ethics_witnesses
DROP POLICY IF EXISTS "witnesses_tenant_policy" ON public."ethics_witnesses";
CREATE POLICY "witnesses_tenant_policy" ON public."ethics_witnesses"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: investigation_plans_tenant_policy ON ethics_investigation_plans
DROP POLICY IF EXISTS "investigation_plans_tenant_policy" ON public."ethics_investigation_plans";
CREATE POLICY "investigation_plans_tenant_policy" ON public."ethics_investigation_plans"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: interviews_tenant_policy ON ethics_interviews
DROP POLICY IF EXISTS "interviews_tenant_policy" ON public."ethics_interviews";
CREATE POLICY "interviews_tenant_policy" ON public."ethics_interviews"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: regulatory_notifications_tenant_policy ON ethics_regulatory_notifications
DROP POLICY IF EXISTS "regulatory_notifications_tenant_policy" ON public."ethics_regulatory_notifications";
CREATE POLICY "regulatory_notifications_tenant_policy" ON public."ethics_regulatory_notifications"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: monitoramento_conformidade_tenant_policy ON monitoramento_conformidade
DROP POLICY IF EXISTS "monitoramento_conformidade_tenant_policy" ON public."monitoramento_conformidade";
CREATE POLICY "monitoramento_conformidade_tenant_policy" ON public."monitoramento_conformidade"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: nao_conformidades_tenant_policy ON nao_conformidades
DROP POLICY IF EXISTS "nao_conformidades_tenant_policy" ON public."nao_conformidades";
CREATE POLICY "nao_conformidades_tenant_policy" ON public."nao_conformidades"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: orcamento_aud_tenant_policy ON orcamento_auditoria
DROP POLICY IF EXISTS "orcamento_aud_tenant_policy" ON public."orcamento_auditoria";
CREATE POLICY "orcamento_aud_tenant_policy" ON public."orcamento_auditoria"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: evidence_tenant_policy ON ethics_evidence
DROP POLICY IF EXISTS "evidence_tenant_policy" ON public."ethics_evidence";
CREATE POLICY "evidence_tenant_policy" ON public."ethics_evidence"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: metrics_tenant_policy ON ethics_metrics
DROP POLICY IF EXISTS "metrics_tenant_policy" ON public."ethics_metrics";
CREATE POLICY "metrics_tenant_policy" ON public."ethics_metrics"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: evidencias_auditoria_tenant_policy ON evidencias_auditoria
DROP POLICY IF EXISTS "evidencias_auditoria_tenant_policy" ON public."evidencias_auditoria";
CREATE POLICY "evidencias_auditoria_tenant_policy" ON public."evidencias_auditoria"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: Admins can insert global_ui_themes ON global_ui_themes
DROP POLICY IF EXISTS "Admins can insert global_ui_themes" ON public."global_ui_themes";
CREATE POLICY "Admins can insert global_ui_themes" ON public."global_ui_themes"
AS PERMISSIVE
FOR INSERT
TO authenticated

WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = 'admin'::text)))));


-- Optimizing policy: Admins can update global_ui_themes ON global_ui_themes
DROP POLICY IF EXISTS "Admins can update global_ui_themes" ON public."global_ui_themes";
CREATE POLICY "Admins can update global_ui_themes" ON public."global_ui_themes"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = 'admin'::text)))))
WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = 'admin'::text)))));


-- Optimizing policy: Admins can delete global_ui_themes ON global_ui_themes
DROP POLICY IF EXISTS "Admins can delete global_ui_themes" ON public."global_ui_themes";
CREATE POLICY "Admins can delete global_ui_themes" ON public."global_ui_themes"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = 'admin'::text)))))
;


-- Optimizing policy: legal_bases_tenant_policy ON legal_bases
DROP POLICY IF EXISTS "legal_bases_tenant_policy" ON public."legal_bases";
CREATE POLICY "legal_bases_tenant_policy" ON public."legal_bases"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: policies_tenant_policy ON policies
DROP POLICY IF EXISTS "policies_tenant_policy" ON public."policies";
CREATE POLICY "policies_tenant_policy" ON public."policies"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: processing_activities_tenant_policy ON processing_activities
DROP POLICY IF EXISTS "processing_activities_tenant_policy" ON public."processing_activities";
CREATE POLICY "processing_activities_tenant_policy" ON public."processing_activities"
AS PERMISSIVE
FOR ALL
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: Admins can insert global_ui_settings ON global_ui_settings
DROP POLICY IF EXISTS "Admins can insert global_ui_settings" ON public."global_ui_settings";
CREATE POLICY "Admins can insert global_ui_settings" ON public."global_ui_settings"
AS PERMISSIVE
FOR INSERT
TO authenticated

WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = 'admin'::text)))));


-- Optimizing policy: Admins can update global_ui_settings ON global_ui_settings
DROP POLICY IF EXISTS "Admins can update global_ui_settings" ON public."global_ui_settings";
CREATE POLICY "Admins can update global_ui_settings" ON public."global_ui_settings"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = 'admin'::text)))))
WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = 'admin'::text)))));


-- Optimizing policy: Admins can delete global_ui_settings ON global_ui_settings
DROP POLICY IF EXISTS "Admins can delete global_ui_settings" ON public."global_ui_settings";
CREATE POLICY "Admins can delete global_ui_settings" ON public."global_ui_settings"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = 'admin'::text)))))
;


-- Optimizing policy: risk_registrations_insert ON risk_registrations
DROP POLICY IF EXISTS "risk_registrations_insert" ON public."risk_registrations";
CREATE POLICY "risk_registrations_insert" ON public."risk_registrations"
AS PERMISSIVE
FOR INSERT
TO authenticated

WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: risk_registrations_update ON risk_registrations
DROP POLICY IF EXISTS "risk_registrations_update" ON public."risk_registrations";
CREATE POLICY "risk_registrations_update" ON public."risk_registrations"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: risk_registrations_delete ON risk_registrations
DROP POLICY IF EXISTS "risk_registrations_delete" ON public."risk_registrations";
CREATE POLICY "risk_registrations_delete" ON public."risk_registrations"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: unified_SELECT_group_members ON group_members
DROP POLICY IF EXISTS "unified_SELECT_group_members" ON public."group_members";
CREATE POLICY "unified_SELECT_group_members" ON public."group_members"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))) OR (group_id IN ( SELECT g.id
   FROM groups g
  WHERE (g.tenant_id IN ( SELECT p.tenant_id
           FROM profiles p
          WHERE (p.user_id = ( SELECT (select auth.uid()) AS uid))))))))
;


-- Optimizing policy: unified_INSERT_group_members ON group_members
DROP POLICY IF EXISTS "unified_INSERT_group_members" ON public."group_members";
CREATE POLICY "unified_INSERT_group_members" ON public."group_members"
AS PERMISSIVE
FOR INSERT
TO authenticated

WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));


-- Optimizing policy: unified_UPDATE_group_members ON group_members
DROP POLICY IF EXISTS "unified_UPDATE_group_members" ON public."group_members";
CREATE POLICY "unified_UPDATE_group_members" ON public."group_members"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));


-- Optimizing policy: unified_DELETE_group_members ON group_members
DROP POLICY IF EXISTS "unified_DELETE_group_members" ON public."group_members";
CREATE POLICY "unified_DELETE_group_members" ON public."group_members"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
;


-- Optimizing policy: unified_SELECT_groups ON groups
DROP POLICY IF EXISTS "unified_SELECT_groups" ON public."groups";
CREATE POLICY "unified_SELECT_groups" ON public."groups"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))) OR (tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid))))))
;


-- Optimizing policy: unified_INSERT_groups ON groups
DROP POLICY IF EXISTS "unified_INSERT_groups" ON public."groups";
CREATE POLICY "unified_INSERT_groups" ON public."groups"
AS PERMISSIVE
FOR INSERT
TO authenticated

WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));


-- Optimizing policy: unified_UPDATE_groups ON groups
DROP POLICY IF EXISTS "unified_UPDATE_groups" ON public."groups";
CREATE POLICY "unified_UPDATE_groups" ON public."groups"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));


-- Optimizing policy: unified_DELETE_groups ON groups
DROP POLICY IF EXISTS "unified_DELETE_groups" ON public."groups";
CREATE POLICY "unified_DELETE_groups" ON public."groups"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.user_id = ( SELECT (select auth.uid()) AS uid)) AND (profiles.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
;


-- Optimizing policy: unified_SELECT_attachments ON vulnerability_attachments
DROP POLICY IF EXISTS "unified_SELECT_attachments" ON public."vulnerability_attachments";
CREATE POLICY "unified_SELECT_attachments" ON public."vulnerability_attachments"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((vulnerability_id IN ( SELECT v.id
   FROM vulnerabilities v
  WHERE (v.tenant_id IN ( SELECT p.tenant_id
           FROM profiles p
          WHERE (p.user_id = ( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: unified_INSERT_attachments ON vulnerability_attachments
DROP POLICY IF EXISTS "unified_INSERT_attachments" ON public."vulnerability_attachments";
CREATE POLICY "unified_INSERT_attachments" ON public."vulnerability_attachments"
AS PERMISSIVE
FOR INSERT
TO authenticated

WITH CHECK ((vulnerability_id IN ( SELECT v.id
   FROM vulnerabilities v
  WHERE (v.tenant_id IN ( SELECT p.tenant_id
           FROM profiles p
          WHERE (p.user_id = ( SELECT (select auth.uid()) AS uid)))))));


-- Optimizing policy: unified_DELETE_attachments ON vulnerability_attachments
DROP POLICY IF EXISTS "unified_DELETE_attachments" ON public."vulnerability_attachments";
CREATE POLICY "unified_DELETE_attachments" ON public."vulnerability_attachments"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((vulnerability_id IN ( SELECT v.id
   FROM vulnerabilities v
  WHERE (v.tenant_id IN ( SELECT p.tenant_id
           FROM profiles p
          WHERE (p.user_id = ( SELECT (select auth.uid()) AS uid)))))))
;


-- Optimizing policy: unified_UPDATE_attachments ON vulnerability_attachments
DROP POLICY IF EXISTS "unified_UPDATE_attachments" ON public."vulnerability_attachments";
CREATE POLICY "unified_UPDATE_attachments" ON public."vulnerability_attachments"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ((vulnerability_id IN ( SELECT v.id
   FROM vulnerabilities v
  WHERE (v.tenant_id IN ( SELECT p.tenant_id
           FROM profiles p
          WHERE (p.user_id = ( SELECT (select auth.uid()) AS uid)))))))
WITH CHECK ((vulnerability_id IN ( SELECT v.id
   FROM vulnerabilities v
  WHERE (v.tenant_id IN ( SELECT p.tenant_id
           FROM profiles p
          WHERE (p.user_id = ( SELECT (select auth.uid()) AS uid)))))));


-- Optimizing policy: unified_SELECT_policy_workflow_steps ON policy_workflow_steps
DROP POLICY IF EXISTS "unified_SELECT_policy_workflow_steps" ON public."policy_workflow_steps";
CREATE POLICY "unified_SELECT_policy_workflow_steps" ON public."policy_workflow_steps"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: unified_INSERT_policy_workflow_steps ON policy_workflow_steps
DROP POLICY IF EXISTS "unified_INSERT_policy_workflow_steps" ON public."policy_workflow_steps";
CREATE POLICY "unified_INSERT_policy_workflow_steps" ON public."policy_workflow_steps"
AS PERMISSIVE
FOR INSERT
TO authenticated

WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: unified_UPDATE_policy_workflow_steps ON policy_workflow_steps
DROP POLICY IF EXISTS "unified_UPDATE_policy_workflow_steps" ON public."policy_workflow_steps";
CREATE POLICY "unified_UPDATE_policy_workflow_steps" ON public."policy_workflow_steps"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
WITH CHECK ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))));


-- Optimizing policy: unified_DELETE_policy_workflow_steps ON policy_workflow_steps
DROP POLICY IF EXISTS "unified_DELETE_policy_workflow_steps" ON public."policy_workflow_steps";
CREATE POLICY "unified_DELETE_policy_workflow_steps" ON public."policy_workflow_steps"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((tenant_id IN ( SELECT profiles.tenant_id
   FROM profiles
  WHERE (profiles.user_id = ( SELECT (select auth.uid()) AS uid)))))
;


-- Optimizing policy: Users can view profiles from their tenant ON profiles
DROP POLICY IF EXISTS "Users can view profiles from their tenant" ON public."profiles";
CREATE POLICY "Users can view profiles from their tenant" ON public."profiles"
AS PERMISSIVE
FOR SELECT
TO public
USING (((tenant_id IN ( SELECT user_roles.tenant_id
   FROM user_roles
  WHERE (user_roles.user_id = (select auth.uid())))) OR ((select auth.uid()) = user_id) OR has_role((select auth.uid()), 'super_admin'::app_role)))
;

