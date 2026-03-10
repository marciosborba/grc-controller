import fs from 'fs';

let content = fs.readFileSync('src/hooks/useVendorRiskManagement.ts', 'utf8');

// 1. Add effectiveTenantId in the hook
if (!content.includes('const { effectiveTenantId, isPlatformAdmin }')) {
    content = content.replace(
        'const { user } = authContext;',
        'const { user } = authContext;\n  const { effectiveTenantId, isPlatformAdmin } = useEffectiveTenant();'
    );
}

// 2. Fix early returns
content = content.replace(
    /if \(!user\?\.tenantId \|\| user\.tenantId === 'default'\) \{\s*console\.warn\('[^']+', user\?\.tenantId\);\s*return;\s*\}/g,
    `if (!effectiveTenantId && !isPlatformAdmin) {
      console.warn('Invalid or default tenantId', effectiveTenantId);
      return;
    }`
);
content = content.replace(
    /if \(!user\?\.tenantId \|\| user\.tenantId === 'default'\) return null;/g,
    `if (!effectiveTenantId && !isPlatformAdmin) return null;`
);

// 3. Fix queries with .eq('tenant_id', tenantId)
// Example matcher:
// const tenantId = user.tenantId;
// let query = supabase.from('vendor_registry').select('*').eq('tenant_id', tenantId).order(...);
// We want:
// let query = supabase.from('vendor_registry').select('*').order(...);
// if (effectiveTenantId && effectiveTenantId !== 'default') query = query.eq('tenant_id', effectiveTenantId);

const replaceQuery = (tableName, defaultOrder) => {
    const regex = new RegExp(`const tenantId = user(?:\\?)?\\.tenantId;\\s*let query = supabase\\s*\\.from\\('${tableName}'\\)\\s*\\.select\\('\\*'\\)\\s*\\.eq\\('tenant_id', tenantId\\)\\s*${defaultOrder ? `\\.order\\(${defaultOrder}\\)` : ''};`, 'g');

    content = content.replace(regex, `let query = supabase
        .from('${tableName}')
        .select('*')${defaultOrder ? `\n        .order(${defaultOrder})` : ''};
        
      if (effectiveTenantId && effectiveTenantId !== 'default') {
        query = query.eq('tenant_id', effectiveTenantId);
      }`);
};

replaceQuery('vendor_registry', "'created_at', { ascending: false }");
replaceQuery('vendor_assessments', "'created_at', { ascending: false }");
replaceQuery('vendor_risks', "'created_at', { ascending: false }");
replaceQuery('vendor_risk_action_plans', "'created_at', { ascending: false }");
replaceQuery('vendor_incidents', "'created_at', { ascending: false }");
replaceQuery('vendor_assessment_frameworks', "'created_at', { ascending: false }");

// Custom replacements for metrics and risks
content = content.replace(
    `const tenantId = user.tenantId;\n      const { data, error } = await supabase\n        .from('vendor_registry')\n        .select('risk_score, criticality_level, status')\n        .eq('tenant_id', tenantId);`,
    `let query = supabase.from('vendor_registry').select('risk_score, criticality_level, status');
      if (effectiveTenantId && effectiveTenantId !== 'default') query = query.eq('tenant_id', effectiveTenantId);
      const { data, error } = await query;`
);

content = content.replace(
    `const tenantId = user.tenantId;\n\n      // Fetch vendors to calculate metrics\n      const { data: vendors, error: vendorsError } = await supabase\n        .from('vendor_registry')\n        .select('*')\n        .eq('tenant_id', tenantId);`,
    `let vQuery = supabase.from('vendor_registry').select('*');
      if (effectiveTenantId && effectiveTenantId !== 'default') vQuery = vQuery.eq('tenant_id', effectiveTenantId);
      const { data: vendors, error: vendorsError } = await vQuery;`
);

content = content.replace(
    `const { data: assessments, error: assessmentsError } = await supabase\n        .from('vendor_assessments')\n        .select('*')\n        .eq('tenant_id', tenantId);`,
    `let aQuery = supabase.from('vendor_assessments').select('*');
      if (effectiveTenantId && effectiveTenantId !== 'default') aQuery = aQuery.eq('tenant_id', effectiveTenantId);
      const { data: assessments, error: assessmentsError } = await aQuery;`
);

// Create / Update fixes: change user.tenantId to effectiveTenantId (or default logic)
content = content.replace(/tenant_id: user\?\.tenantId,/g, "tenant_id: effectiveTenantId || '00000000-0000-0000-0000-000000000000',");
content = content.replace(/tenant_id: tenantId,/g, "tenant_id: effectiveTenantId || '00000000-0000-0000-0000-000000000000',");

// Update or conditions: .or(\`tenant_id.eq.\${user?.tenantId},tenant_id.eq.00000000-0000-0000-0000-000000000000\`)
content = content.replace(/\.or\(\`tenant_id\.eq\.\$\{user\?\.tenantId\},tenant_id\.eq\.00000000-0000-0000-0000-000000000000\`\)/g,
    ".or(`tenant_id.eq.${effectiveTenantId},tenant_id.eq.00000000-0000-0000-0000-000000000000`)"
);

// Dependency arrays in useCallback
content = content.replace(/\[user\?\.tenantId/g, '[effectiveTenantId, isPlatformAdmin');

// Exception: `isPlatformAdmin` might need to be added to dependency arrays
content = content.replace(/\[effectiveTenantId, isPlatformAdmin, user\?\.id/g, '[effectiveTenantId, isPlatformAdmin, user?.id');

fs.writeFileSync('src/hooks/useVendorRiskManagement.ts', content, 'utf8');
console.log('Done rewriting hook.');
