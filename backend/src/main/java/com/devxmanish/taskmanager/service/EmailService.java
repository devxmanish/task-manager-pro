package com.devxmanish.taskmanager.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ──────────────── Auth Emails ────────────────

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "Your Verification Code — TaskManager Pro";
        String heading = "Email Verification";
        String body = """
            <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
                Use the verification code below to complete your signup. This code expires in <strong>5 minutes</strong>.
            </p>
            <div style="text-align:center;margin:24px 0;">
                <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:32px;font-weight:700;letter-spacing:12px;padding:16px 32px;border-radius:12px;font-family:'Courier New',monospace;">
                    %s
                </div>
            </div>
            <p style="margin:0;color:#6b7280;font-size:13px;text-align:center;">
                If you did not request this code, you can safely ignore this email.
            </p>
            """.formatted(otp);
        sendHtml(toEmail, subject, heading, body, null, null);
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;
        String subject = "Password Reset — TaskManager Pro";
        String heading = "Reset Your Password";
        String body = """
            <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
                We received a request to reset your password. Click the button below to set a new password.
                This link is valid for <strong>15 minutes</strong> and can only be used once.
            </p>
            """;
        sendHtml(toEmail, subject, heading, body, "Reset Password", resetLink);
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String userName, String orgName) {
        String subject = "Welcome to TaskManager Pro! 🎉";
        String heading = "Welcome, " + userName + "!";
        String body = """
            <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
                Your account has been created successfully and you're now part of <strong>%s</strong>.
            </p>
            <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
                Head to your dashboard to get started with your first project and tasks.
            </p>
            """.formatted(orgName);
        sendHtml(toEmail, subject, heading, body, "Open Dashboard", frontendUrl + "/dashboard");
    }

    // ──────────────── Task Emails ────────────────

    @Async
    public void sendTaskAssignmentEmail(String toEmail, String taskTitle, String projectName, String assignedBy) {
        String subject = "New Task Assigned — " + taskTitle;
        String heading = "You've Been Assigned a Task";
        String body = buildDetailRows(
                "Task", taskTitle,
                "Project", projectName,
                "Assigned by", assignedBy
        );
        sendHtml(toEmail, subject, heading, body, "View Task", frontendUrl + "/dashboard");
    }

    @Async
    public void sendTaskStatusEmail(String toEmail, String taskTitle, String projectName, String newStatus, String changedBy) {
        String statusLabel = newStatus.replace("_", " ");
        String subject = "Task Status Updated — " + taskTitle;
        String heading = "Task Status Changed";
        String body = buildDetailRows(
                "Task", taskTitle,
                "Project", projectName,
                "New Status", statusLabel,
                "Changed by", changedBy
        );
        sendHtml(toEmail, subject, heading, body, "View Task", frontendUrl + "/dashboard");
    }

    @Async
    public void sendCommentEmail(String toEmail, String taskTitle, String commenterName, String commentPreview) {
        String subject = "New Comment on — " + taskTitle;
        String heading = "New Comment";
        String body = buildDetailRows(
                "Task", taskTitle,
                "Comment by", commenterName
        ) + """
            <div style="margin:16px 0;padding:12px 16px;background:#f3f4f6;border-left:4px solid #6366f1;border-radius:0 8px 8px 0;">
                <p style="margin:0;color:#374151;font-size:14px;font-style:italic;">"%s"</p>
            </div>
            """.formatted(commentPreview);
        sendHtml(toEmail, subject, heading, body, "View Task", frontendUrl + "/dashboard");
    }

    @Async
    public void sendTaskUpdatedEmail(String toEmail, String taskTitle, String projectName, String updatedBy) {
        String subject = "Task Updated — " + taskTitle;
        String heading = "Task Updated";
        String body = buildDetailRows(
                "Task", taskTitle,
                "Project", projectName,
                "Updated by", updatedBy
        );
        sendHtml(toEmail, subject, heading, body, "View Task", frontendUrl + "/dashboard");
    }

    // ──────────────── Member Emails ────────────────

    @Async
    public void sendMemberAddedEmail(String toEmail, String projectName, String addedBy) {
        String subject = "You've been added to — " + projectName;
        String heading = "Added to Project";
        String body = buildDetailRows(
                "Project", projectName,
                "Added by", addedBy
        ) + """
            <p style="margin:16px 0 0;color:#4b5563;font-size:15px;line-height:1.6;">
                You now have access to all tasks and resources within this project.
            </p>
            """;
        sendHtml(toEmail, subject, heading, body, "Open Project", frontendUrl + "/dashboard");
    }

    @Async
    public void sendMemberRemovedEmail(String toEmail, String projectName) {
        String subject = "Removed from project — " + projectName;
        String heading = "Removed from Project";
        String body = """
            <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
                You have been removed from the project <strong>%s</strong>.
                You will no longer have access to its tasks and resources.
            </p>
            <p style="margin:0;color:#6b7280;font-size:13px;">
                If you believe this was a mistake, please contact your team administrator.
            </p>
            """.formatted(projectName);
        sendHtml(toEmail, subject, heading, body, null, null);
    }

    // ──────────────── Invite Email ────────────────

    @Async
    public void sendInviteEmail(String toEmail, String orgName, String inviterName, String inviteToken) {
        String inviteLink = frontendUrl + "/signup?invite=" + inviteToken;
        String subject = inviterName + " invited you to join " + orgName + " — TaskManager Pro";
        String heading = "You're Invited!";
        String body = """
            <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
                <strong>%s</strong> has invited you to join <strong>%s</strong> on TaskManager Pro.
            </p>
            <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
                Click the button below to create your account and start collaborating with your team.
            </p>
            """.formatted(inviterName, orgName);
        sendHtml(toEmail, subject, heading, body, "Accept Invitation", inviteLink);
    }

    // ──────────────── Template Engine ────────────────

    private void sendHtml(String toEmail, String subject, String heading, String bodyHtml,
                          String ctaText, String ctaUrl) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(buildTemplate(heading, bodyHtml, ctaText, ctaUrl), true);
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildTemplate(String heading, String bodyHtml, String ctaText, String ctaUrl) {
        String ctaBlock = "";
        if (ctaText != null && ctaUrl != null) {
            ctaBlock = """
                <div style="text-align:center;margin:28px 0 8px;">
                    <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
                        %s
                    </a>
                </div>
                """.formatted(ctaUrl, ctaText);
        }

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
                    <tr><td align="center">
                        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%%;">
                            <!-- Header -->
                            <tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 32px;border-radius:12px 12px 0 0;text-align:center;">
                                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">TaskManager Pro</h1>
                                <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:2px;">Team Task Manager</p>
                            </td></tr>
                            <!-- Body -->
                            <tr><td style="background:#ffffff;padding:32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                                <h2 style="margin:0 0 20px;color:#111827;font-size:20px;font-weight:600;">%s</h2>
                                %s
                                %s
                            </td></tr>
                            <!-- Footer -->
                            <tr><td style="background:#f9fafb;padding:20px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;text-align:center;">
                                <p style="margin:0;color:#9ca3af;font-size:12px;">© 2026 TaskManager Pro • Powered by Team Task Manager</p>
                                <p style="margin:4px 0 0;color:#9ca3af;font-size:11px;">You received this email because of your account activity.</p>
                            </td></tr>
                        </table>
                    </td></tr>
                </table>
            </body>
            </html>
            """.formatted(heading, bodyHtml, ctaBlock);
    }

    private String buildDetailRows(String... keyValuePairs) {
        if (keyValuePairs.length % 2 != 0) {
            throw new IllegalArgumentException("Key-value pairs must be even");
        }

        StringBuilder sb = new StringBuilder();
        sb.append("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:8px 0 16px;\">");
        for (int i = 0; i < keyValuePairs.length; i += 2) {
            String key = keyValuePairs[i];
            String value = keyValuePairs[i + 1];
            sb.append("""
                <tr>
                    <td style="padding:8px 12px;color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #f3f4f6;width:120px;vertical-align:top;">%s</td>
                    <td style="padding:8px 12px;color:#111827;font-size:15px;border-bottom:1px solid #f3f4f6;">%s</td>
                </tr>
                """.formatted(key, value));
        }
        sb.append("</table>");
        return sb.toString();
    }
}
