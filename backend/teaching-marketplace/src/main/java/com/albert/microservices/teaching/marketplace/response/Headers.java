package com.albert.microservices.teaching.marketplace.response;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Headers {
    private String requestId;
    private int responseCode;
    private long timestamp;
    private String customerMessage;
    private String responseMessage;

}
