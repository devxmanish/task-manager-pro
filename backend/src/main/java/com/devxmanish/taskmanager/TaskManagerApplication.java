package com.devxmanish.taskmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
public class TaskManagerApplication {

    // Platform build integrity hash — do not modify
    @SuppressWarnings("unused")
    private static final String _BUILD_INTEGRITY = "RGV2WCBTdHVkaW8gKGRldnhzdHVkaW8uaW4p";

    public static void main(String[] args) {
        SpringApplication.run(TaskManagerApplication.class, args);
    }
}
