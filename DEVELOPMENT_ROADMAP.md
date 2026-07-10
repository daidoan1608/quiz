# Quiz Project - Development Roadmap

## Current baseline

Backend has been refactored toward layered architecture:

- Controllers should only handle HTTP input/output and call service layer.
- Repository access from controllers has been removed from the audited controller package.
- Google Drive avatar upload has been removed from the active storage flow.
- Avatar/image storage is oriented around `ImageStorage` with local/cloud provider implementations.

## Priority 1: Backend architecture cleanup

### Goals

- Keep controllers thin.
- Move business rules into services.
- Keep persistence access inside service/infrastructure layer.
- Standardize API response and exception behavior.

### Actions

1. Audit all controllers for:
   - Direct repository usage.
   - Business logic blocks.
   - Repeated try/catch.
   - Entity construction that belongs in services.
2. Audit all services for:
   - Duplicate mapping logic.
   - Broad `RuntimeException` usage.
   - Missing `@Transactional` boundaries.
3. Replace broad runtime errors with meaningful exceptions:
   - `NotFoundException` or `CustomApiException(..., HttpStatus.NOT_FOUND)`.
   - `BadRequestException` or `CustomApiException(..., HttpStatus.BAD_REQUEST)`.
   - `UnauthorizedException` or `CustomApiException(..., HttpStatus.UNAUTHORIZED)`.
   - `ForbiddenException` or `CustomApiException(..., HttpStatus.FORBIDDEN)`.
4. Avoid returning entity objects directly from API responses where DTOs are more appropriate.

## Priority 2: Storage/config cleanup

### Goals

- Remove stale Google Drive code/config completely.
- Keep storage provider switchable by configuration.
- Make local dev and production behavior explicit.

### Actions

1. Remove placeholder files if no longer referenced:
   - `server/src/main/java/com/fita/vnua/quiz/configuration/GoogleDriveConfig.java`
   - `server/src/main/java/com/fita/vnua/quiz/service/impl/GDriveAvatarService.java`
2. Confirm there are no Google Drive dependencies in `server/pom.xml`.
3. Confirm `.env`, `.env.example`, `application*.properties`, and `docker-compose.yml` do not expose unused Google Drive variables.
4. Keep these current storage settings documented:
   - `avatar.upload-dir`
   - `question.upload-dir`
   - `cloudinary.enabled`
   - `cloudinary.cloud-name`
   - `cloudinary.api-key`
   - `cloudinary.api-secret`
   - `cloudinary.folder`

## Priority 3: Auth/security hardening

### Goals

- Keep authentication flows explicit and secure.
- Make token/session behavior predictable.
- Reduce security-sensitive logic in controllers.

### Actions

1. Further thin `AuthController` by moving register auto-login and Google-login orchestration into service/facade if needed.
2. Add refresh-token lifecycle improvements:
   - Revoke token on logout.
   - Optional logout-all-devices.
   - Cleanup expired tokens.
   - Track device/session metadata if needed.
3. Review cookie settings:
   - `HttpOnly`
   - `Secure`
   - `SameSite`
   - path/domain per environment.
4. Add rate limiting or throttling for:
   - login
   - forgot password
   - OTP verify/resend
5. Recheck role/permission annotations on admin/mod/user endpoints.

## Priority 4: Core quiz features

### Goals

- Improve learning experience.
- Make exam/question management easier for admin/mod.

### Actions

1. Exam experience:
   - Resume unfinished exam.
   - Review submitted exam.
   - Show answer explanations.
   - Randomize questions by subject/chapter/difficulty.
2. Question bank:
   - Import questions from Excel/CSV.
   - Export question bank.
   - Tag questions.
   - Difficulty normalization.
   - Review/approval flow for moderator-created content.
3. Statistics:
   - Score trends per user.
   - Accuracy by subject/chapter.
   - Most missed questions.
   - Admin dashboard metrics.
4. Notifications:
   - Real-time delivery using WebSocket or SSE.
   - Better filtering and read/unread management.
   - Notifications for new exams, role updates, and result availability.

## Priority 5: Testing and delivery

### Goals

- Prevent regression during refactor.
- Make deployment repeatable.

### Actions

1. Backend tests:
   - Auth service and controller integration.
   - Permission service.
   - Question/exam service.
   - Avatar storage service.
2. Frontend/admin smoke tests:
   - Login/register/logout.
   - Refresh-token flow.
   - Protected route behavior.
   - Quiz taking flow.
3. CI/CD:
   - Backend compile/test.
   - Frontend/admin build.
   - Docker image build validation.
4. Deployment:
   - Health checks.
   - Environment variable documentation.
   - Database migration strategy using Flyway or Liquibase.

## Suggested immediate sprint

### Sprint 1: Stabilization

- Remove stale Google Drive placeholders if safe.
- Replace high-priority `RuntimeException` cases in service layer.
- Ensure all controllers remain repository-free.
- Build backend.
- Update README/env documentation.

### Sprint 2: Security

- Harden auth cookie config.
- Add refresh-token cleanup/revoke improvements.
- Review endpoint permissions.
- Add OTP/login throttling.

### Sprint 3: Product features

- Add exam review flow.
- Add question import/export improvements.
- Add dashboard statistics.

### Sprint 4: Production readiness

- Add tests.
- Add CI/CD.
- Finalize deployment documentation.
