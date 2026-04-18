package com.example.photoalbum.service;

import com.example.photoalbum.model.Photo;
import com.example.photoalbum.repository.PhotoRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class PhotoService {

    private static final int MAX_IMAGE_PX = 1200;
    private static final float JPEG_QUALITY = 0.82f;

    private final PhotoRepository photoRepository;

    public PhotoService(PhotoRepository photoRepository) {
        this.photoRepository = photoRepository;
    }

    public List<Photo> findAll() {
        return photoRepository.findAllByOrderByCreatedAtDesc();
    }

    public Photo findById(Long id) {
        return photoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Photo not found: " + id));
    }

    public Photo save(MultipartFile file, String title, String description) throws IOException {
        byte[] compressed = compressImage(file);

        String original = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo");

        Photo photo = new Photo();
        photo.setTitle(title.isBlank() ? original : title);
        photo.setDescription(description.isBlank() ? null : description);
        photo.setOriginalFilename(original);
        photo.setFileSize((long) compressed.length);
        photo.setContentType("image/jpeg");
        photo.setImageData(compressed);

        return photoRepository.save(photo);
    }

    public void delete(Long id) {
        Photo photo = findById(id);
        photoRepository.delete(photo);
    }

    private byte[] compressImage(MultipartFile file) throws IOException {
        BufferedImage original = ImageIO.read(file.getInputStream());
        if (original == null) {
            throw new IOException("이미지를 읽을 수 없습니다: " + file.getOriginalFilename());
        }

        int w = original.getWidth();
        int h = original.getHeight();

        if (w > MAX_IMAGE_PX || h > MAX_IMAGE_PX) {
            float ratio = Math.min((float) MAX_IMAGE_PX / w, (float) MAX_IMAGE_PX / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
            BufferedImage resized = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = resized.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.drawImage(original, 0, 0, w, h, null);
            g.dispose();
            original = resized;
        } else {
            // RGB 변환 (PNG 투명도 제거)
            BufferedImage rgb = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = rgb.createGraphics();
            g.drawImage(original, 0, 0, null);
            g.dispose();
            original = rgb;
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionQuality(JPEG_QUALITY);
        writer.setOutput(ImageIO.createImageOutputStream(out));
        writer.write(null, new IIOImage(original, null, null), param);
        writer.dispose();

        return out.toByteArray();
    }
}
