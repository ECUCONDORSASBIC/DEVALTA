// Marketplace Hooks - B2C Communication System
export * from './hooks/useCompanyProfile';
export * from './hooks/useDoctorProfile';
export * from './hooks/useDoctorSearch';
export * from './hooks/useJobApplications';
export * from './hooks/useMarketplaceAnalytics';
export * from './hooks/useMarketplaceJobs';
export * from './hooks/useMarketplaceMessaging';
export * from './hooks/useMarketplaceNotifications';

// Store exports
export * from './stores/marketplaceStore';
export * from './stores/messagingStore';

// Types
export * from './types/marketplace';
export * from './types/messaging';

// Utils
export * from './utils/marketplaceUtils';
export * from './utils/notificationUtils';

// Re-export commonly used types for convenience
export type {
    JobApplication, JobFilters,
    JobSearchParams, MarketplaceCompany,
    MarketplaceDoctor, MarketplaceJob
} from './types/marketplace';

export type {
    MarketplaceConversation, MarketplaceMessage, MessageFilters, MessageNotification
} from './types/messaging';

