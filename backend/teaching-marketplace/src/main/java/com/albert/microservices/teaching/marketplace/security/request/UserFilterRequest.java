package com.albert.microservices.teaching.marketplace.security.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserFilterRequest {
    private String roleName;
    private Boolean activeStatus;
    private String searchTerm;
    private int page;
    private int size;
}
