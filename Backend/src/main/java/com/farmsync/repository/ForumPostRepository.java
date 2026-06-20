package com.farmsync.repository;

import com.farmsync.model.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, UUID> {
    List<ForumPost> findAllByOrderByCreatedAtDesc();
    List<ForumPost> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);
}
