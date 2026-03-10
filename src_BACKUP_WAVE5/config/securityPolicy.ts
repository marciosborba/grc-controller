
export const securityPolicy = {
    password: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventReuse: true,
        accountLockout: true,
        maxAgeDays: 90
    },
    session: {
        timeoutMinutes: 60,
        mfaRequired: true,
        maxConcurrentSessions: 3
    },
    logging: {
        retentionDays: 365,
        detailedAudit: true
    }
};
