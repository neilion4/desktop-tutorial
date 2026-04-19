# Photo Album - 개발 가이드

## 기술 스택

| 항목 | 내용 |
|------|------|
| Framework | Spring Boot 3.2.5 |
| Language | Java 21 |
| Build | Maven |
| ORM | Spring Data JPA (Hibernate) |
| Security | Spring Security + OAuth2 |
| Template | Thymeleaf |
| Local DB | H2 (파일 기반) |
| 운영 DB | PostgreSQL (Railway) |
| API 문서 | Springdoc OpenAPI (Swagger) |

---

## 로컬 개발 환경

### 실행

```bash
./mvnw spring-boot:run
```

기본 포트: `http://localhost:8080`

### application.properties 주요 설정

```properties
# H2 파일 기반 DB (재시작 후에도 데이터 유지)
spring.datasource.url=jdbc:h2:file:./data/photodb

# 파일 업로드 제한
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=20MB
```

---

## H2 데이터베이스 접근 (로컬 전용)

> Railway(운영) 환경에서는 H2 콘솔이 비활성화됩니다.

### 접속 URL

```
http://localhost:8080/h2-console
```

### 접속 정보

| 항목 | 값 |
|------|-----|
| JDBC URL | `jdbc:h2:file:./data/photodb` |
| User Name | `sa` |
| Password | *(빈칸)* |

---

## API 문서 (Swagger UI)

### 접속 URL

```
http://localhost:8080/swagger-ui.html
```

### OpenAPI JSON 스펙

```
http://localhost:8080/v3/api-docs
```

Postman / Insomnia에서 위 JSON URL을 import하면 전체 API 컬렉션을 바로 사용할 수 있습니다.

---

## API 엔드포인트 목록

### 인증 (AuthController)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|----------|
| GET | `/login` | 로그인 페이지 | No |
| GET | `/register` | 회원가입 페이지 | No |
| POST | `/register` | 회원가입 처리 | No |

**POST /register 파라미터**

| 파라미터 | 설명 |
|----------|------|
| `name` | 사용자 이름 |
| `email` | 이메일 (로그인 ID) |
| `password` | 비밀번호 |

### 사진 (PhotoController)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|----------|
| GET | `/` | 사진 목록 (메인 페이지) | Yes |
| POST | `/photos` | 사진 업로드 | Yes |
| DELETE | `/photos/{id}` | 사진 삭제 | Yes |
| GET | `/photos/{id}/image` | 사진 이미지 원본 조회 | Yes |

**POST /photos 파라미터 (multipart/form-data)**

| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `file` | Yes | 이미지 파일 |
| `title` | No | 사진 제목 |
| `description` | No | 사진 설명 |

### OAuth2

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/oauth2/authorization/google` | Google 로그인 시작 |
| GET | `/oauth2/authorization/apple` | Apple 로그인 시작 |

---

## 운영 환경 (Railway)

프로파일 `railway` 활성화 시 PostgreSQL로 전환됩니다.

### 필요한 환경변수

| 변수명 | 설명 |
|--------|------|
| `PGHOST` | PostgreSQL 호스트 |
| `PGPORT` | PostgreSQL 포트 |
| `PGDATABASE` | DB 이름 |
| `PGUSER` | DB 사용자 |
| `PGPASSWORD` | DB 비밀번호 |
| `GOOGLE_CLIENT_ID` | Google OAuth2 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 클라이언트 시크릿 |
| `APPLE_CLIENT_ID` | Apple Sign-In 클라이언트 ID |
| `APPLE_CLIENT_SECRET` | Apple Sign-In 클라이언트 시크릿 |

---

## Security 허용 경로 (인증 불필요)

```
/login
/register
/css/**
/js/**
/h2-console/**   (로컬 개발용)
/swagger-ui/**
/v3/api-docs/**
/swagger-ui.html
```
