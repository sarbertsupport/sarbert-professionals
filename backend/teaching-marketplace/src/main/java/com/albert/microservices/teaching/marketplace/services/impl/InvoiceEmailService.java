package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.services.EmailService;
import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Service
public class InvoiceEmailService {
    private static final Logger logger = LoggerFactory.getLogger(InvoiceEmailService.class);

    private final EmailService emailService;
    private final PdfGenerationService pdfGenerationService;
    private final SpringTemplateEngine templateEngine;

    public InvoiceEmailService(EmailService emailService,
                               PdfGenerationService pdfGenerationService,
                               SpringTemplateEngine templateEngine) {
        this.emailService = emailService;
        this.pdfGenerationService = pdfGenerationService;
        this.templateEngine = templateEngine;
    }

    public Mono<Void> sendInvoiceEmail(Map<String, Object> invoiceData, String toEmail) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String requestPayload = String.format("toEmail=%s, invoiceNumber=%s",
                toEmail, invoiceData.get("invoiceNumber"));

        LoggingUtility.logInfo(logger, transactionId, "sendInvoiceEmail",
                null, 200, "Invoice email sending initiated", requestPayload, null);

        try {
            // Format transaction date if present
            if (invoiceData.get("transactionDate") instanceof LocalDateTime) {
                LocalDateTime date = (LocalDateTime) invoiceData.get("transactionDate");
                invoiceData.put("formattedDate", date.format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")));
                LoggingUtility.logInfo(logger, transactionId, "sendInvoiceEmail",
                        null, 200, "Formatted transaction date", null, null);
            }

            // Generate email content
            Context emailContext = new Context();
            emailContext.setVariables(invoiceData);
            String emailContent = templateEngine.process("invoiceemail", emailContext);
            LoggingUtility.logInfo(logger, transactionId, "sendInvoiceEmail",
                    null, 200, "Email content generated", null, null);

            // Generate PDF
            byte[] pdfBytes = pdfGenerationService.generatePdfFromHtml("invoiceemail", invoiceData);
            LoggingUtility.logInfo(logger, transactionId, "sendInvoiceEmail",
                    null, 200, "PDF generated", null,
                   "");

            // Send email with attachment
            String attachmentName = "Invoice_" + invoiceData.get("invoiceNumber") + ".pdf";
            return emailService.sendEmailWithAttachment(
                    toEmail,
                    "Your Invoice Receipt #" + invoiceData.get("invoiceNumber"),
                    emailContent,
                    attachmentName,
                    pdfBytes
            )
                    .doOnSuccess(v -> {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logInfo(logger, transactionId, "sendInvoiceEmail",
                                duration, 200, "Invoice email sent successfully",
                                requestPayload, "");
                    })
                    .doOnError(e -> {
                        long duration = System.currentTimeMillis() - startTime;
                        LoggingUtility.logError(logger, transactionId, "sendInvoiceEmail",
                                duration, 500, "Failed to send invoice email",
                                e.getMessage(), requestPayload, null);
                    });
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logError(logger, transactionId, "sendInvoiceEmail",
                    duration, 500, "Error processing invoice email",
                    e.getMessage(), requestPayload, null);
            return Mono.error(e);
        }
    }
}