import fs from 'fs';

let content = fs.readFileSync('src/hooks/useVendorRiskManagement.ts', 'utf8');

// 1. imports
if (!content.includes('import { useEffectiveTenant }')) {
    content = content.replace("import { useAuth } from '@/contexts/AuthContextOptimized';", "import { useAuth } from '@/contexts/AuthContextOptimized';\nimport { useEffectiveTenant } from '@/hooks/useEffectiveTenant';");
}

// 2. hook definition
if (!content.includes('const { effectiveTenantId, isPlatformAdmin }')) {
    content = content.replace('const { user } = authContext;', 'const { user } = authContext;\n  const { effectiveTenantId, isPlatformAdmin } = useEffectiveTenant();');
}

// 3. fetch methods early returns
content = content.replace(/if \(!user\?\.tenantId \|\| user\.tenantId === 'default'\) \{\s*console\.warn\('[^']+', user\?\.tenantId\);\s*return;\s*\}/g,
    `    if (!effectiveTenantId && !isPlatformAdmin) {
      console.warn('fetch method: Invalid or default tenantId');
      return;
    }`);

// 4. create methods early returns
content = content.replace(/if \(!user\?\.tenantId \|\| user\.tenantId === 'default'\) return null;/g,
    `if (!effectiveTenantId && !isPlatformAdmin) return null;`);

// 5. Query modifications using a specific block replacer
function fixQuery(tableName, orderBy) {
    const matchStr = `const tenantId = user.tenantId;\n      let query = supabase\n        .from('${tableName}')\n        .select('*')\n        .eq('tenant_id', tenantId)\n        .order(${orderBy});`;
    const replaceStr = `let query = supabase\n        .from('${tableName}')\n        .select('*')\n        .order(${orderBy});\n\n      if (effectiveTenantId && effectiveTenantId !== 'default') {\n        query = query.eq('tenant_id', effectiveTenantId);\n      }`;
    content = content.replace(matchStr, replaceStr);
}

fixQuery('vendor_registry', "'created_at', { ascending: false }");
fixQuery('vendor_assessments', "'created_at', { ascending: false }");
fixQuery('vendor_risks', "'created_at', { ascending: false }");
fixQuery('vendor_risk_action_plans', "'created_at', { ascending: false }");
fixQuery('vendor_incidents', "'created_at', { ascending: false }");
fixQuery('vendor_assessment_frameworks', "'created_at', { ascending: false }");

// Custom fixes
content = content.replace(
    "const tenantId = user.tenantId;\n      const { data, error } = await supabase\n        .from('vendor_registry')\n        .select('risk_score, criticality_level, status')\n        .eq('tenant_id', tenantId);",
    "let query = supabase.from('vendor_registry').select('risk_score, criticality_level, status');\n      if (effectiveTenantId && effectiveTenantId !== 'default') query = query.eq('tenant_id', effectiveTenantId);\n      const { data, error } = await query;"
);

content = content.replace(
    "const tenantId = user.tenantId;\n\n      // Fetch vendors to calculate metrics\n      const { data: vendors, error: vendorsError } = await supabase\n        .from('vendor_registry')\n        .select('*')\n        .eq('tenant_id', tenantId);",
    "let vQuery = supabase.from('vendor_registry').select('*');\n      if (effectiveTenantId && effectiveTenantId !== 'default') vQuery = vQuery.eq('tenant_id', effectiveTenantId);\n      const { data: vendors, error: vendorsError } = await vQuery;"
);

content = content.replace(
    "const { data: assessments, error: assessmentsError } = await supabase\n        .from('vendor_assessments')\n        .select('*')\n        .eq('tenant_id', tenantId);",
    "let aQuery = supabase.from('vendor_assessments').select('*');\n      if (effectiveTenantId && effectiveTenantId !== 'default') aQuery = aQuery.eq('tenant_id', effectiveTenantId);\n      const { data: assessments, error: assessmentsError } = await aQuery;"
);

content = content.replace(
    "tenant_id: tenantId,",
    "tenant_id: effectiveTenantId || '00000000-0000-0000-0000-000000000000',"
);
content = content.replace(
    "tenant_id: user?.tenantId,",
    "tenant_id: effectiveTenantId || '00000000-0000-0000-0000-000000000000',"
);

content = content.replace(/\.or\(\`tenant_id\.eq\.\$\{user\?\.tenantId\},tenant_id\.eq\.00000000-0000-0000-0000-000000000000\`\)/g,
    ".or(`tenant_id.eq.${effectiveTenantId},tenant_id.eq.00000000-0000-0000-0000-000000000000`)"
);

// Fix useEffect in initialization
content = content.replace(
    "useEffect(() => {\n    if (user?.tenantId) {",
    "useEffect(() => {\n    if (effectiveTenantId || isPlatformAdmin) {"
);

content = content.replace(
    "[user?.tenantId, fetchFrameworks, fetchDashboardMetrics, fetchRiskDistribution]",
    "[effectiveTenantId, isPlatformAdmin, fetchFrameworks, fetchDashboardMetrics, fetchRiskDistribution]"
);

// Dependency arrays replacements:
content = content.replace(/\[user\?\.tenantId/g, '[effectiveTenantId, isPlatformAdmin');

// Any remaining "tenantId" constants within create functions that weren't caught
content = content.replace(/const tenantId = user\.tenantId;/g, 'const tenantId = effectiveTenantId;');

fs.writeFileSync('src/hooks/useVendorRiskManagement.ts', content, 'utf8');
console.log('Patch complete.');
