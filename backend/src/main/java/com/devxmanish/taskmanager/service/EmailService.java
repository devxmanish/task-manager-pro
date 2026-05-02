package com.devxmanish.taskmanager.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final Resend resend;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(@Value("${app.resend.api-key}") String apiKey) {
        this.resend = new Resend(apiKey);
    }

    // ─── Branded HTML wrapper ───

    private String wrapInTemplate(String title, String bodyContent) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>%s</title>
            </head>
            <body style="margin:0; padding:0; background-color:#f0f2f5; font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
              <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5; padding:40px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
                      <!-- Header -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#6366f1,#a855f7); padding:32px 40px; text-align:center;">
                          <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:-0.5px;">
                            📋 %s
                          </h1>
                          <p style="margin:6px 0 0; color:rgba(255,255,255,0.85); font-size:13px; font-weight:400;">
                            Team Task Manager
                          </p>
                        </td>
                      </tr>
                      <!-- Body -->
                      <tr>
                        <td style="padding:36px 40px 16px;">
                          %s
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="padding:16px 40px 32px; text-align:center; border-top:1px solid #f0f2f5;">
                          <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.6;">
                            &copy; 2025 %s &middot; All rights reserved<br>
                            <a href="%s" style="color:#6366f1; text-decoration:none;">Visit Dashboard</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(title, fromName, bodyContent, fromName, frontendUrl);
    }

    // ─── OTP Email ───

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        String body = """
            <p style="margin:0 0 8px; color:#334155; font-size:15px; line-height:1.6;">
              Hello,
            </p>
            <p style="margin:0 0 24px; color:#475569; font-size:14px; line-height:1.6;">
              Use the verification code below to complete your sign-up. This code expires in <strong>5 minutes</strong>.
            </p>
            <div style="text-align:center; margin:0 0 24px;">
              <div style="display:inline-block; background:linear-gradient(135deg,#6366f1,#a855f7); color:#ffffff; font-size:32px; font-weight:700; letter-spacing:12px; padding:16px 32px; border-radius:12px;">
                %s
              </div>
            </div>
            <p style="margin:0; color:#94a3b8; font-size:13px; line-height:1.5; text-align:center;">
              If you didn't request this code, you can safely ignore this email.
            </p>
            """.formatted(otp);

        sendEmail(toEmail, "Email Verification — " + fromName, wrapInTemplate("Verify Your Email", body));
    }

    // ─── Password Reset Email ───

    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        String body = """
            <p style="margin:0 0 8px; color:#334155; font-size:15px; line-height:1.6;">
              Hello,
            </p>
            <p style="margin:0 0 24px; color:#475569; font-size:14px; line-height:1.6;">
              We received a request to reset your password. Click the button below to set a new one. This link is valid for <strong>15 minutes</strong> and can only be used once.
            </p>
            <div style="text-align:center; margin:0 0 24px;">
              <a href="%s" style="display:inline-block; background:linear-gradient(135deg,#6366f1,#a855f7); color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; padding:14px 36px; border-radius:10px;">
                Reset Password
              </a>
            </div>
            <p style="margin:0 0 8px; color:#94a3b8; font-size:12px; text-align:center;">
              Or copy this link:
            </p>
            <p style="margin:0; color:#6366f1; font-size:12px; word-break:break-all; text-align:center;">
              %s
            </p>
            """.formatted(resetLink, resetLink);

        sendEmail(toEmail, "Password Reset — " + fromName, wrapInTemplate("Reset Your Password", body));
    }

    // ─── Task Assignment Email ───

    @Async
    public void sendTaskAssignmentEmail(String toEmail, String taskTitle, String projectName, String assignedBy) {
        String body = """
            <p style="margin:0 0 8px; color:#334155; font-size:15px; line-height:1.6;">
              Hello,
            </p>
            <p style="margin:0 0 20px; color:#475569; font-size:14px; line-height:1.6;">
              You've been assigned a new task. Here are the details:
            </p>
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border-radius:10px; padding:4px; margin:0 0 24px;">
              <tr>
                <td style="padding:14px 20px; border-bottom:1px solid #e2e8f0;">
                  <span style="color:#94a3b8; font-size:12px; text-transform:uppercase; font-weight:600;">Task</span><br>
                  <span style="color:#1e293b; font-size:15px; font-weight:600;">%s</span>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px; border-bottom:1px solid #e2e8f0;">
                  <span style="color:#94a3b8; font-size:12px; text-transform:uppercase; font-weight:600;">Project</span><br>
                  <span style="color:#1e293b; font-size:15px;">%s</span>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;">
                  <span style="color:#94a3b8; font-size:12px; text-transform:uppercase; font-weight:600;">Assigned by</span><br>
                  <span style="color:#1e293b; font-size:15px;">%s</span>
                </td>
              </tr>
            </table>
            <div style="text-align:center;">
              <a href="%s/dashboard" style="display:inline-block; background:linear-gradient(135deg,#6366f1,#a855f7); color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; padding:14px 36px; border-radius:10px;">
                View in Dashboard
              </a>
            </div>
            """.formatted(taskTitle, projectName, assignedBy, frontendUrl);

        sendEmail(toEmail, "New Task: " + taskTitle + " — " + fromName, wrapInTemplate("New Task Assigned", body));
    }

    // ─── Send via Resend ───

    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromName + " <" + fromEmail + ">")
                    .to(to)
                    .subject(subject)
                    .html(htmlContent)
                    .build();

            resend.emails().send(params);
        } catch (ResendException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }
}
