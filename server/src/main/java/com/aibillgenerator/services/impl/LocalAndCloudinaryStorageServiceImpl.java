package com.aibillgenerator.services.impl;

import com.aibillgenerator.services.interfaces.IStorageService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class LocalAndCloudinaryStorageServiceImpl implements IStorageService {

    @Autowired(required = false)
    private Cloudinary cloudinary;

    @Value("${app.upload.dir:public/uploads/logos}")
    private String uploadDir;

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // Try uploading to Cloudinary if available
        if (cloudinary != null) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                if (uploadResult.containsKey("secure_url")) {
                    return uploadResult.get("secure_url").toString();
                } else if (uploadResult.containsKey("url")) {
                    return uploadResult.get("url").toString();
                }
            } catch (Exception e) {
                System.err.println("Cloudinary upload failed, falling back to local storage: " + e.getMessage());
            }
        }

        // Local Storage Fallback
        try {
            Path directoryPath = Paths.get(uploadDir);
            if (!Files.exists(directoryPath)) {
                Files.createDirectories(directoryPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path targetLocation = directoryPath.resolve(uniqueFilename);

            Files.copy(file.getInputStream(), targetLocation);

            return "http://localhost:8000/uploads/logos/" + uniqueFilename;
        } catch (IOException e) {
            System.err.println("Local file storage failed: " + e.getMessage());
            return null;
        }
    }
}
