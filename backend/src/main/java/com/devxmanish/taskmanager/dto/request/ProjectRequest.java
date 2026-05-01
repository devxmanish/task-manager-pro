package com.devxmanish.taskmanager.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
    private String name;

    private String description;
}
