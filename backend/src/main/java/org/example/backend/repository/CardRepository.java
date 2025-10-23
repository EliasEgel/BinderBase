package org.example.backend.repository;

import org.example.backend.model.Card;
import org.example.backend.model.CardStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
	java.util.List<Card> findByUserId(String userId);

	/** Finds all cards with a specific status, e.g., all cards FOR_SALE. */
	List<Card> findAllByStatus(CardStatus status);
}
