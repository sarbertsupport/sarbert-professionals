package com.albert.microservices.teaching.marketplace.utils;

import com.albert.microservices.teaching.marketplace.entities.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory pub/sub per job for chat. Suitable for a single JVM (~tens of concurrent chat connections).
 */
@Component
public class ChatJobBroadcastHub {

    private static final Logger log = LoggerFactory.getLogger(ChatJobBroadcastHub.class);
    private static final int BUFFER = 512;

    private final ConcurrentHashMap<Long, Sinks.Many<ChatMessage>> sinksByJobId = new ConcurrentHashMap<>();

    private Sinks.Many<ChatMessage> sinkForJob(Long jobId) {
        return sinksByJobId.computeIfAbsent(jobId, id ->
                Sinks.many().multicast().onBackpressureBuffer(BUFFER));
    }

    /**
     * Called after a message is persisted (REST or future WS send path).
     */
    public void publish(Long jobId, ChatMessage message) {
        if (jobId == null || message == null) {
            return;
        }
        Sinks.EmitResult r = sinkForJob(jobId).tryEmitNext(message);
        if (r.isFailure() && r != Sinks.EmitResult.FAIL_ZERO_SUBSCRIBER) {
            log.warn("Chat broadcast emit failed for jobId={}: {}", jobId, r);
        }
    }

    public Flux<ChatMessage> subscribe(Long jobId) {
        if (jobId == null || jobId <= 0) {
            return Flux.empty();
        }
        return sinkForJob(jobId).asFlux();
    }
}
