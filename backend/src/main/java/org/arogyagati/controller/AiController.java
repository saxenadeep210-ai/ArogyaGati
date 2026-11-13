package org.arogyagati.controller;

import org.arogyagati.service.AiAssistantService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/ai", "/api/ai"})
public class AiController {

    private final AiAssistantService aiService;

    public AiController(AiAssistantService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiAssistantService.AssistantResponse> chat(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String query = body.getOrDefault("query", body.get("message"));
        String language = body.getOrDefault("language", "en");
        String patientId = (authentication != null) ? authentication.getName() : body.get("patientId");

        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        AiAssistantService.AssistantResponse response = aiService.processQuery(query, patientId, language);
        return ResponseEntity.ok(response);
    }
}
