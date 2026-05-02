package com.devxmanish.taskmanager.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import java.time.Year;
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
                            %s
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
                            &copy; %s %s &middot; All rights reserved<br>
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
            """.formatted(title, fromName, fromName, bodyContent, Year.now().getValue(), fromName, frontendUrl);
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

    // ─── Welcome Email ───

    @Async
    public void sendWelcomeEmail(String toEmail, String userName, String orgName) {
        String body = """
            <p style="margin:0 0 8px; color:#334155; font-size:15px; line-height:1.6;">
              Hi <strong>%s</strong>,
            </p>
            <p style="margin:0 0 20px; color:#475569; font-size:14px; line-height:1.6;">
              Welcome aboard! Your account has been created and you've been added to <strong>%s</strong>. You're all set to start collaborating with your team.
            </p>
            <div style="text-align:center; margin:0 0 24px;">
              <a href="%s/dashboard" style="display:inline-block; background:linear-gradient(135deg,#6366f1,#a855f7); color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; padding:14px 36px; border-radius:10px;">
                Go to Dashboard
              </a>
            </div>
            <p style="margin:0; color:#94a3b8; font-size:13px; line-height:1.5; text-align:center;">
              Need help getting started? Just reply to this email.
            </p>
            """.formatted(userName, orgName, frontendUrl);

        sendEmail(toEmail, "Welcome to " + orgName + " — " + fromName, wrapInTemplate("Welcome!", body));
    }

    // ─── Invite Email ───

    @Async
    public void sendInviteEmail(String toEmail, String orgName, String invitedByName, String inviteToken) {
        String joinLink = frontendUrl + "/signup?invite=" + inviteToken;

        String body = """
            <p style="margin:0 0 8px; color:#334155; font-size:15px; line-height:1.6;">
              Hello,
            </p>
            <p style="margin:0 0 20px; color:#475569; font-size:14px; line-height:1.6;">
              <strong>%s</strong> has invited you to join <strong>%s</strong> on Team Task Manager. Click the button below to accept and create your account.
            </p>
            <div style="text-align:center; margin:0 0 24px;">
              <a href="%s" style="display:inline-block; background:linear-gradient(135deg,#6366f1,#a855f7); color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; padding:14px 36px; border-radius:10px;">
                Accept Invitation
              </a>
            </div>
            <p style="margin:0 0 8px; color:#94a3b8; font-size:12px; text-align:center;">
              Or copy this link:
            </p>
            <p style="margin:0; color:#6366f1; font-size:12px; word-break:break-all; text-align:center;">
              %s
            </p>
            <p style="margin:16px 0 0; color:#94a3b8; font-size:13px; line-height:1.5; text-align:center;">
              This invitation expires in 48 hours.
            </p>
            """.formatted(invitedByName, orgName, joinLink, joinLink);

        sendEmail(toEmail, "You're invited to " + orgName + " — " + fromName, wrapInTemplate("Team Invitation", body));
    }

    // ─── Task Status Update Email ───

    @Async
    public void sendTaskStatusEmail(String toEmail, String taskTitle, String projectName, String oldStatus, String newStatus) {
        String statusColor = switch (newStatus.toUpperCase()) {
            case "DONE" -> "#22c55e";
            case "IN_PROGRESS" -> "#3b82f6";
            case "IN_REVIEW" -> "#f59e0b";
            default -> "#64748b";
        };

        String body = """
            <p style="margin:0 0 8px; color:#334155; font-size:15px; line-height:1.6;">
              Hello,
            </p>
            <p style="margin:0 0 20px; color:#475569; font-size:14px; line-height:1.6;">
              A task you're assigned to has been updated:
            </p>
            <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border-radius:10px; margin:0 0 24px;">
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
                  <span style="color:#94a3b8; font-size:12px; text-transform:uppercase; font-weight:600;">Status</span><br>
                  <span style="color:#94a3b8; font-size:14px;">%s</span>
                  <span style="color:#94a3b8; font-size:14px;"> → </span>
                  <span style="color:%s; font-size:14px; font-weight:700;">%s</span>
                </td>
              </tr>
            </table>
            <div style="text-align:center;">
              <a href="%s/dashboard" style="display:inline-block; background:linear-gradient(135deg,#6366f1,#a855f7); color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; padding:14px 36px; border-radius:10px;">
                View in Dashboard
              </a>
            </div>
            """.formatted(taskTitle, projectName, oldStatus, statusColor, newStatus, frontendUrl);

        sendEmail(toEmail, "Task Updated: " + taskTitle + " — " + fromName, wrapInTemplate("Task Status Updated", body));
    }

    // ─── Comment Email ───

    @Async
    public void sendCommentEmail(String toEmail, String taskTitle, String commenterName, String commentContent) {
        String body = """
            <p style="margin:0 0 8px; color:#334155; font-size:15px; line-height:1.6;">
              Hello,
            </p>
            <p style="margin:0 0 20px; color:#475569; font-size:14px; line-height:1.6;">
              <strong>%s</strong> commented on task <strong>%s</strong>:
            </p>
            <div style="background:#f8fafc; border-left:4px solid #6366f1; border-radius:0 8px 8px 0; padding:16px 20px; margin:0 0 24px;">
              <p style="margin:0; color:#334155; font-size:14px; line-height:1.6; font-style:italic;">
                "%s"
              </p>
            </div>
            <div style="text-align:center;">
              <a href="%s/dashboard" style="display:inline-block; background:linear-gradient(135deg,#6366f1,#a855f7); color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; padding:14px 36px; border-radius:10px;">
                Reply in Dashboard
              </a>
            </div>
            """.formatted(commenterName, taskTitle, commentContent, frontendUrl);

        sendEmail(toEmail, "New Comment on " + taskTitle + " — " + fromName, wrapInTemplate("New Comment", body));
    }

    // ─── Member Added to Project Email ───

    @Async
    public void sendMemberAddedEmail(String toEmail, String projectName, String addedByName) {
        String body = """
            <p style="margin:0 0 8px; color:#334155; font-size:15px; line-height:1.6;">
              Hello,
            </p>
            <p style="margin:0 0 20px; color:#475569; font-size:14px; line-height:1.6;">
              <strong>%s</strong> has added you to the project <strong>%s</strong>. You can now view and manage tasks in this project.
            </p>
            <div style="text-align:center; margin:0 0 24px;">
              <a href="%s/dashboard" style="display:inline-block; background:linear-gradient(135deg,#6366f1,#a855f7); color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; padding:14px 36px; border-radius:10px;">
                View Project
              </a>
            </div>
            """.formatted(addedByName, projectName, frontendUrl);

        sendEmail(toEmail, "Added to " + projectName + " — " + fromName, wrapInTemplate("Project Access Granted", body));
    }

    // ─── Member Removed Email ───

    @Async
    public void sendMemberRemovedEmail(String toEmail, String projectName) {
        String body = """
            <p style="margin:0 0 8px; color:#334155; font-size:15px; line-height:1.6;">
              Hello,
            </p>
            <p style="margin:0 0 20px; color:#475569; font-size:14px; line-height:1.6;">
              You have been removed from the project <strong>%s</strong>. You will no longer have access to its tasks and resources.
            </p>
            <p style="margin:0; color:#94a3b8; font-size:13px; line-height:1.5; text-align:center;">
              If you believe this was a mistake, please contact your team administrator.
            </p>
            """.formatted(projectName);

        sendEmail(toEmail, "Removed from " + projectName + " — " + fromName, wrapInTemplate("Project Update", body));
    }

    // ─── Send via Resend ───

    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from("\"" + fromName + "\" <" + fromEmail + ">")
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
