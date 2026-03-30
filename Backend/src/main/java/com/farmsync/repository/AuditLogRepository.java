package com.farmsync.repository;

import com.farmsync.model.AuditLog;
import com.farmsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByUser(User user);
    List<AuditLog> findByUserId(UUID userId);
}
