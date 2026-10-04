package com.albert.microservices.teaching.marketplace.response;



import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ApiResponse {
    private Headers headers;
    private Body body;

    public ApiResponse() {
        this.headers = new Headers();
        this.body = new Body();
    }

    public static ApiResponse createResponse(int responseCode, String customerMessage,String responseMessage, Object responseBody) {
        ApiResponse response = new ApiResponse();

        // Set headers
        response.headers.setRequestId(UUID.randomUUID().toString());
        response.headers.setResponseCode(responseCode);
        response.headers.setTimestamp(System.currentTimeMillis());
        response.headers.setCustomerMessage(customerMessage);
        response.headers.setResponseMessage(responseMessage);
        response.body.setData(responseBody);


        return response;
    }

}
