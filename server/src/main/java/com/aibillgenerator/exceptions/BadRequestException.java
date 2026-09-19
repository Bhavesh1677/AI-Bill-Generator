package com.aibillgenerator.exceptions;

public class BadRequestException extends ApiError {
    public BadRequestException(String message) {
        super(400, message);
    }
}
