package com.example.photoalbum.service;

import com.example.photoalbum.model.Photo;
import com.example.photoalbum.repository.PhotoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final Path uploadDir;

    public PhotoService(PhotoRepository photoRepository,
                        @Value("${app.upload-dir:uploads}") String uploadDir) {
        this.photoRepository = photoRepository;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("업로드 디렉토리 생성 실패", e);
        }
    }

    public List<Photo> findAll() {
        return photoRepository.findAllByOrderByCreatedAtDesc();
    }

    public Photo findById(Long id) {
        return photoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Photo not found: " + id));
    }

    public Photo save(MultipartFile file, String title, String description) throws IOException {
        String original = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo");
        String ext = original.contains(".") ? original.substring(original.lastIndexOf(".")) : "";
        String stored = UUID.randomUUID() + ext;

        Files.copy(file.getInputStream(), uploadDir.resolve(stored));

        Photo photo = new Photo();
        photo.setTitle(title.isBlank() ? original : title);
        photo.setDescription(description.isBlank() ? null : description);
        photo.setFilename(stored);
        photo.setOriginalFilename(original);
        photo.setFileSize(file.getSize());
        photo.setContentType(file.getContentType());

        return photoRepository.save(photo);
    }

    public void delete(Long id) throws IOException {
        Photo photo = findById(id);
        Files.deleteIfExists(uploadDir.resolve(photo.getFilename()));
        photoRepository.delete(photo);
    }

    public Resource loadAsResource(String filename) throws IOException {
        Path filePath = uploadDir.resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() && resource.isReadable()) {
            return resource;
        }
        throw new FileNotFoundException("파일을 찾을 수 없습니다: " + filename);
    }
}
