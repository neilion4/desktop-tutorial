package com.example.photoalbum.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "photos")
@Getter @Setter @NoArgsConstructor
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private String originalFilename;
    private Long fileSize;
    private String contentType;

    @JdbcTypeCode(SqlTypes.LONG32VARBINARY)
    @Column(nullable = false)
    private byte[] imageData;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
