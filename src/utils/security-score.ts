export interface SecuritySettings {
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        expiresDays: number;
        preventReuse: number;
    };
    sessionSecurity: {
        timeoutMinutes: number;
        maxConcurrentSessions: number;
        requireMFA: boolean;
        forceLogoutOnPasswordChange: boolean;
    };
    accessControl: {
        failedLoginLimit: number;
        lockoutDurationMinutes: number;
        ipWhitelisting: boolean;
        allowedIPs: string[];
        requireDeviceApproval: boolean;
        allowTrustedDevices: boolean;
    };
    monitoring: {
        logAllActivities: boolean;
        alertOnSuspicious: boolean;
        retentionDays: number;
        realTimeAlerts: boolean;
    };
}

export const defaultSecuritySettings: SecuritySettings = {
    passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiresDays: 90,
        preventReuse: 5
    },
    sessionSecurity: {
        timeoutMinutes: 30,
        maxConcurrentSessions: 3,
        requireMFA: false,
        forceLogoutOnPasswordChange: true
    },
    accessControl: {
        failedLoginLimit: 5,
        lockoutDurationMinutes: 15,
        ipWhitelisting: false,
        allowedIPs: [],
        requireDeviceApproval: false,
        allowTrustedDevices: false
    },
    monitoring: {
        logAllActivities: true,
        alertOnSuspicious: true,
        retentionDays: 365,
        realTimeAlerts: true
    }
};

export const calculateSecurityScore = (settings: SecuritySettings): number => {
    let score = 0;
    const maxScore = 100;

    // Política de senhas (30 pontos)
    if (settings.passwordPolicy.minLength >= 8) score += 5;
    if (settings.passwordPolicy.minLength >= 12) score += 5;
    if (settings.passwordPolicy.requireUppercase) score += 3;
    if (settings.passwordPolicy.requireLowercase) score += 3;
    if (settings.passwordPolicy.requireNumbers) score += 3;
    if (settings.passwordPolicy.requireSpecialChars) score += 5;
    if (settings.passwordPolicy.expiresDays <= 90) score += 3;
    if (settings.passwordPolicy.preventReuse >= 5) score += 3;

    // Segurança de sessão (25 pontos)
    if (settings.sessionSecurity.timeoutMinutes <= 30) score += 5;
    if (settings.sessionSecurity.maxConcurrentSessions <= 3) score += 5;
    if (settings.sessionSecurity.requireMFA) score += 10;
    if (settings.sessionSecurity.forceLogoutOnPasswordChange) score += 5;

    // Controle de acesso (25 pontos)
    if (settings.accessControl.failedLoginLimit <= 5) score += 5;
    if (settings.accessControl.lockoutDurationMinutes >= 15) score += 5;
    if (settings.accessControl.ipWhitelisting && settings.accessControl.allowedIPs.length > 0) score += 10;
    if (settings.accessControl.requireDeviceApproval) score += 5;

    // Monitoramento (20 pontos)
    if (settings.monitoring.logAllActivities) score += 5;
    if (settings.monitoring.alertOnSuspicious) score += 5;
    if (settings.monitoring.retentionDays >= 365) score += 5;
    if (settings.monitoring.realTimeAlerts) score += 5;

    return Math.min(score, maxScore);
};
