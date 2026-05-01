package com.devxmanish.taskmanager.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Broadcasts data-change events via WebSocket so that all connected clients
 * in the same organization can react (e.g., refetch updated data).
 *
 * Events are sent to /topic/org/{orgId}/events
 * Notifications remain user-scoped at /topic/notifications/{userId}
 */
@Service
public class WebSocketEventService {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventService.class);

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Broadcast a task-related event to all org members.
     */
    public void broadcastTaskEvent(String event, Long taskId, Long projectId, Long orgId, Long actorUserId) {
        if (orgId == null) {
            log.warn("Cannot broadcast task event {} — orgId is null", event);
            return;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("event", event);
        payload.put("taskId", taskId);
        payload.put("projectId", projectId);
        payload.put("actorUserId", actorUserId);
        payload.put("timestamp", System.currentTimeMillis());

        String destination = "/topic/org/" + orgId + "/events";
        log.info("📡 Broadcasting {} → {} (task={}, project={}, actor={})",
                event, destination, taskId, projectId, actorUserId);
        messagingTemplate.convertAndSend(destination, payload);
    }

    /**
     * Broadcast a project-related event to all org members.
     */
    public void broadcastProjectEvent(String event, Long projectId, Long orgId, Long actorUserId) {
        if (orgId == null) {
            log.warn("Cannot broadcast project event {} — orgId is null", event);
            return;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("event", event);
        payload.put("projectId", projectId);
        payload.put("actorUserId", actorUserId);
        payload.put("timestamp", System.currentTimeMillis());

        String destination = "/topic/org/" + orgId + "/events";
        log.info("📡 Broadcasting {} → {} (project={}, actor={})",
                event, destination, projectId, actorUserId);
        messagingTemplate.convertAndSend(destination, payload);
    }
}
