package com.fita.vnua.quiz.configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.ArraySchema;
import io.swagger.v3.oas.models.media.IntegerSchema;
import io.swagger.v3.oas.models.media.ObjectSchema;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Profile("dev")
public class SwaggerConfig implements WebMvcConfigurer {

    // Swagger Config để hỗ trợ Bearer Token
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("VNUA Quiz API")
                        .version("1.0")
                        .description("API documentation for VNUA Quiz application. Error responses use RFC 9457 Problem Details (`application/problem+json`)."))
                .components(new Components()
                        .addSchemas("ProblemDetails", problemDetailsSchema())
                        .addResponses("ProblemDetails400", problemDetailsResponse("Request không hợp lệ"))
                        .addResponses("ProblemDetails401", problemDetailsResponse("Chưa xác thực"))
                        .addResponses("ProblemDetails403", problemDetailsResponse("Không có quyền truy cập"))
                        .addResponses("ProblemDetails404", problemDetailsResponse("Không tìm thấy tài nguyên"))
                        .addResponses("ProblemDetails409", problemDetailsResponse("Dữ liệu bị xung đột"))
                        .addResponses("ProblemDetails429", problemDetailsResponse("Quá nhiều request"))
                        .addResponses("ProblemDetails500", problemDetailsResponse("Lỗi hệ thống"))
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                        )
                )
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    private Schema<?> problemDetailsSchema() {
        return new ObjectSchema()
                .addProperty("type", new StringSchema().example("urn:problem:validation-error"))
                .addProperty("title", new StringSchema().example("Dữ liệu không hợp lệ"))
                .addProperty("status", new IntegerSchema().example(400))
                .addProperty("detail", new StringSchema().example("Dữ liệu gửi lên không hợp lệ"))
                .addProperty("instance", new StringSchema().example("/api/v1/admin/subjects"))
                .addProperty("code", new StringSchema().example("VALIDATION_ERROR"))
                .addProperty("errors", new ObjectSchema()
                        .additionalProperties(new ArraySchema().items(new StringSchema()))
                        .example(java.util.Map.of("name", java.util.List.of("Tên không được để trống"))))
                .addProperty("timestamp", new StringSchema().example("2026-07-31T15:21:57.151481600Z"))
                .addProperty("traceId", new StringSchema().example("c927d841-5ff0-4fe3-a1c6-45a139521ee8"));
    }

    private ApiResponse problemDetailsResponse(String description) {
        return new ApiResponse()
                .description(description)
                .content(new io.swagger.v3.oas.models.media.Content()
                        .addMediaType("application/problem+json", new io.swagger.v3.oas.models.media.MediaType()
                                .schema(new Schema<>().$ref("#/components/schemas/ProblemDetails"))));
    }
}
