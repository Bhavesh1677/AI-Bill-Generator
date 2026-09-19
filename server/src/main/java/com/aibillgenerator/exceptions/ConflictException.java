package com.aibillgenerator.exceptions;

public class ConflictException extends ApiError {
    public ConflictException(String message) {
        super(409, message);
    }
}
