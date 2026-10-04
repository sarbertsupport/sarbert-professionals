package com.albert.microservices.teaching.marketplace.security.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserNameDTO {
    private Integer userId;
    private String username;
}
