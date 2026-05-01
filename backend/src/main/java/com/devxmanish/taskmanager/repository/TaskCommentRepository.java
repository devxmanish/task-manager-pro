package com.devxmanish.taskmanager.repository;

import com.devxmanish.taskmanager.entity.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {

    List<TaskComment> findByTaskIdOrderByCreatedAtAsc(Long taskId);
}
