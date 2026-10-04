package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.services.EmailService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.UUID;

@Service
public class EmailServiceImpl implements EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public Mono<Void> sendEmail(String to, String subject, String content) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("to=%s, subject=%s", to, subject);

        LoggingUtility.logInfo(logger, transactionId, "sendEmail",
                null, 200, "Email sending initiated", requestPayload, null);

        return Mono.fromCallable(() -> {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            helper.setFrom(senderEmail);
            mailSender.send(message);
            return null;
        })
                .subscribeOn(Schedulers.boundedElastic())
                .doOnSuccess(v -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "sendEmail",
                            duration, 200, "Email sent successfully",
                            requestPayload, "");
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "sendEmail",
                            duration, 500, "Failed to send email",
                            e.getMessage(), requestPayload, null);
                    return Mono.empty();
                })
                .then();
    }

    @Override
    public Mono<Void> sendEmailWithAttachment(String to, String subject, String content,
                                              String attachmentName, byte[] attachment) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("to=%s, subject=%s, attachmentName=%s",
                to, subject, attachmentName);

        LoggingUtility.logInfo(logger, transactionId, "sendEmailWithAttachment",
                null, 200, "Email with attachment sending initiated", requestPayload, null);

        return Mono.fromCallable(() -> {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            helper.setFrom(senderEmail);

            if (attachment != null && attachmentName != null) {
                helper.addAttachment(attachmentName, new ByteArrayResource(attachment));
            }

            mailSender.send(message);
            return null;
        })
                .subscribeOn(Schedulers.boundedElastic())
                .doOnSuccess(v -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logInfo(logger, transactionId, "sendEmailWithAttachment",
                            duration, 200, "Email with attachment sent successfully",
                            requestPayload, String.format("to=%s, attachment=%s", to, ""));
                })
                .onErrorResume(e -> {
                    long duration = System.currentTimeMillis() - startTime;
                    LoggingUtility.logError(logger, transactionId, "sendEmailWithAttachment",
                            duration, 500, "Failed to send email with attachment",
                            e.getMessage(), requestPayload, null);
                    return Mono.empty();
                })
                .then();
    }
}