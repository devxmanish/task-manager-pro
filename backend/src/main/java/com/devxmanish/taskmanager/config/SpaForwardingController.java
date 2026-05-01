package com.devxmanish.taskmanager.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Forwards all non-API, non-static routes to index.html
 * so React Router handles them client-side.
 * This is needed in production when the SPA is served from Spring Boot.
 */
@Controller
public class SpaForwardingController {

    @RequestMapping(value = {
        "/", "/login", "/signup", "/forgot-password", "/reset-password",
        "/dashboard", "/projects", "/projects/{id}",
        "/tasks", "/notifications", "/team"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
