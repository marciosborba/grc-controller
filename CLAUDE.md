# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

**Development & Build:**
- `npm run dev` - Start development server on port 8080
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run check-user-management` - Run user management validation script
- `npm run fix-errors` - Run auto-fix script

**Testing:**
- No test framework currently configured. The project uses manual testing and validation scripts.

## Architecture Overview

This is a **GRC (Governance, Risk, and Compliance)** management system built with:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL database + Auth + Edge Functions)
- **UI Framework**: shadcn/ui components + Radix UI + Tailwind CSS
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM

### Key Architecture Patterns

**Authentication & Authorization:**
- Multi-tenant system with role-based access control (RBAC)
- Two types of roles: System roles (admin, ciso, risk_manager, etc.) and Assessment-specific roles (respondent, auditor)
- Authentication handled via AuthContext (`src/contexts/AuthContext.tsx`)
- Security logging and activity tracking implemented

**Database Design:**
- Comprehensive schema with 20+ tables covering assessments, frameworks, risks, policies, etc.
- Key entities: assessments, frameworks, framework_controls, assessment_responses, profiles, user_roles
- Foreign key relationships maintain data integrity
- Database types auto-generated in `src/integrations/supabase/types.ts`

**Component Structure:**
- Feature-based organization under `src/components/`
- Modular UI components in `src/components/ui/` (shadcn/ui)
- Domain-specific components: assessments, admin, risks, compliance, etc.
- Layout components: AppLayout, AppSidebar, AppHeader

### Core Features

**Assessment Management:**
- Framework-based compliance assessments with maturity scoring (1-5 scale)
- Control evaluation workflow: respondent answers → auditor reviews
- Evidence upload and attachment support
- Progress tracking and reporting

**User Management:**
- Role-based access with hierarchical permissions
- MFA support and security features
- Activity logging and audit trails
- Tenant isolation for multi-organization support

**Risk Management:**
- Risk assessment with impact/likelihood scoring
- Action plans and treatment tracking
- Risk communication workflows

**Compliance & Audit:**
- Policy management with approval workflows
- Compliance tracking and reporting
- Audit report generation

## Important Implementation Notes

**Role Management:**
- System roles are managed via user_roles table
- Assessment roles are specific to each assessment (assessment_user_roles table)
- Never assign assessment roles (respondent/auditor) through general user management - use assessment-specific interfaces

**Security Best Practices:**
- All user inputs are sanitized via `sanitizeInput()` utility
- Comprehensive security logging in `utils/securityLogger.ts`
- Rate limiting and suspicious activity detection
- Secure authentication state management

**Database Queries:**
- Use typed Supabase client for all database operations
- Leverage RPC functions for complex operations (calculate_assessment_progress, etc.)
- Follow row-level security policies

**Development Patterns:**
- TypeScript strict mode enabled
- ESLint configuration with React hooks rules
- Component composition with shadcn/ui patterns
- Custom hooks for feature-specific logic (useAssessments, useUserManagement, etc.)
- Drag-and-drop functionality using @dnd-kit for sortable interfaces
- Form handling with react-hook-form + Zod validation

## Key File Locations

**Configuration:**
- `vite.config.ts` - Build configuration (port 8080, path aliases)
- `eslint.config.js` - Linting rules
- `tailwind.config.ts` - Styling configuration
- `components.json` - shadcn/ui configuration

**Database:**
- `src/integrations/supabase/client.ts` - Supabase client setup
- `src/integrations/supabase/types.ts` - Generated database types
- `supabase/migrations/` - Database schema migrations

**Core Logic:**
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions (validation, security, etc.)

**Documentation:**
- `docs/ROLES_SISTEMA.md` - Detailed role system documentation
- `docs/USER_MANAGEMENT_SYSTEM.md` - User management system details
- `docs/RISK_MANAGEMENT_SYSTEM.md` - Risk management implementation guide
- `README.md` - Project setup and deployment info

**Scripts & Utilities:**
- `scripts/check-user-management.js` - User management system validation
- `scripts/auto-fix.js` - Automated error fixing script
- `scripts/create-platform-admin.js` - Platform admin user creation
- Various SQL migration files in `supabase/migrations/`