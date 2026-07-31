package com.fita.vnua.quiz.model.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(max = 255, message = "Họ tên không được vượt quá 255 ký tự")
    private String fullName;
    @Email(message = "Email không hợp lệ")
    @Size(max = 255, message = "Email không được vượt quá 255 ký tự")
    private String email;
    @Size(max = 1000, message = "Đường dẫn ảnh đại diện không được vượt quá 1000 ký tự")
    private String avatarUrl;
    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    @Pattern(regexp = "^$|^[0-9+()\\-\\s]+$", message = "Số điện thoại không hợp lệ")
    private String phone;
    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    private String address;
}
