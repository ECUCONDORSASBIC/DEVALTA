export declare function useMediaQuery(query: string): boolean;
export declare const useIsMobile: () => boolean;
export declare const useIsTablet: () => boolean;
export declare const useIsDesktop: () => boolean;
export declare const useIsLargeDesktop: () => boolean;
export declare const useIsExtraLargeDesktop: () => boolean;
export declare const useIsPortrait: () => boolean;
export declare const useIsLandscape: () => boolean;
export declare const useSupportsHover: () => boolean;
export declare const useSupportsTouch: () => boolean;
export declare const usePrefersReducedMotion: () => boolean;
export declare const usePrefersDarkMode: () => boolean;
export declare const usePrefersLightMode: () => boolean;
export declare const useIsHighDPI: () => boolean;
export declare const useIsRetina: () => boolean;
export declare const useIsPrint: () => boolean;
export declare const useBreakpoint: () => "large" | "mobile" | "tablet" | "desktop" | "xl" | "unknown";
export declare function useResponsiveValue<T>(values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    large?: T;
    xl?: T;
}, defaultValue: T): T;
export declare function useViewportSize(): {
    width: number;
    height: number;
};
export declare function useScreenSize(): {
    width: number;
    height: number;
};
export declare function useDeviceInfo(): {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isPortrait: boolean;
    isLandscape: boolean;
    supportsHover: boolean;
    supportsTouch: boolean;
    prefersReducedMotion: boolean;
    prefersDarkMode: boolean;
    viewportSize: {
        width: number;
        height: number;
    };
    screenSize: {
        width: number;
        height: number;
    };
    breakpoint: string;
};
export declare function useConditionalRender(condition: boolean, delay?: number): boolean;
export declare function useResponsiveLayout(): {
    breakpoint: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    columns: number;
    spacing: number;
    maxWidth: string;
};
//# sourceMappingURL=useMediaQuery.d.ts.map