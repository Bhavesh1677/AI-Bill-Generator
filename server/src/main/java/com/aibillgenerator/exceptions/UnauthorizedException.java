package com.aibillgenerator.exceptions;

public class UnauthorizedException extends ApiError {
    public UnauthorizedException(String message) {
        super(401, message);
    }
}
