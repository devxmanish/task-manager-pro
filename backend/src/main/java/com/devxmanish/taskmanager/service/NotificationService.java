package com.devxmanish.taskmanager.service;

import com.devxmanish.taskmanager.entity.Notification;
import com.devxmanish.taskmanager.entity.User;
import com.devxmanish.taskmanager.entity.enums.NotificationType;
import com.devxmanish.taskmanager.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepo,
                                SimpMessagingTemplate messagingTemplate) {
        this.notificationRepo = notificationRepo;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Creates notification in DB and pushes it via WebSocket
     */
    public void sendNotification(User recipient, NotificationType type,
                                  String message, Long referenceId) {
        // save to DB
        Notification notification = Notification.builder()
                .user(recipient)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .build();
        notification = notificationRepo.save(notification);

        // push via WebSocket to /topic/notifications/{userId}
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", notification.getId());
        payload.put("type", type.name());
        payload.put("message", message);
        payload.put("referenceId", referenceId);
        payload.put("isRead", false);
        payload.put("createdAt", notification.getCreatedAt());

        messagingTemplate.convertAndSend(
                "/topic/notifications/" + recipient.getId(), payload);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepo.countByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(Long notificationId) {
        notificationRepo.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepo.save(n);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepo.saveAll(notifications);
    }
}
