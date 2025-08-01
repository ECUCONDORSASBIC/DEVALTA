import { useState, useEffect, useCallback } from "react";
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}
export function useDebounceCallback(callback, delay) {
    const [debounceTimer, setDebounceTimer] = useState(null);
    const debouncedCallback = useCallback((...args) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const timer = setTimeout(() => {
            callback(...args);
        }, delay);
        setDebounceTimer(timer);
    }, [callback, delay, debounceTimer]);
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);
    return debouncedCallback;
}
export function useDebounceSearch(initialValue = "", delay = 300) {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const debouncedSearchTerm = useDebounce(searchTerm, delay);
    return [searchTerm, debouncedSearchTerm, setSearchTerm];
}
export function useDebounceScroll(delay = 100) {
    const [scrollPosition, setScrollPosition] = useState(0);
    const debouncedScrollPosition = useDebounce(scrollPosition, delay);
    return [debouncedScrollPosition, setScrollPosition];
}
export function useDebounceResize(delay = 250) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const debouncedDimensions = useDebounce(dimensions, delay);
    return [debouncedDimensions, setDimensions];
}
export function useDebounceApiCall(apiCall, delay = 500) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [debounceTimer, setDebounceTimer] = useState(null);
    const debouncedApiCall = useCallback((params) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await apiCall(params);
                setData(result);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            }
            finally {
                setLoading(false);
            }
        }, delay);
        setDebounceTimer(timer);
    }, [apiCall, delay, debounceTimer]);
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);
    return [debouncedApiCall, data, loading, error];
}
export function useDebounceForm(initialValues, delay = 300) {
    const [formValues, setFormValues] = useState(initialValues);
    const debouncedFormValues = useDebounce(formValues, delay);
    const updateForm = useCallback((values) => {
        setFormValues((prev) => ({ ...prev, ...values }));
    }, []);
    const resetForm = useCallback(() => {
        setFormValues(initialValues);
    }, [initialValues]);
    return [formValues, debouncedFormValues, updateForm, resetForm];
}
export function useDebounceValidation(validator, delay = 300) {
    const [value, setValue] = useState(null);
    const [error, setError] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);
    const validate = useCallback((newValue) => {
        setValue(newValue);
        setIsValidating(true);
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const timer = setTimeout(() => {
            const validationError = validator(newValue);
            setError(validationError);
            setIsValidating(false);
        }, delay);
        setDebounceTimer(timer);
    }, [validator, delay, debounceTimer]);
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);
    return [validate, error, isValidating];
}
export function useDebounceAutoSave(saveFunction, delay = 1000) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [debounceTimer, setDebounceTimer] = useState(null);
    const autoSave = useCallback((data) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const timer = setTimeout(async () => {
            try {
                setSaving(true);
                setError(null);
                await saveFunction(data);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "Auto-save failed");
            }
            finally {
                setSaving(false);
            }
        }, delay);
        setDebounceTimer(timer);
    }, [saveFunction, delay, debounceTimer]);
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);
    return [autoSave, saving, error];
}
//# sourceMappingURL=useDebounce.js.map