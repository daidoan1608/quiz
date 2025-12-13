package com.fita.vnua.quiz.controller;

import com.fita.vnua.quiz.model.dto.request.BatchNotificationRequest;
import com.fita.vnua.quiz.model.dto.request.GlobalNotificationRequest;
import com.fita.vnua.quiz.model.dto.request.PersonalNotificationRequest;
import com.fita.vnua.quiz.model.dto.request.SubjectNotificationRequest;
import com.fita.vnua.quiz.model.dto.response.CampaignResponse;
import com.fita.vnua.quiz.model.dto.response.RecipientResponse;
import com.fita.vnua.quiz.repository.NotificationRepository;
import com.fita.vnua.quiz.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository; // Inject thêm cái này để xem chi tiết người nhận

    // 1. Gửi thông báo TOÀN HỆ THỐNG (VD: Bảo trì server)
    @PostMapping("/global")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ Admin mới được dùng
    public ResponseEntity<String> createGlobal(@RequestBody GlobalNotificationRequest request) {
        notificationService.sendGlobalNotification(
                request.getTitle(),
                request.getMessage()
        );
        return ResponseEntity.ok("Đã gửi thông báo toàn hệ thống!");
    }

    // 2. Gửi thông báo RIÊNG (VD: Cảnh báo sinh viên vi phạm)
    @PostMapping("/personal")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> createPersonal(@RequestBody PersonalNotificationRequest request) {
        notificationService.sendPersonalNotification(
                request.getUserId(),
                request.getTitle(),
                request.getMessage()
        );
        return ResponseEntity.ok("Đã gửi thông báo cá nhân!");
    }

    // 3. Gửi thông báo MÔN HỌC thủ công (Optional)
    // Dùng khi muốn nhắc nhở sinh viên về môn học mà không cần tạo đề thi
    @PostMapping("/subject")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<String> createSubjectManual(@RequestBody SubjectNotificationRequest request) {
        notificationService.sendSubjectNotification(
                request.getSubjectId(),
                request.getSubjectName(),
                request.getExamId() // Có thể null
        );
        return ResponseEntity.ok("Đã gửi thông báo cho nhóm môn học!");
    }

    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> createBatch(@RequestBody BatchNotificationRequest request) {
        notificationService.sendBatchNotification(
                request.getUserIds(),
                request.getTitle(),
                request.getMessage()
        );
        return ResponseEntity.ok("Đã gửi thông báo cho " + request.getUserIds().size() + " người dùng!");
    }

    @GetMapping("/campaigns")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MOD')")
    public ResponseEntity<Page<CampaignResponse>> getAllCampaigns(
            @RequestParam(required = false) String keyword,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(notificationService.getAllCampaigns(keyword, pageable));
    }

    // 6. Xem chi tiết NGƯỜI NHẬN của 1 chiến dịch
    // (Bấm vào 1 dòng lịch sử -> Ra danh sách ai đã nhận/đã đọc)
    @GetMapping("/history/{id}/recipients")
    @PreAuthorize("hasRole('ADMIN') or hasRole ('MOD')")
    public ResponseEntity<Page<RecipientResponse>> getRecipients(
            @PathVariable Long id,
            Pageable pageable) {
        // Gọi trực tiếp Repo hoặc bạn có thể wrap vào Service nếu muốn chuẩn chỉ hơn
        return ResponseEntity.ok(notificationRepository.findRecipientsByHistoryId(id, pageable));
    }

    // 7. THU HỒI thông báo (Xóa History -> Xóa hết con)
    @DeleteMapping("/history/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> recallNotification(@PathVariable Long id) {
        notificationService.deleteHistory(id);
        return ResponseEntity.ok("Đã thu hồi chiến dịch thông báo!");
    }
}