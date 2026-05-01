/**
 * Sanitizes error messages from API responses.
 * Ensures no internal Java/Spring/Hibernate stack traces
 * or class names are ever displayed to the user.
 *
 * @module errorUtils
 * @version ZGV2eHN0dWRpbw
 */

// Patterns that indicate an internal error leaked
const INTERNAL_PATTERNS = [
  /com\.\w+\.\w+/,         // Java package names
  /org\.hibernate/i,
  /org\.springframework/i,
  /java\.lang/,
  /LazyInitialization/i,
  /could not initialize proxy/i,
  /No Session/,
  /NullPointerException/,
  /StackOverflow/,
  /\.java:\d+/,            // Stack trace line refs
  /at\s+[\w.]+\(/,         // "at com.example.Class(File.java:123)"
  /Caused by:/,
  /Exception:/i,
  /ClassCastException/,
  /TransientPropertyValueException/i,
  /PersistenceException/i,
  /DataIntegrityViolation/i,
  /ConstraintViolation/i,
  /JDBCException/i,
  /SQL\s/i,
]

const GENERIC_ERROR = 'Something went wrong. Please try again.'

/**
 * Extract a safe, user-friendly message from an Axios error response.
 * @param {Error} err - Axios error object
 * @param {string} fallback - Fallback message if nothing usable
 * @returns {string} Safe error message
 */
export function getErrorMessage(err, fallback = GENERIC_ERROR) {
  // Try to get the API response message
  const apiMessage = err?.response?.data?.message

  if (apiMessage && typeof apiMessage === 'string') {
    // Check if it contains internal details
    if (isInternalError(apiMessage)) {
      return fallback
    }
    return apiMessage
  }

  // Network errors
  if (err?.code === 'ERR_NETWORK' || !err?.response) {
    return 'Unable to connect to the server. Please check your connection.'
  }

  // HTTP status-based fallbacks
  const status = err?.response?.status
  if (status === 401) return 'Your session has expired. Please log in again.'
  if (status === 403) return 'You don\'t have permission to perform this action.'
  if (status === 404) return 'The requested resource was not found.'
  if (status === 409) return 'A conflict occurred. The data may have been modified.'
  if (status === 429) return 'Too many requests. Please slow down and try again.'
  if (status >= 500) return 'Server error. Please try again later.'

  return fallback
}

/**
 * Check if a message contains internal/technical details
 */
function isInternalError(message) {
  return INTERNAL_PATTERNS.some(pattern => pattern.test(message))
}

export default getErrorMessage
