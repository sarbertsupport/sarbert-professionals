package com.albert.microservices.teaching.marketplace.utils;

import com.albert.microservices.teaching.marketplace.entities.ChatMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Pushes new {@link ChatMessage} events for a job to subscribed clients (see {@link ChatJobBroadcastHub}).
 * Clients load history via REST; this stream is live-only. Incoming frames are drained (sends use REST).
 */
@Component
public class ChatWebSocketHandler implements WebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketHandler.class);
    private final ChatJobBroadcastHub broadcastHub;
    private final ObjectMapper objectMapper;

    public ChatWebSocketHandler(ChatJobBroadcastHub broadcastHub, ObjectMapper objectMapper) {
        this.broadcastHub = broadcastHub;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        MultiValueMap<String, String> params = UriComponentsBuilder.fromUri(session.getHandshakeInfo().getUri())
                .build()
                .getQueryParams();
        String jobIdRaw = params.getFirst("jobId");
        Long jobId = null;
        if (jobIdRaw != null) {
            try {
                jobId = Long.parseLong(jobIdRaw.trim());
            } catch (NumberFormatException ignored) {
                // handled below
            }
        }
        if (jobId == null || jobId <= 0) {
            return session.close();
        }

        final Long topicJobId = jobId;

        Flux<WebSocketMessage> outbound = broadcastHub.subscribe(topicJobId)
                .map(this::toJson)
                .map(session::textMessage)
                .onErrorContinue((err, obj) ->
                        log.warn("Chat WS encode/stream error for jobId={}: {}", topicJobId, err.toString()));

        Mono<Void> send = session.send(outbound);
        Mono<Void> drainIncoming = session.receive()
                .doOnNext(WebSocketMessage::retain)
                .then();

        return Mono.when(send, drainIncoming)
                .doOnError(e -> log.debug("Chat WS session ended with error jobId={}: {}", topicJobId, e.toString()))
                .onErrorResume(e -> Mono.empty());
    }

    private String toJson(ChatMessage msg) {
        try {
            return objectMapper.writeValueAsString(msg);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Cannot serialize chat message", e);
        }
    }
}
