package com.albert.microservices.teaching.marketplace.entities;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table("role_permissions")
public class RolePermission {
    private Integer roleId;
    private Integer permissionId;
}