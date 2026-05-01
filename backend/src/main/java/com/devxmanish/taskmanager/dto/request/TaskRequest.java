package com.devxmanish.taskmanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    @Size(min = 2, max = 300, message = "Title must be between 2 and 300 characters")
    private String title;

    private String description;

    private Long assignedTo;

    private String status;    // TODO, IN_PROGRESS, IN_REVIEW, DONE

    private String priority;  // LOW, MEDIUM, HIGH, URGENT

    private LocalDate dueDate;
}
