package org.example.backend.model;

public enum CardStatus {
    /** The card is in a user's private collection and not for sale. */
    IN_COLLECTION,

    /** The card has been listed on the marketplace by its owner. */
    FOR_SALE,

    /** The card has been sold and is no longer available. */
    SOLD
}