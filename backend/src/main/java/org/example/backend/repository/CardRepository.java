package org.example.backend.repository;

import org.example.backend.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
	java.util.List<Card> findByUserId(String userId);
}
