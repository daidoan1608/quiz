package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.model.dto.UserDto;
import com.fita.vnua.quiz.model.dto.request.UpdateProfileRequest;
import com.fita.vnua.quiz.model.entity.User;
import com.fita.vnua.quiz.repository.UserRepository;
import com.fita.vnua.quiz.service.mapper.UserMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Spy
    private UserMapper userMapper = new UserMapper();

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void updateProfileDoesNotChangeRoleOrPassword() {
        UUID userId = UUID.randomUUID();
        User existingUser = new User();
        existingUser.setUserId(userId);
        existingUser.setUsername("student");
        existingUser.setPassword("encoded-old-password");
        existingUser.setRole(User.Role.USER);
        existingUser.setFullName("Old Name");

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("New Name");
        request.setEmail("new@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(existingUser)).thenReturn(existingUser);

        UserDto updated = userService.updateProfile(userId, request);

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertThat(savedUser.getValue().getFullName()).isEqualTo("New Name");
        assertThat(savedUser.getValue().getEmail()).isEqualTo("new@example.com");
        assertThat(savedUser.getValue().getRole()).isEqualTo(User.Role.USER);
        assertThat(savedUser.getValue().getPassword()).isEqualTo("encoded-old-password");
        assertThat(updated.getRole()).isEqualTo(User.Role.USER);
    }
}
