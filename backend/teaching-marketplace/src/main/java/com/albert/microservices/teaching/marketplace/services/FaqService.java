package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.Faq;
import com.albert.microservices.teaching.marketplace.repositories.FaqRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.LinkedHashMap;
import java.util.Map;

import static com.albert.microservices.teaching.marketplace.utils.Constants.CODE_SUCCESS;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;

    public Mono<ApiResponse> listPublishedFaqs(String categoryFilter) {
        boolean hasCat = categoryFilter != null && !categoryFilter.isBlank();
        var flux = hasCat
                ? faqRepository.findByActiveIsTrueAndCategoryIgnoreCaseOrderBySortOrderAsc(categoryFilter.trim())
                : faqRepository.findByActiveIsTrueOrderBySortOrderAsc();

        return flux
                .map(this::toBodyRow)
                .collectList()
                .map(rows -> ApiResponse.createResponse(
                        CODE_SUCCESS,
                        "FAQs retrieved",
                        "OK",
                        rows
                ));
    }

    private Map<String, Object> toBodyRow(Faq f) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", f.getId());
        m.put("slug", f.getSlug());
        m.put("category", f.getCategory());
        m.put("question", f.getQuestion());
        m.put("answer", f.getAnswer());
        m.put("sortOrder", f.getSortOrder());
        return m;
    }
}
