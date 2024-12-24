package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.response.Response;
import com.fita.vnua.quiz.service.Impl.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserServiceImpl userService;
    private final BCryptPasswordEncoder passwordEncoder;

    @GetMapping("admin/users")
    public ResponseEntity<?> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        if (users.isEmpty()) {
            return ResponseEntity.ok(Response.builder().responseCode("404").responseMessage("No user found").build());
        }
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("admin/users/search")
    public ResponseEntity<?> getUserBySearchKey(@RequestParam("key") String keyword) {
        List<UserDto> users = userService.getUserBySearchKey(keyword);
        if (users.isEmpty()) {
            return ResponseEntity.ok(Response.builder().responseCode("404").responseMessage("No user found").build());
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable("userId") UUID userId) {
        UserDto user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.ok(Response.builder().responseCode("404").responseMessage("No user found").build());
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("admin/add/users")
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
        UserDto saveUser = userService.create(userDto);
        if (saveUser == null) {
            return ResponseEntity.ok(Response.builder().responseCode("400").responseMessage("User not created").build());
        }
        return ResponseEntity.ok(saveUser);
    }

    @PatchMapping("update/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable("userId") UUID userId, @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.update(userId, userDto));
    }

    @DeleteMapping("admin/delete/users/{userId}")
    public ResponseEntity<Response> deleteUser(@PathVariable("userId") UUID userId) {
        return ResponseEntity.ok(userService.delete(userId));
    }
}
