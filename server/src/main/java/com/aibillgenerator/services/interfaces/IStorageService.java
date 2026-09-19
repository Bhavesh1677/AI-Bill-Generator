package com.aibillgenerator.services.interfaces;

import org.springframework.web.multipart.MultipartFile;

public interface IStorageService {
    String store(MultipartFile file);
}
