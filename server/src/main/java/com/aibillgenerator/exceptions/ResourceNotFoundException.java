package com.aibillgenerator.exceptions;

public class ResourceNotFoundException extends ApiError {
    public ResourceNotFoundException(String message) {
        super(404, message);
    }
}
