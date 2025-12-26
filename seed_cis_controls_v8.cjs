const DatabaseManager = require('./database-manager.cjs');

// === CIS CONTROLS v8 FULL (18 Controls, 153 Safeguards) ===
// C1:5, C2:7, C3:14, C4:12, C5:6, C6:8, C7:7, C8:12, C9:7, C10:7, C11:5, C12:8, C13:11, C14:9, C15:7, C16:14, C17:9, C18:5 = 153.
const CIS_DATA = {
    data: {
        nome: 'CIS Controls v8', codigo: 'CIS-Controls-v8', descricao: 'CIS Critical Security Controls v8 (18 Controls, 153 Safeguards)', versao: '8.0', tipo_framework: 'CIS', categoria: 'Cibersegurança', is_standard: true, publico: true, status: 'ativo'
    },
    domains: [
        {
            nome: '01. Inventory and Control of Enterprise Assets', codigo: 'CIS-01', ordem: 1, peso: 10,
            controls: [
                { codigo: '1.1', titulo: 'Inventory Enterprise Assets', tipo: 'preventivo', obj: 'Maintain detailed asset inventory.', questions: [{ pergunta: 'Is a detailed asset inventory maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '1.2', titulo: 'Address Unauthorized Assets', tipo: 'corretivo', obj: 'Remove unauthorized assets.', questions: [{ pergunta: 'Are unauthorized assets addressed weekly?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '1.3', titulo: 'Active Discovery Tool', tipo: 'detectivo', obj: 'Use active discovery.', questions: [{ pergunta: 'Is an active discovery tool utilized?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '1.4', titulo: 'DHCP Logging', tipo: 'detectivo', obj: 'Use DHCP logs.', questions: [{ pergunta: 'Are DHCP logs used to update inventory?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '1.5', titulo: 'Passive Discovery Tool', tipo: 'detectivo', obj: 'Use passive discovery.', questions: [{ pergunta: 'Is a passive discovery tool utilized?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '02. Inventory and Control of Software Assets', codigo: 'CIS-02', ordem: 2, peso: 10,
            controls: [
                { codigo: '2.1', titulo: 'Software Inventory', tipo: 'preventivo', obj: 'Maintain software inventory.', questions: [{ pergunta: 'Is a software inventory maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '2.2', titulo: 'Authorized Software', tipo: 'preventivo', obj: 'Ensure authorized software.', questions: [{ pergunta: 'Is only authorized software installed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '2.3', titulo: 'Address Unauthorized Software', tipo: 'corretivo', obj: 'Remove unauthorized software.', questions: [{ pergunta: 'Is unauthorized software addressed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '2.4', titulo: 'Automated Inventory Tools', tipo: 'detectivo', obj: 'Use automated tools.', questions: [{ pergunta: 'Are automated tools used for software inventory?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '2.5', titulo: 'Allowlist Software', tipo: 'preventivo', obj: 'Allowlist authorized software.', questions: [{ pergunta: 'Is authorized software allowlisted?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '2.6', titulo: 'Allowlist Libraries', tipo: 'preventivo', obj: 'Allowlist authorized libraries.', questions: [{ pergunta: 'Are authorized libraries allowlisted?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '2.7', titulo: 'Allowlist Scripts', tipo: 'preventivo', obj: 'Allowlist authorized scripts.', questions: [{ pergunta: 'Are authorized scripts allowlisted?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '03. Data Protection', codigo: 'CIS-03', ordem: 3, peso: 10,
            controls: [
                { codigo: '3.1', titulo: 'Data Management Process', tipo: 'preventivo', obj: 'Establish process.', questions: [{ pergunta: 'Is a data management process established?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.2', titulo: 'Data Inventory', tipo: 'preventivo', obj: 'Maintain inventory.', questions: [{ pergunta: 'Is a data inventory maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.3', titulo: 'Data Access Control', tipo: 'preventivo', obj: 'Configure ACLs.', questions: [{ pergunta: 'Are data ACLs configured?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.4', titulo: 'Data Retention', tipo: 'preventivo', obj: 'Enforce retention.', questions: [{ pergunta: 'Is data retention enforced?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.5', titulo: 'Secure Disposal', tipo: 'preventivo', obj: 'Securely dispose.', questions: [{ pergunta: 'Is data securely disposed of?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.6', titulo: 'Encrypt End-User Devices', tipo: 'preventivo', obj: 'Encrypt devices.', questions: [{ pergunta: 'Is data on devices encrypted?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.7', titulo: 'Data Classification', tipo: 'preventivo', obj: 'Classification scheme.', questions: [{ pergunta: 'Is a data classification scheme maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.8', titulo: 'Document Data Flows', tipo: 'detectivo', obj: 'Map flows.', questions: [{ pergunta: 'Are data flows documented?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.9', titulo: 'Encrypt Removable Media', tipo: 'preventivo', obj: 'Encrypt media.', questions: [{ pergunta: 'Is data on removable media encrypted?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.10', titulo: 'Encrypt Transit', tipo: 'preventivo', obj: 'Encrypt transit.', questions: [{ pergunta: 'Is sensitive data encrypted in transit?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.11', titulo: 'Encrypt At Rest', tipo: 'preventivo', obj: 'Encrypt rest.', questions: [{ pergunta: 'Is sensitive data encrypted at rest?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.12', titulo: 'Segment Processing', tipo: 'preventivo', obj: 'Segmentation.', questions: [{ pergunta: 'Is data processing segmented?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.13', titulo: 'Deploy DLP', tipo: 'detectivo', obj: 'DLP solution.', questions: [{ pergunta: 'Is a DLP solution deployed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.14', titulo: 'Log Access', tipo: 'detectivo', obj: 'Log sensitive access.', questions: [{ pergunta: 'Is access to sensitive data logged?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '04. Secure Configuration of Enterprise Assets and Software', codigo: 'CIS-04', ordem: 4, peso: 10,
            controls: [
                { codigo: '4.1', titulo: 'Secure Config Process', tipo: 'preventivo', obj: 'Config process.', questions: [{ pergunta: 'Is a secure configuration process maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.2', titulo: 'Secure Config Infra', tipo: 'preventivo', obj: 'Config infra.', questions: [{ pergunta: 'Is secure config infra maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.3', titulo: 'Session Locking', tipo: 'preventivo', obj: 'Auto locking.', questions: [{ pergunta: 'Is auto session locking configured?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.4', titulo: 'Firewalls on Servers', tipo: 'preventivo', obj: 'Server firewalls.', questions: [{ pergunta: 'Are firewalls managed on servers?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.5', titulo: 'Firewalls on End-user Devices', tipo: 'preventivo', obj: 'Device firewalls.', questions: [{ pergunta: 'Are firewalls managed on user devices?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.6', titulo: 'Secure Management', tipo: 'preventivo', obj: 'Secure admin.', questions: [{ pergunta: 'Are assets and software securely managed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.7', titulo: 'Manage Default Accounts', tipo: 'preventivo', obj: 'Default accounts.', questions: [{ pergunta: 'Are default accounts managed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.8', titulo: 'Remove Unnecessary Services', tipo: 'preventivo', obj: 'Remove services.', questions: [{ pergunta: 'Are unnecessary services removed or disabled?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.9', titulo: 'Trusted DNS', tipo: 'preventivo', obj: 'DNS.', questions: [{ pergunta: 'Are trusted DNS servers configured?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.10', titulo: 'Device Lockout', tipo: 'preventivo', obj: 'Lockout.', questions: [{ pergunta: 'Is auto device lockout enforced?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.11', titulo: 'Remote Wipe', tipo: 'corretivo', obj: 'Wipe.', questions: [{ pergunta: 'Is remote wipe capability enabled?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.12', titulo: 'Separate Workspaces', tipo: 'preventivo', obj: 'Workspaces.', questions: [{ pergunta: 'Are enterprise workspaces separated on mobile?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '05. Account Management', codigo: 'CIS-05', ordem: 5, peso: 10,
            controls: [
                { codigo: '5.1', titulo: 'Account Inventory', tipo: 'preventivo', obj: 'Maintain inventory.', questions: [{ pergunta: 'Is an account inventory maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '5.2', titulo: 'Unique Passwords', tipo: 'preventivo', obj: 'Unique passwords.', questions: [{ pergunta: 'Are unique passwords used?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '5.3', titulo: 'Disable Dormant Accounts', tipo: 'preventivo', obj: 'Disable dormant.', questions: [{ pergunta: 'Are dormant accounts disabled?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '5.4', titulo: 'Restrict Admin Privileges', tipo: 'preventivo', obj: 'Restrict admin.', questions: [{ pergunta: 'Are admin privileges restricted?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '5.5', titulo: 'Service Account Inventory', tipo: 'preventivo', obj: 'Service accounts.', questions: [{ pergunta: 'Is a service account inventory maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '5.6', titulo: 'Centralize Management', tipo: 'preventivo', obj: 'Centralize.', questions: [{ pergunta: 'Is account management centralized?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '06. Access Control Management', codigo: 'CIS-06', ordem: 6, peso: 10,
            controls: [
                { codigo: '6.1', titulo: 'Access Granting Process', tipo: 'preventivo', obj: 'Granting.', questions: [{ pergunta: 'Is an access granting process established?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.2', titulo: 'Access Revoking Process', tipo: 'preventivo', obj: 'Revoking.', questions: [{ pergunta: 'Is an access revoking process established?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.3', titulo: 'MFA for External Apps', tipo: 'preventivo', obj: 'External MFA.', questions: [{ pergunta: 'Is MFA required for external apps?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.4', titulo: 'MFA for Remote Access', tipo: 'preventivo', obj: 'Remote MFA.', questions: [{ pergunta: 'Is MFA required for remote access?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.5', titulo: 'MFA for Admin Access', tipo: 'preventivo', obj: 'Admin MFA.', questions: [{ pergunta: 'Is MFA required for admin access?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.6', titulo: 'Auth System Inventory', tipo: 'preventivo', obj: 'Inventory.', questions: [{ pergunta: 'Is an auth system inventory maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.7', titulo: 'Centralize Access Control', tipo: 'preventivo', obj: 'Centralize.', questions: [{ pergunta: 'Is access control centralized?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.8', titulo: 'RBAC', tipo: 'preventivo', obj: 'Role-based access.', questions: [{ pergunta: 'Is RBAC defined and maintained?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '07. Continuous Vulnerability Management', codigo: 'CIS-07', ordem: 7, peso: 10,
            controls: [
                { codigo: '7.1', titulo: 'Vuln Mgmt Process', tipo: 'preventivo', obj: 'Process.', questions: [{ pergunta: 'Is a vuln management process maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '7.2', titulo: 'Remediation Process', tipo: 'corretivo', obj: 'Remediation.', questions: [{ pergunta: 'Is a remediation process maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '7.3', titulo: 'Automated OS Patching', tipo: 'preventivo', obj: 'OS Patching.', questions: [{ pergunta: 'Is OS patching automated?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '7.4', titulo: 'Automated App Patching', tipo: 'preventivo', obj: 'App Patching.', questions: [{ pergunta: 'Is app patching automated?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '7.5', titulo: 'Automated Internal Scans', tipo: 'detectivo', obj: 'Internal Scans.', questions: [{ pergunta: 'Are internal scans automated?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '7.6', titulo: 'Automated External Scans', tipo: 'detectivo', obj: 'External Scans.', questions: [{ pergunta: 'Are external scans automated?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '7.7', titulo: 'Remediate Vulnerabilities', tipo: 'corretivo', obj: 'Remediate.', questions: [{ pergunta: 'Are vulns remediated?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '08. Audit Log Management', codigo: 'CIS-08', ordem: 8, peso: 10,
            controls: [
                { codigo: '8.1', titulo: 'Audit Log Process', tipo: 'preventivo', obj: 'Process.', questions: [{ pergunta: 'Is a log management process maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.2', titulo: 'Collect Audit Logs', tipo: 'detectivo', obj: 'Collect.', questions: [{ pergunta: 'Are audit logs collected?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.3', titulo: 'Ensure Storage', tipo: 'preventivo', obj: 'Storage.', questions: [{ pergunta: 'Is storage adequate?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.4', titulo: 'Time Synchronization', tipo: 'preventivo', obj: 'NTP.', questions: [{ pergunta: 'Is time synchronized?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.5', titulo: 'Detailed Logs', tipo: 'detectivo', obj: 'Detail.', questions: [{ pergunta: 'Are detailed logs collected?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.6', titulo: 'DNS Logs', tipo: 'detectivo', obj: 'DNS.', questions: [{ pergunta: 'Are DNS logs collected?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.7', titulo: 'URL Logs', tipo: 'detectivo', obj: 'URL.', questions: [{ pergunta: 'Are URL logs collected?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.8', titulo: 'CLI Logs', tipo: 'detectivo', obj: 'CLI.', questions: [{ pergunta: 'Are CLI logs collected?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.9', titulo: 'Centralize Logs', tipo: 'preventivo', obj: 'Centralize.', questions: [{ pergunta: 'Are logs centralized?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.10', titulo: 'Retain Logs', tipo: 'preventivo', obj: 'Retention.', questions: [{ pergunta: 'Are logs retained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.11', titulo: 'Review Logs', tipo: 'detectivo', obj: 'Review.', questions: [{ pergunta: 'Are logs reviewed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.12', titulo: 'Service Provider Logs', tipo: 'detectivo', obj: 'Provider.', questions: [{ pergunta: 'Are provider logs collected?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '09. Email and Web Browser Protections', codigo: 'CIS-09', ordem: 9, peso: 10,
            controls: [
                { codigo: '9.1', titulo: 'Supported Browsers/Clients', tipo: 'preventivo', obj: 'Supported only.', questions: [{ pergunta: 'Are only supported clients used?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '9.2', titulo: 'DNS Filtering', tipo: 'preventivo', obj: 'DNS filter.', questions: [{ pergunta: 'Are DNS filtering services used?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '9.3', titulo: 'URL Filters', tipo: 'preventivo', obj: 'URL filter.', questions: [{ pergunta: 'Are URL filters enforced?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '9.4', titulo: 'Restrict Extensions', tipo: 'preventivo', obj: 'Extensions.', questions: [{ pergunta: 'Are extensions restricted?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '9.5', titulo: 'DMARC', tipo: 'preventivo', obj: 'Impl DMARC.', questions: [{ pergunta: 'Is DMARC implemented?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '9.6', titulo: 'Block File Types', tipo: 'preventivo', obj: 'Block files.', questions: [{ pergunta: 'Are unnecessary file types blocked?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '9.7', titulo: 'Email Server Anti-Malware', tipo: 'preventivo', obj: 'Server malware.', questions: [{ pergunta: 'Are email malware protections maintained?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '10. Malware Defenses', codigo: 'CIS-10', ordem: 10, peso: 10,
            controls: [
                { codigo: '10.1', titulo: 'Deploy Anti-Malware', tipo: 'preventivo', obj: 'Software.', questions: [{ pergunta: 'Is anti-malware maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '10.2', titulo: 'Auto Signature Updates', tipo: 'preventivo', obj: 'Updates.', questions: [{ pergunta: 'Are signature updates automated?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '10.3', titulo: 'Disable Autorun', tipo: 'preventivo', obj: 'Autorun.', questions: [{ pergunta: 'Are Autorun/Autoplay disabled?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '10.4', titulo: 'Auto Scanning', tipo: 'detectivo', obj: 'Scanning.', questions: [{ pergunta: 'Is scanning automated?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '10.5', titulo: 'Anti-Exploitation', tipo: 'preventivo', obj: 'Exploit.', questions: [{ pergunta: 'Are anti-exploitation features enabled?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '10.6', titulo: 'Central Management', tipo: 'preventivo', obj: 'Central.', questions: [{ pergunta: 'Is anti-malware centrally managed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '10.7', titulo: 'Behavior-Based', tipo: 'detectivo', obj: 'Behavior.', questions: [{ pergunta: 'Is behavior-based malware detection used?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '11. Data Recovery', codigo: 'CIS-11', ordem: 11, peso: 10,
            controls: [
                { codigo: '11.1', titulo: 'Data Recovery Process', tipo: 'preventivo', obj: 'Process.', questions: [{ pergunta: 'Is a data recovery process maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '11.2', titulo: 'Automated Backups', tipo: 'preventivo', obj: 'Backups.', questions: [{ pergunta: 'Are backups automated?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '11.3', titulo: 'Protect Recovery Data', tipo: 'preventivo', obj: 'Protect.', questions: [{ pergunta: 'Is recovery data protected?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '11.4', titulo: 'Isolated Recovery Data', tipo: 'preventivo', obj: 'Isolated.', questions: [{ pergunta: 'Is there an isolated recovery data instance?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '11.5', titulo: 'Test Data Recovery', tipo: 'corretivo', obj: 'Test.', questions: [{ pergunta: 'Is data recovery tested?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '12. Network Infrastructure Management', codigo: 'CIS-12', ordem: 12, peso: 10,
            controls: [
                { codigo: '12.1', titulo: 'Network Infra Up-to-Date', tipo: 'preventivo', obj: 'Update.', questions: [{ pergunta: 'Is network infra up to date?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.2', titulo: 'Secure Network Architecture', tipo: 'preventivo', obj: 'Arch.', questions: [{ pergunta: 'Is secure network architecture maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.3', titulo: 'Secure Network Management', tipo: 'preventivo', obj: 'Manage.', questions: [{ pergunta: 'Is network infra securely managed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.4', titulo: 'Maintain Diagrams', tipo: 'preventivo', obj: 'Diagrams.', questions: [{ pergunta: 'Are diagrams maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.5', titulo: 'Centralize AAA', tipo: 'preventivo', obj: 'AAA.', questions: [{ pergunta: 'Is AAA centralized?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.6', titulo: 'Secure Protocols', tipo: 'preventivo', obj: 'Protocols.', questions: [{ pergunta: 'Are secure protocols used?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.7', titulo: 'Remote Device Auth', tipo: 'preventivo', obj: 'Auth.', questions: [{ pergunta: 'Do remote devices authenticate?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.8', titulo: 'Dedicated Resources', tipo: 'preventivo', obj: 'Dedicated.', questions: [{ pergunta: 'Are dedicated admin resources used?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '13. Network Monitoring and Defense', codigo: 'CIS-13', ordem: 13, peso: 10,
            controls: [
                { codigo: '13.1', titulo: 'Centralize Alerting', tipo: 'detectivo', obj: 'Alerting.', questions: [{ pergunta: 'Is alerting centralized?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.2', titulo: 'Host-Based IDS', tipo: 'detectivo', obj: 'HIDS.', questions: [{ pergunta: 'Is HIDS deployed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.3', titulo: 'Network IDS', tipo: 'detectivo', obj: 'NIDS.', questions: [{ pergunta: 'Is NIDS deployed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.4', titulo: 'Traffic Filtering', tipo: 'preventivo', obj: 'Filtering.', questions: [{ pergunta: 'Is traffic filtering performed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.5', titulo: 'Access Control Logs', tipo: 'detectivo', obj: 'Logs.', questions: [{ pergunta: 'Are access control logs collected?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.6', titulo: 'Collect Network Traffic', tipo: 'detectivo', obj: 'Traffic.', questions: [{ pergunta: 'Is network traffic collected?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.7', titulo: 'Detect Intrusion', tipo: 'detectivo', obj: 'Intrusion.', questions: [{ pergunta: 'Are intrusions detected?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.8', titulo: 'Application Layer Filtering', tipo: 'preventivo', obj: 'App Filter.', questions: [{ pergunta: 'Is app layer filtering used?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.9', titulo: 'Centralize Network Logs', tipo: 'detectivo', obj: 'Logs.', questions: [{ pergunta: 'Are network logs centralized?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.10', titulo: 'Tune IDS', tipo: 'detectivo', obj: 'Tuning.', questions: [{ pergunta: 'Is IDS tuned?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.11', titulo: 'Tune Alerting', tipo: 'detectivo', obj: 'Tuning.', questions: [{ pergunta: 'Is alerting tuned?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '14. Security Awareness and Skills Training', codigo: 'CIS-14', ordem: 14, peso: 10,
            controls: [
                { codigo: '14.1', titulo: 'Awareness Program', tipo: 'preventivo', obj: 'Program.', questions: [{ pergunta: 'Is an awareness program maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.2', titulo: 'Social Engineering', tipo: 'preventivo', obj: 'Social.', questions: [{ pergunta: 'Is workforce trained on social engineering?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.3', titulo: 'Auth Best Practices', tipo: 'preventivo', obj: 'Auth.', questions: [{ pergunta: 'Is workforce trained on authentication?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.4', titulo: 'Data Handling', tipo: 'preventivo', obj: 'Data.', questions: [{ pergunta: 'Is workforce trained on data handling?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.5', titulo: 'Incident Reporting', tipo: 'preventivo', obj: 'Reporting.', questions: [{ pergunta: 'Is workforce trained on incident reporting?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.6', titulo: 'If You See Something', tipo: 'preventivo', obj: 'Reporting.', questions: [{ pergunta: 'Is reporting encouraged?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.7', titulo: 'Remote Work', tipo: 'preventivo', obj: 'Remote.', questions: [{ pergunta: 'Is workforce trained on remote work?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.8', titulo: 'Role-Based Training', tipo: 'preventivo', obj: 'Roles.', questions: [{ pergunta: 'Is role-specific training provided?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.9', titulo: 'Security Skills', tipo: 'preventivo', obj: 'Skills.', questions: [{ pergunta: 'Are security skills trained?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '15. Service Provider Management', codigo: 'CIS-15', ordem: 15, peso: 10,
            controls: [
                { codigo: '15.1', titulo: 'Provider Inventory', tipo: 'preventivo', obj: 'Inventory.', questions: [{ pergunta: 'Is a provider inventory maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '15.2', titulo: 'Provider Policy', tipo: 'preventivo', obj: 'Policy.', questions: [{ pergunta: 'Is a provider policy maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '15.3', titulo: 'Classify Providers', tipo: 'preventivo', obj: 'Classify.', questions: [{ pergunta: 'Are providers classified?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '15.4', titulo: 'Contracts', tipo: 'preventivo', obj: 'Contracts.', questions: [{ pergunta: 'Do contracts include security?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '15.5', titulo: 'Assess Providers', tipo: 'detectivo', obj: 'Assess.', questions: [{ pergunta: 'Are providers assessed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '15.6', titulo: 'Monitor Providers', tipo: 'detectivo', obj: 'Monitor.', questions: [{ pergunta: 'Are providers monitored?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '15.7', titulo: 'Decommission Providers', tipo: 'preventivo', obj: 'Decommission.', questions: [{ pergunta: 'Are providers decommissioned securely?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '16. Application Software Security', codigo: 'CIS-16', ordem: 16, peso: 10,
            controls: [
                { codigo: '16.1', titulo: 'Secure SDLC', tipo: 'preventivo', obj: 'Process.', questions: [{ pergunta: 'Is a secure SDLC maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.2', titulo: 'Vuln Acceptance', tipo: 'preventivo', obj: 'Process.', questions: [{ pergunta: 'Is a vuln acceptance process maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.3', titulo: 'Risk Assessment', tipo: 'detectivo', obj: 'Risk.', questions: [{ pergunta: 'Is risk assessment performed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.4', titulo: 'Secure Design', tipo: 'preventivo', obj: 'Design.', questions: [{ pergunta: 'Is secure design used?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.5', titulo: 'Secure Coding', tipo: 'preventivo', obj: 'Coding.', questions: [{ pergunta: 'Is secure coding enforced?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.6', titulo: 'Static Analysis', tipo: 'detectivo', obj: 'SAST.', questions: [{ pergunta: 'Is SAST used?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.7', titulo: 'Dynamic Analysis', tipo: 'detectivo', obj: 'DAST.', questions: [{ pergunta: 'Is DAST used?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.8', titulo: 'Hardening', tipo: 'preventivo', obj: 'Hardening.', questions: [{ pergunta: 'Is application hardening performed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.9', titulo: 'Train Developers', tipo: 'preventivo', obj: 'Training.', questions: [{ pergunta: 'Are developers trained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.10', titulo: 'Component Inventory', tipo: 'preventivo', obj: 'SCA.', questions: [{ pergunta: 'Is component inventory maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.11', titulo: 'Security Testing', tipo: 'detectivo', obj: 'Testing.', questions: [{ pergunta: 'Is security testing performed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.12', titulo: 'Bug Bounty', tipo: 'detectivo', obj: 'Bounty.', questions: [{ pergunta: 'Is a bug bounty program in place?', tipo: 'sim_nao', evidencia: false }] },
                { codigo: '16.13', titulo: 'Penetration Testing', tipo: 'detectivo', obj: 'Pentest.', questions: [{ pergunta: 'Is application pentesting performed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.14', titulo: 'Root Cause Analysis', tipo: 'corretivo', obj: 'RCA.', questions: [{ pergunta: 'Is RCA performed for vulnerabilities?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '17. Incident Response Management', codigo: 'CIS-17', ordem: 17, peso: 10,
            controls: [
                { codigo: '17.1', titulo: 'Designate Personnel', tipo: 'preventivo', obj: 'Role.', questions: [{ pergunta: 'Are personnel designated?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.2', titulo: 'Contact Info', tipo: 'preventivo', obj: 'Info.', questions: [{ pergunta: 'Is contact info maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.3', titulo: 'Reporting Process', tipo: 'preventivo', obj: 'Report.', questions: [{ pergunta: 'Is a reporting process maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.4', titulo: 'IR Process', tipo: 'preventivo', obj: 'IR.', questions: [{ pergunta: 'Is an IR process maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.5', titulo: 'Role Definition', tipo: 'preventivo', obj: 'Roles.', questions: [{ pergunta: 'Are IR roles defined?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.6', titulo: 'Communication', tipo: 'preventivo', obj: 'Comms.', questions: [{ pergunta: 'Is communication planned?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.7', titulo: 'Exercises', tipo: 'detectivo', obj: 'Test.', questions: [{ pergunta: 'Are IR exercises performed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.8', titulo: 'Lessons Learned', tipo: 'preventivo', obj: 'Review.', questions: [{ pergunta: 'Are lessons learned conducted?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.9', titulo: 'Thresholds', tipo: 'preventivo', obj: 'Threshold.', questions: [{ pergunta: 'Are IR thresholds defined?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '18. Penetration Testing', codigo: 'CIS-18', ordem: 18, peso: 10,
            controls: [
                { codigo: '18.1', titulo: 'Pentest Program', tipo: 'preventivo', obj: 'Program.', questions: [{ pergunta: 'Is a pentest program maintained?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '18.2', titulo: 'External Pentest', tipo: 'detectivo', obj: 'External.', questions: [{ pergunta: 'Are external pentests performed?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '18.3', titulo: 'Remediate Findings', tipo: 'corretivo', obj: 'Remediation.', questions: [{ pergunta: 'Are findings remediated?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '18.4', titulo: 'Validate Measures', tipo: 'detectivo', obj: 'Validation.', questions: [{ pergunta: 'Are measures validated?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '18.5', titulo: 'Internal Pentest', tipo: 'detectivo', obj: 'Internal.', questions: [{ pergunta: 'Are internal pentests performed?', tipo: 'sim_nao', evidencia: true }] }
            ]
        }
    ]
};

async function seedCIS() {
    console.log("🚀 Seeding CIS Controls v8 (18 Controls, 153 Safeguards)...");
    const TENANT_ID = '46b1c048-85a1-423b-96fc-776007c8de1f';
    const db = new DatabaseManager();
    if (!await db.connect()) return;
    const client = db.client;

    try {
        const fw = CIS_DATA;
        // 1. Force Clean
        const getFw = await client.query("SELECT id FROM assessment_frameworks WHERE tenant_id = $1 AND codigo = $2 AND is_standard = true", [TENANT_ID, fw.data.codigo]);
        if (getFw.rows.length > 0) {
            const fid = getFw.rows[0].id;
            console.log("  🗑️ Cleaning existing CIS...");
            const doms = await client.query("SELECT id FROM assessment_domains WHERE framework_id = $1", [fid]);
            const domIds = doms.rows.map(d => d.id);
            if (domIds.length > 0) {
                const ctrls = await client.query("SELECT id FROM assessment_controls WHERE domain_id = ANY($1)", [domIds]);
                const ctrlIds = ctrls.rows.map(c => c.id);
                if (ctrlIds.length > 0) {
                    await client.query("DELETE FROM assessment_questions WHERE control_id = ANY($1)", [ctrlIds]);
                    await client.query("DELETE FROM assessment_controls WHERE domain_id = ANY($1)", [domIds]);
                }
                await client.query("DELETE FROM assessment_domains WHERE framework_id = $1", [fid]);
            }
            await client.query("DELETE FROM assessment_frameworks WHERE id = $1", [fid]);
        }

        // 2. Insert
        const fwRes = await client.query(
            `INSERT INTO assessment_frameworks (tenant_id, nome, codigo, descricao, versao, tipo_framework, categoria, is_standard, publico, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [TENANT_ID, fw.data.nome, fw.data.codigo, fw.data.descricao, fw.data.versao, fw.data.tipo_framework, fw.data.categoria, true, true, 'ativo']
        );
        const fwId = fwRes.rows[0].id;

        for (const d of fw.domains) {
            const dRes = await client.query(
                `INSERT INTO assessment_domains (framework_id, nome, codigo, descricao, ordem, peso, tenant_id, ativo)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [fwId, d.nome, d.codigo, 'Control Domain: ' + d.nome, d.ordem, d.peso, TENANT_ID, true]
            );
            const dId = dRes.rows[0].id;

            let controlOrder = 1;
            for (const c of d.controls) {
                const cRes = await client.query(
                    `INSERT INTO assessment_controls (domain_id, framework_id, codigo, titulo, descricao, objetivo, tipo_controle, criticidade, peso, ordem, tenant_id, ativo)
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
                    [dId, fwId, c.codigo, c.titulo, c.titulo, c.obj, c.tipo, 'alta', 10, controlOrder++, TENANT_ID, true]
                );
                const cId = cRes.rows[0].id;
                for (const q of c.questions) {
                    await client.query(
                        `INSERT INTO assessment_questions (control_id, texto, tipo_pergunta, evidencias_requeridas, opcoes_resposta, peso, ordem, tenant_id, codigo, ativa)
                          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                        [cId, q.pergunta, q.tipo, q.evidencia, q.opcoes ? JSON.stringify(q.opcoes) : null, 1, 1, TENANT_ID, c.codigo + '-Q', true]
                    );
                }
            }
        }
        console.log("🎉 CIS v8 seeded!");
    } catch (e) { console.error(e); } finally { await db.disconnect(); }
}
seedCIS();
