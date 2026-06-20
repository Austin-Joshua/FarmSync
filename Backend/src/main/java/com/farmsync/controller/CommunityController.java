package com.farmsync.controller;

import com.farmsync.model.ForumPost;
import com.farmsync.model.User;
import com.farmsync.repository.ForumPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/community/posts")
public class CommunityController {

    @Autowired
    private ForumPostRepository forumPostRepository;

    @GetMapping
    public ResponseEntity<List<ForumPost>> getAllPosts() {
        return ResponseEntity.ok(forumPostRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<ForumPost> createPost(@AuthenticationPrincipal User user, @RequestBody ForumPost post) {
        post.setAuthor(user);
        return ResponseEntity.ok(forumPostRepository.save(post));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ForumPost> likePost(@PathVariable UUID id) {
        return forumPostRepository.findById(id).map(post -> {
            post.setLikesCount(post.getLikesCount() + 1);
            return ResponseEntity.ok(forumPostRepository.save(post));
        }).orElse(ResponseEntity.notFound().build());
    }
}
