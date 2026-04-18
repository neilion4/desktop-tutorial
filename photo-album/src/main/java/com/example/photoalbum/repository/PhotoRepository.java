package com.example.photoalbum.repository;

import com.example.photoalbum.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findAllByOrderByCreatedAtDesc();
}
