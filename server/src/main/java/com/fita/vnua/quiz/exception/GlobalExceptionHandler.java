package com.fita.vnua.quiz.exception;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final ProblemDetailsFactory problemDetailsFactory;

    @ExceptionHandler(CustomApiException.class)
    public ResponseEntity<ProblemDetail> handleCustomApiException(CustomApiException ex, HttpServletRequest request) {
        return buildErrorResponse(ex.getStatus(), ex.getCode(), ex.getMessage(), List.of(ex.getMessage()), request);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleEntityNotFoundException(EntityNotFoundException ex, HttpServletRequest request) {
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                "NOT_FOUND",
                "Không tìm thấy dữ liệu phù hợp",
                List.of("Dữ liệu không tồn tại hoặc đã bị xóa"),
                request
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage(), List.of(ex.getMessage()), request);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ProblemDetail> handleIllegalStateException(IllegalStateException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage(), List.of(ex.getMessage()), request);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ProblemDetail> handleResponseStatusException(ResponseStatusException ex, HttpServletRequest request) {
        String message = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        return buildErrorResponse(ex.getStatusCode(), resolveCode(ex.getStatusCode()), message, List.of(message), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        return buildErrorResponse(
                HttpStatus.FORBIDDEN,
                "FORBIDDEN",
                "Bạn không có quyền thực hiện thao tác này",
                List.of("Quyền truy cập bị từ chối"),
                request
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ProblemDetail> handleBadCredentialsException(BadCredentialsException ex, HttpServletRequest request) {
        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "INVALID_CREDENTIALS",
                "Tên đăng nhập/email hoặc mật khẩu không đúng",
                List.of("Thông tin đăng nhập không hợp lệ"),
                request
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();
        Map<String, List<String>> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.groupingBy(
                        org.springframework.validation.FieldError::getField,
                        Collectors.mapping(error -> error.getDefaultMessage() == null ? "Không hợp lệ" : error.getDefaultMessage(), Collectors.toList())
                ));

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Dữ liệu gửi lên không hợp lệ",
                fieldErrors.isEmpty() ? errors : fieldErrors,
                request
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemDetail> handleConstraintViolationException(ConstraintViolationException ex, HttpServletRequest request) {
        List<String> errors = ex.getConstraintViolations()
                .stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .toList();
        Map<String, List<String>> fieldErrors = ex.getConstraintViolations()
                .stream()
                .collect(Collectors.groupingBy(
                        violation -> violation.getPropertyPath().toString(),
                        Collectors.mapping(jakarta.validation.ConstraintViolation::getMessage, Collectors.toList())
                ));

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Dữ liệu gửi lên không hợp lệ",
                fieldErrors.isEmpty() ? errors : fieldErrors,
                request
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ProblemDetail> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST_PARAMETER",
                "Tham số request không đúng định dạng",
                Map.of(ex.getName(), List.of("phải là " + getExpectedTypeName(ex.getRequiredType()))),
                request
        );
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ProblemDetail> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "MISSING_REQUEST_PARAMETER",
                "Thiếu tham số bắt buộc",
                Map.of(ex.getParameterName(), List.of("là bắt buộc")),
                request
        );
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ProblemDetail> handleMissingServletRequestPart(
            MissingServletRequestPartException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "MISSING_REQUEST_PART",
                "Thiếu dữ liệu multipart bắt buộc",
                Map.of(ex.getRequestPartName(), List.of("là bắt buộc")),
                request
        );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ProblemDetail> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "PAYLOAD_TOO_LARGE",
                "File tải lên vượt quá dung lượng cho phép",
                List.of("Vui lòng chọn file có dung lượng nhỏ hơn"),
                request
        );
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ProblemDetail> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "UNSUPPORTED_MEDIA_TYPE",
                "Content-Type của request không được hỗ trợ",
                List.of("Content-Type không hợp lệ: " + ex.getContentType()),
                request
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ProblemDetail> handleMessageNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        Throwable cause = ex.getMostSpecificCause();
        if (cause instanceof InvalidFormatException invalidFormatException) {
            return buildErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_REQUEST_BODY",
                    "Dữ liệu gửi lên không đúng định dạng",
                    formatInvalidValueError(invalidFormatException),
                    request
            );
        }
        if (cause instanceof MismatchedInputException mismatchedInputException) {
            String fieldPath = getJsonFieldPath(mismatchedInputException);
            String error = fieldPath.isBlank()
                    ? "Body request không đúng cấu trúc dữ liệu yêu cầu"
                    : fieldPath + " không đúng kiểu dữ liệu yêu cầu";
            return buildErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_REQUEST_BODY",
                    "Dữ liệu gửi lên không đúng định dạng",
                    fieldPath.isBlank() ? List.of(error) : Map.of(fieldPath, List.of("không đúng kiểu dữ liệu yêu cầu")),
                    request
            );
        }

        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST_BODY",
                "Dữ liệu gửi lên không đúng định dạng",
                List.of("Vui lòng kiểm tra JSON/body của request"),
                request
        );
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ProblemDetail> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request
    ) {
        log.warn("Unsupported request method: {} {}", request.getMethod(), request.getRequestURI());
        return buildErrorResponse(
                HttpStatus.METHOD_NOT_ALLOWED,
                "METHOD_NOT_ALLOWED",
                "Phương thức request không được hỗ trợ",
                List.of("Endpoint này không hỗ trợ " + request.getMethod()),
                request
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGeneralException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled backend exception", ex);
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "Hệ thống đang gặp sự cố, vui lòng thử lại sau",
                List.of("Lỗi hệ thống"),
                request
        );
    }

    private ResponseEntity<ProblemDetail> buildErrorResponse(
            HttpStatusCode status,
            String code,
            String message,
            Object errors,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(status)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problemDetailsFactory.create(status, code, resolveTitle(code, status), message, errors, request));
    }

    private String resolveTitle(String code, HttpStatusCode status) {
        return ErrorCode.fromCode(code, status).title();
    }

    private String resolveCode(HttpStatusCode status) {
        if (status.is4xxClientError()) {
            return "REQUEST_ERROR";
        }
        if (status.is5xxServerError()) {
            return "INTERNAL_SERVER_ERROR";
        }
        return "ERROR";
    }

    private Object formatInvalidValueError(InvalidFormatException ex) {
        String fieldPath = getJsonFieldPath(ex);
        String expectedType = getExpectedTypeName(ex.getTargetType());
        if (fieldPath.isBlank()) {
            return List.of("Giá trị không đúng kiểu dữ liệu yêu cầu");
        }
        return Map.of(fieldPath, List.of("phải là " + expectedType));
    }

    private String getJsonFieldPath(JsonMappingException ex) {
        return ex.getPath()
                .stream()
                .map(JsonMappingException.Reference::getFieldName)
                .filter(Objects::nonNull)
                .collect(Collectors.joining("."));
    }

    private String getExpectedTypeName(Class<?> targetType) {
        if (targetType == null) {
            return "đúng kiểu dữ liệu";
        }
        if (Long.class.equals(targetType) || Long.TYPE.equals(targetType)
                || Integer.class.equals(targetType) || Integer.TYPE.equals(targetType)
                || Short.class.equals(targetType) || Short.TYPE.equals(targetType)
                || Byte.class.equals(targetType) || Byte.TYPE.equals(targetType)) {
            return "số nguyên";
        }
        if (Double.class.equals(targetType) || Double.TYPE.equals(targetType)
                || Float.class.equals(targetType) || Float.TYPE.equals(targetType)) {
            return "số";
        }
        if (Boolean.class.equals(targetType) || Boolean.TYPE.equals(targetType)) {
            return "true/false";
        }
        return targetType.getSimpleName();
    }
}
