export declare function useDebounce<T>(value: T, delay: number): T;
export declare function useDebounceCallback<T extends (...args: any[]) => any>(callback: T, delay: number): T;
export declare function useDebounceSearch(initialValue?: string, delay?: number): [string, string, (value: string) => void];
export declare function useDebounceScroll(delay?: number): [number, (value: number) => void];
export declare function useDebounceResize(delay?: number): [
    {
        width: number;
        height: number;
    },
    (dimensions: {
        width: number;
        height: number;
    }) => void
];
export declare function useDebounceApiCall<T>(apiCall: (params: any) => Promise<T>, delay?: number): [(params: any) => void, T | null, boolean, string | null];
export declare function useDebounceForm<T extends Record<string, any>>(initialValues: T, delay?: number): [T, T, (values: Partial<T>) => void, () => void];
export declare function useDebounceValidation<T>(validator: (value: T) => string | null, delay?: number): [(value: T) => void, string | null, boolean];
export declare function useDebounceAutoSave<T>(saveFunction: (data: T) => Promise<void>, delay?: number): [(data: T) => void, boolean, string | null];
//# sourceMappingURL=useDebounce.d.ts.map