/**
 * @fileoverview Optimized optimistic updates hook with memoization
 * @module @altamedica/hooks/api/useOptimistic
 * @description Enhanced version with better performance and error recovery
 */

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

export interface UseOptimisticOptions<T> {
  initialData?: T;
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, originalData: T) => void;
  onRetry?: (attempt: number, maxRetries: number) => void;
}

export interface OptimisticState<T> {
  data: T;
  isPending: boolean;
  isRetrying: boolean;
  retryCount: number;
  error: Error | null;
  lastUpdated: Date | null;
}

export interface OptimisticAction<T, P> {
  (currentData: T): T;
  id?: string;
  type?: string;
  metadata?: Record<string, any>;
}

export function useOptimistic<T>(
  serverData: T,
  options: UseOptimisticOptions<T> = {}
) {
  const {
    initialData,
    maxRetries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    onRetry
  } = options;

  // State management
  const [optimisticState, setOptimisticState] = useState<OptimisticState<T>>(() => ({
    data: initialData ?? serverData,
    isPending: false,
    isRetrying: false,
    retryCount: 0,
    error: null,
    lastUpdated: null
  }));

  // Refs for stable references and caching
  const pendingOperations = useRef<Map<string, any>>(new Map());
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const operationHistory = useRef<Array<{ id: string; timestamp: Date; action: string }>([]);

  // Update data when server data changes
  useEffect(() => {
    if (!optimisticState.isPending) {
      setOptimisticState(prev => ({
        ...prev,
        data: serverData,
        error: null,
        lastUpdated: new Date()
      }));
    }
  }, [serverData, optimisticState.isPending]);

  // Memoized operation ID generator
  const generateOperationId = useCallback(() => {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Memoized retry logic
  const executeWithRetry = useCallback(async <P>(
    operationId: string,
    asyncOperation: () => Promise<P>,
    onRetryComplete: (success: boolean, result?: P, error?: Error) => void
  ) => {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const result = await asyncOperation();
        onRetryComplete(true, result);
        return result;
      } catch (error) {
        attempt++;
        
        if (attempt >= maxRetries) {
          onRetryComplete(false, undefined, error as Error);
          throw error;
        }
        
        // Update retry state
        setOptimisticState(prev => ({
          ...prev,
          isRetrying: true,
          retryCount: attempt
        }));
        
        onRetry?.(attempt, maxRetries);
        
        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => {
          const timeout = setTimeout(resolve, delay);
          retryTimeouts.current.set(operationId, timeout);
        });
        
        retryTimeouts.current.delete(operationId);
      }
    }
  }, [maxRetries, retryDelay, onRetry]);

  // Main optimistic update function
  const addOptimistic = useCallback(async <P>(
    action: OptimisticAction<T, P>,
    asyncOperation: () => Promise<P>,
    operationOptions?: {
      skipOptimisticUpdate?: boolean;
      rollbackOnError?: boolean;
      persistOnError?: boolean;
    }
  ): Promise<P> => {
    const operationId = generateOperationId();
    const originalData = optimisticState.data;
    const {
      skipOptimisticUpdate = false,
      rollbackOnError = true,
      persistOnError = false
    } = operationOptions || {};

    // Apply optimistic update immediately if not skipped
    let newData = originalData;
    if (!skipOptimisticUpdate) {
      try {
        newData = action(originalData);
        setOptimisticState(prev => ({
          ...prev,
          data: newData,
          isPending: true,
          error: null,
          retryCount: 0
        }));
      } catch (optimisticError) {
        console.warn('Optimistic update failed:', optimisticError);
        // Continue with original data
      }
    } else {
      setOptimisticState(prev => ({
        ...prev,
        isPending: true,
        error: null,
        retryCount: 0
      }));
    }

    // Store pending operation
    pendingOperations.current.set(operationId, {
      action,
      originalData,
      newData,
      timestamp: new Date(),
      type: action.type || 'unknown'
    });

    // Add to operation history
    operationHistory.current.push({
      id: operationId,
      timestamp: new Date(),
      action: action.type || 'optimistic_update'
    });

    // Keep history to last 50 operations
    if (operationHistory.current.length > 50) {
      operationHistory.current = operationHistory.current.slice(-50);
    }

    try {
      const result = await executeWithRetry(
        operationId,
        asyncOperation,
        (success, result, error) => {
          if (success) {
            setOptimisticState(prev => ({
              ...prev,
              isPending: false,
              isRetrying: false,
              retryCount: 0,
              error: null,
              lastUpdated: new Date()
            }));
            onSuccess?.(newData);
          } else {
            const shouldRollback = rollbackOnError && !persistOnError;
            
            setOptimisticState(prev => ({
              ...prev,
              data: shouldRollback ? originalData : prev.data,
              isPending: false,
              isRetrying: false,
              error: error || null,
              lastUpdated: new Date()
            }));
            
            onError?.(error || new Error('Unknown error'), originalData);
          }
        }
      );

      pendingOperations.current.delete(operationId);
      return result;
    } catch (error) {
      pendingOperations.current.delete(operationId);
      throw error;
    }
  }, [optimisticState.data, generateOperationId, executeWithRetry, onSuccess, onError]);

  // Batch multiple optimistic updates
  const addOptimisticBatch = useCallback(async <P>(
    operations: Array<{
      action: OptimisticAction<T, P>;
      asyncOperation: () => Promise<P>;
      options?: any;
    }>
  ): Promise<P[]> => {
    const batchId = generateOperationId();
    const originalData = optimisticState.data;
    
    // Apply all optimistic updates
    let currentData = originalData;
    const reversalActions: Array<() => void> = [];
    
    operations.forEach((op, index) => {
      try {
        const previousData = currentData;
        currentData = op.action(currentData);
        reversalActions.push(() => {
          currentData = previousData;
        });
      } catch (error) {
        console.warn(`Batch operation ${index} failed:`, error);
      }
    });

    setOptimisticState(prev => ({
      ...prev,
      data: currentData,
      isPending: true,
      error: null,
      retryCount: 0
    }));

    try {
      const results = await Promise.all(
        operations.map((op, index) =>
          executeWithRetry(
            `${batchId}_${index}`,
            op.asyncOperation,
            () => {} // Individual completion handled by batch
          )
        )
      );

      setOptimisticState(prev => ({
        ...prev,
        isPending: false,
        isRetrying: false,
        retryCount: 0,
        error: null,
        lastUpdated: new Date()
      }));

      return results;
    } catch (error) {
      // Revert all optimistic updates on batch failure
      setOptimisticState(prev => ({
        ...prev,
        data: originalData,
        isPending: false,
        isRetrying: false,
        error: error as Error,
        lastUpdated: new Date()
      }));
      
      throw error;
    }
  }, [optimisticState.data, generateOperationId, executeWithRetry]);

  // Cancel pending operations
  const cancelPendingOperations = useCallback(() => {
    // Clear all timeouts
    retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
    retryTimeouts.current.clear();
    
    // Clear pending operations
    pendingOperations.current.clear();
    
    // Reset state
    setOptimisticState(prev => ({
      ...prev,
      data: serverData,
      isPending: false,
      isRetrying: false,
      retryCount: 0,
      error: null,
      lastUpdated: new Date()
    }));
  }, [serverData]);

  // Get operation metrics
  const getMetrics = useCallback(() => ({
    pendingCount: pendingOperations.current.size,
    historyCount: operationHistory.current.length,
    lastOperation: operationHistory.current[operationHistory.current.length - 1],
    isHealthy: !optimisticState.error && optimisticState.retryCount < 2
  }), [optimisticState.error, optimisticState.retryCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      retryTimeouts.current.clear();
    };
  }, []);

  // Return memoized interface
  return useMemo(() => ({
    // Current state
    data: optimisticState.data,
    isPending: optimisticState.isPending,
    isRetrying: optimisticState.isRetrying,
    error: optimisticState.error,
    retryCount: optimisticState.retryCount,
    lastUpdated: optimisticState.lastUpdated,
    
    // Actions
    addOptimistic,
    addOptimisticBatch,
    cancelPendingOperations,
    
    // Utilities
    getMetrics,
    
    // State checks
    hasError: !!optimisticState.error,
    isStale: optimisticState.data !== serverData && !optimisticState.isPending,
    hasPendingOperations: pendingOperations.current.size > 0
  }), [
    optimisticState,
    serverData,
    addOptimistic,
    addOptimisticBatch,
    cancelPendingOperations,
    getMetrics
  ]);
}

// Hook for optimistic list operations
export function useOptimisticList<T extends { id: string | number }>(
  serverList: T[],
  options: UseOptimisticOptions<T[]> = {}
) {
  const optimistic = useOptimistic(serverList, options);

  // Memoized list operations
  const listOperations = useMemo(() => ({
    add: (item: T, asyncOperation: () => Promise<T>) =>
      optimistic.addOptimistic(
        (list) => [...list, item],
        asyncOperation
      ),
    
    update: (id: string | number, updates: Partial<T>, asyncOperation: () => Promise<T>) =>
      optimistic.addOptimistic(
        (list) => list.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ),
        asyncOperation
      ),
    
    remove: (id: string | number, asyncOperation: () => Promise<void>) =>
      optimistic.addOptimistic(
        (list) => list.filter(item => item.id !== id),
        asyncOperation
      ),
    
    reorder: (fromIndex: number, toIndex: number, asyncOperation: () => Promise<T[]>) =>
      optimistic.addOptimistic(
        (list) => {
          const newList = [...list];
          const [removed] = newList.splice(fromIndex, 1);
          newList.splice(toIndex, 0, removed);
          return newList;
        },
        asyncOperation
      )
  }), [optimistic]);

  return {
    ...optimistic,
    ...listOperations
  };
}