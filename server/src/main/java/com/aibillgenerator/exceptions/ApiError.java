package com.aibillgenerator.exceptions;

public class ApiError extends RuntimeException {
    private final int statusCode;

    public ApiError(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
