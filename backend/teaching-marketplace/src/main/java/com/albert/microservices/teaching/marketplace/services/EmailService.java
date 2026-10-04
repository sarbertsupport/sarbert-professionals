package com.albert.microservices.teaching.marketplace.services;

import reactor.core.publisher.Mono;

public interface EmailService {
    Mono<Void> sendEmail(String to, String subject, String content);
    Mono<Void> sendEmailWithAttachment(String to, String subject, String content,
                                       String attachmentName, byte[] attachment);
}
