package com.devxmanish.taskmanager.exception;

import com.devxmanish.taskmanager.dto.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler — ensures NO internal stack traces, class names,
 * or implementation details ever reach the frontend.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ── Application Exceptions (safe messages) ──

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse> handleBadRequest(IllegalArgumentException ex) {
        // IllegalArgumentException messages are written by us → safe to expose
        String msg = sanitizeMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(msg));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse> handleIllegalState(IllegalStateException ex) {
        String msg = sanitizeMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(msg));
    }

    // ── Validation Exceptions ──

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.builder()
                        .success(false)
                        .message("Please check your input and try again")
                        .data(errors)
                        .build());
    }

    // ── Spring / HTTP Exceptions ──

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("You don't have permission to perform this action"));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse.error("This action is not supported"));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid request format. Please check your input."));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse> handleMissingParam(MissingServletRequestParameterException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Missing required parameter: " + ex.getParameterName()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Invalid value provided for: " + ex.getName()));
    }

    // ── Database Exceptions ──

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.error("Data integrity violation: {}", ex.getMessage());

        // Check for common constraint violations
        String rootMsg = ex.getMostSpecificCause().getMessage();
        if (rootMsg != null) {
            String lower = rootMsg.toLowerCase();
            if (lower.contains("duplicate") || lower.contains("unique")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("This record already exists. Please use a different value."));
            }
            if (lower.contains("foreign key") || lower.contains("fk_")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Cannot complete this action — related data still exists."));
            }
        }

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("A data conflict occurred. Please try again."));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse> handleNoResource(NoResourceFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("The requested resource was not found"));
    }

    // ── Catch-All (NEVER leak internals) ──

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGeneric(Exception ex) {
        // Log the full stack trace for debugging
        log.error("Unhandled exception: ", ex);

        // Return a safe, generic message to the client
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Something went wrong. Please try again later."));
    }

    // ── Helper ──

    /**
     * Sanitizes exception messages to remove any internal details
     * like class names, package paths, or Hibernate proxy references.
     */
    private String sanitizeMessage(String message) {
        if (message == null) return "An error occurred";

        // If the message contains Java internals, replace with generic message
        if (message.contains("com.devxmanish") ||
            message.contains("org.hibernate") ||
            message.contains("org.springframework") ||
            message.contains("java.lang") ||
            message.contains("could not initialize proxy") ||
            message.contains("No Session") ||
            message.contains("LazyInitialization") ||
            message.contains("NullPointerException") ||
            message.contains("StackOverflow") ||
            message.contains(".java:")) {

            log.warn("Sanitized internal error message: {}", message);
            return "Something went wrong. Please try again later.";
        }

        return message;
    }
}
