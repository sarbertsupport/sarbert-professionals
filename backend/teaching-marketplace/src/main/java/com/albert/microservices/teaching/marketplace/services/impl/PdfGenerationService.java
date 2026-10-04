package com.albert.microservices.teaching.marketplace.services.impl;

import com.albert.microservices.teaching.marketplace.utils.LoggingUtility;
import com.lowagie.text.DocumentException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class PdfGenerationService {
    private static final Logger logger = LoggerFactory.getLogger(PdfGenerationService.class);
    private final SpringTemplateEngine templateEngine;

    public PdfGenerationService(SpringTemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public byte[] generatePdfFromHtml(String templateName, Map<String, Object> data) {
        String transactionId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String processName = "generatePdfFromHtml";

        LoggingUtility.logInfo(logger, transactionId, processName, null, 200,
                "Starting PDF generation", "Template: " + templateName, null);

        Context context = new Context();
        context.setVariables(data);

        String htmlContent = templateEngine.process(templateName, context);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();

            // Optimized PDF rendering settings
            renderer.getSharedContext().setDotsPerPixel(15); // Reduced from 96 for better scaling
            renderer.setDocumentFromString(htmlContent);

            // Set PDF-specific options
            renderer.getSharedContext().setPrint(true);
            renderer.getSharedContext().setInteractive(false);

            renderer.layout();
            renderer.createPDF(outputStream, false); // Don't close stream automatically
            renderer.finishPDF();

            byte[] pdfBytes = outputStream.toByteArray();
            long duration = System.currentTimeMillis() - startTime;

            LoggingUtility.logInfo(logger, transactionId, processName, duration, 200,
                    "PDF generated successfully", null, "");

            return pdfBytes;
        } catch (DocumentException | IOException e) {
            long duration = System.currentTimeMillis() - startTime;
            LoggingUtility.logError(logger, transactionId, processName, duration, 500,
                    "Error generating PDF", e.getMessage(), "Template: " + templateName, null);

            throw new RuntimeException("Error generating PDF", e);
        }
    }
}