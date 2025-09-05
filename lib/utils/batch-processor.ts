/**
 * Batch processor utility for handling large datasets efficiently
 * This helps prevent browser URL length limits and improves performance
 */

export class BatchProcessor {
  /**
   * Process items in batches with a callback function
   * @param items Array of items to process
   * @param batchSize Size of each batch
   * @param processor Function to process each batch
   * @returns Combined results from all batches
   */
  static async processBatches<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Process items in parallel batches with concurrency control
   * @param items Array of items to process
   * @param batchSize Size of each batch
   * @param concurrency Number of parallel batches
   * @param processor Function to process each batch
   * @returns Combined results from all batches
   */
  static async processParallelBatches<T, R>(
    items: T[],
    batchSize: number,
    concurrency: number,
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const batches: T[][] = [];

    // Create batches
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    const results: R[] = [];

    // Process batches with concurrency control
    for (let i = 0; i < batches.length; i += concurrency) {
      const currentBatches = batches.slice(i, i + concurrency);
      const batchPromises = currentBatches.map(batch => processor(batch));
      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach(result => results.push(...result));
    }

    return results;
  }

  /**
   * Chunk an array into smaller arrays
   * @param array Array to chunk
   * @param chunkSize Size of each chunk
   * @returns Array of chunks
   */
  static chunk<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }

    return chunks;
  }

  /**
   * Process paginated API calls efficiently
   * @param totalItems Total number of items to fetch
   * @param pageSize Size of each page
   * @param fetcher Function to fetch a page
   * @returns All fetched items
   */
  static async fetchPaginated<T>(
    totalItems: number,
    pageSize: number,
    fetcher: (offset: number, limit: number) => Promise<T[]>
  ): Promise<T[]> {
    const results: T[] = [];
    const totalPages = Math.ceil(totalItems / pageSize);

    for (let page = 0; page < totalPages; page++) {
      const offset = page * pageSize;
      const limit = Math.min(pageSize, totalItems - offset);
      const pageData = await fetcher(offset, limit);
      results.push(...pageData);
    }

    return results;
  }

  /**
   * Efficiently intersect multiple arrays
   * @param arrays Arrays to intersect
   * @returns Intersection of all arrays
   */
  static intersect<T>(...arrays: T[][]): T[] {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return arrays[0];

    // Convert first array to Set for efficient lookup
    let result = new Set(arrays[0]);

    // Intersect with each subsequent array
    for (let i = 1; i < arrays.length; i++) {
      const currentSet = new Set(arrays[i]);
      result = new Set([...result].filter(item => currentSet.has(item)));

      // Early exit if intersection is empty
      if (result.size === 0) break;
    }

    return Array.from(result);
  }

  /**
   * Efficiently union multiple arrays (remove duplicates)
   * @param arrays Arrays to union
   * @returns Union of all arrays
   */
  static union<T>(...arrays: T[][]): T[] {
    const result = new Set<T>();

    for (const array of arrays) {
      for (const item of array) {
        result.add(item);
      }
    }

    return Array.from(result);
  }

  /**
   * Filter array with multiple conditions efficiently
   * @param items Array to filter
   * @param conditions Filter conditions
   * @returns Filtered array
   */
  static multiFilter<T>(
    items: T[],
    conditions: Array<(item: T) => boolean>
  ): T[] {
    if (conditions.length === 0) return items;

    return items.filter(item => {
      for (const condition of conditions) {
        if (!condition(item)) return false;
      }
      return true;
    });
  }

  /**
   * Debounce function for API calls
   * @param func Function to debounce
   * @param wait Wait time in milliseconds
   * @returns Debounced function
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }

  /**
   * Throttle function for rate limiting
   * @param func Function to throttle
   * @param limit Time limit in milliseconds
   * @returns Throttled function
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * Retry failed operations with exponential backoff
   * @param operation Operation to retry
   * @param maxRetries Maximum number of retries
   * @param baseDelay Base delay in milliseconds
   * @returns Result of the operation
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Cache results with TTL
   */
  static createCache<T>(ttl: number = 60000) {
    const cache = new Map<string, { data: T; timestamp: number }>();

    return {
      get(key: string): T | null {
        const cached = cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > ttl) {
          cache.delete(key);
          return null;
        }

        return cached.data;
      },

      set(key: string, data: T): void {
        cache.set(key, { data, timestamp: Date.now() });
      },

      clear(): void {
        cache.clear();
      },

      delete(key: string): boolean {
        return cache.delete(key);
      }
    };
  }
}

export default BatchProcessor;
