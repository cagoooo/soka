import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * A wrapper around React.lazy that reloads the page if the import fails.
 * This handles the "ChunkLoadError" or "Failed to fetch dynamically imported module" errors
 * that happen when a new version is deployed and the user is still on an old session.
 */
export const lazyRetry = <T extends ComponentType<any>>(
    factory: () => Promise<{ default: T }>,
    name: string = 'Component'
): LazyExoticComponent<T> => {
    return lazy(async () => {
        try {
            return await factory();
        } catch (error: any) {
            console.error(`Lazy loading failed for ${name}:`, error);

            // Check if it's a chunk load error or similar 404 network error
            const isChunkError = error.message?.includes('Failed to fetch') ||
                error.message?.includes('ChunkLoadError') ||
                error.name === 'ChunkLoadError';

            // Check if we already retried to prevent infinite loops
            const hasRetried = window.sessionStorage.getItem(`retry-${name}`);

            if (isChunkError && !hasRetried) {
                console.log(`Reloading page to recover from missing chunk for ${name}...`);
                window.sessionStorage.setItem(`retry-${name}`, 'true');
                window.location.reload();
                // Return a promise that never resolves (waiting for reload)
                return new Promise(() => { });
            }

            // If already retried or generic error, rethrow
            throw error;
        }
    });
};
