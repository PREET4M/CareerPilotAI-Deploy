/**
 * API Fetch wrapper to ensure session credentials are always included.
 */
export async function apiFetch(endpoint, options = {}) {
    const defaultHeaders = {};
    
    // Automatically set Content-Type to application/json if sending JSON body
    if (options.body && !(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
        if (typeof options.body !== 'string') {
            options.body = JSON.stringify(options.body);
        }
    }
    
    const mergedOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        },
        // CRITICAL: include credentials (cookies) for cross-port Flask sessions
        credentials: 'include'
    };
    
    const response = await fetch(endpoint, mergedOptions);
    
    if (!response.ok) {
        let errMsg = `Request failed with status ${response.status}`;
        try {
            const errJson = await response.json();
            errMsg = errJson.error || errMsg;
        } catch (_) {
            // Fallback to text if not JSON
            try {
                const errText = await response.text();
                if (errText) errMsg = errText;
            } catch (_) {}
        }
        throw new Error(errMsg);
    }
    
    // Return response directly for PDF downloads or other non-JSON endpoints
    if (options.rawResponse) {
        return response;
    }
    
    return response.json();
}
