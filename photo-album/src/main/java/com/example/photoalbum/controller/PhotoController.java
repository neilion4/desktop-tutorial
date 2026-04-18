package com.example.photoalbum.controller;

import com.example.photoalbum.model.Photo;
import com.example.photoalbum.service.PhotoService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;

@Controller
public class PhotoController {

    private final PhotoService photoService;

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("photos", photoService.findAll());
        return "index";
    }

    @PostMapping("/photos")
    public String upload(@RequestParam("file") MultipartFile file,
                         @RequestParam(defaultValue = "") String title,
                         @RequestParam(defaultValue = "") String description,
                         RedirectAttributes redirectAttributes) {
        if (file.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "파일을 선택해 주세요.");
            return "redirect:/";
        }
        try {
            photoService.save(file, title, description);
        } catch (IOException e) {
            redirectAttributes.addFlashAttribute("error", "업로드 실패: " + e.getMessage());
        }
        return "redirect:/";
    }

    @DeleteMapping("/photos/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            photoService.delete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/photos/{id}/image")
    public ResponseEntity<byte[]> serveImage(@PathVariable Long id) {
        try {
            Photo photo = photoService.findById(id);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            photo.getContentType() != null ? photo.getContentType() : "image/jpeg"))
                    .body(photo.getImageData());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
