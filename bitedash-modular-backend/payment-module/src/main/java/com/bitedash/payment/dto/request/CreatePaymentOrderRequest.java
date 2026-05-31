package com.bitedash.payment.dto.request;

import java.math.BigDecimal;

/**
 * Request to create a payment order for wallet top-up.
 */
public class CreatePaymentOrderRequest {

    private BigDecimal amount;  // Amount in rupees (will be converted to paise)
    private String description;

    public CreatePaymentOrderRequest() {}

    public CreatePaymentOrderRequest(BigDecimal amount, String description) {
        this.amount = amount;
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
