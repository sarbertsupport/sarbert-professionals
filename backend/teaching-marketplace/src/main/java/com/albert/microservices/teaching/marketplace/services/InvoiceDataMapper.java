package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.BillingAddress;
import com.albert.microservices.teaching.marketplace.entities.BusinessAddress;
import com.albert.microservices.teaching.marketplace.entities.CoinTransaction;
import com.albert.microservices.teaching.marketplace.entities.User;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Builds Thymeleaf variables for {@code invoiceemail} (email + PDF), same as purchase receipt.
 */
@Component
public class InvoiceDataMapper {

    public Map<String, Object> buildInvoiceData(
            CoinTransaction transaction,
            User user,
            BillingAddress billingAddress,
            BusinessAddress businessAddress
    ) {
        Map<String, Object> data = new HashMap<>();

        data.put("invoiceNumber", transaction.getId());
        data.put("transactionDate", transaction.getCreatedAt());
        data.put("coinsBought", transaction.getCoins());
        data.put("amountPaid", transaction.getAmount());
        data.put("currency", transaction.getCurrency());
        data.put("paymentMethod", transaction.getPaymentMethod());
        data.put("paymentAmount", transaction.getAmount());
        data.put("transactionFee", "0.00");
        data.put("totalAmount", transaction.getAmount());
        data.put("description", transaction.getDescription());
        data.put("paymentMethodLabel", formatPaymentMethodLabel(transaction.getPaymentMethod()));
        data.put("paymentAmountDisplay", formatMoney(transaction.getAmount()));
        data.put("totalAmountDisplay", formatMoney(transaction.getAmount()));
        data.put("transactionFeeDisplay", "0.00");

        // Receipt shows provider-facing ID: M-Pesa receipt no. or Paystack reference (not internal UUID).
        data.put("transactionId", resolveProviderTransactionId(transaction));
        data.put("paymentReference", resolveSecondaryPaymentReference(transaction));

        BillingAddress bill = billingAddress == null ? new BillingAddress() : billingAddress;
        data.put("customerName", bill.getFullName());
        data.put("customerEmail", user != null ? user.getEmail() : "");
        data.put("customerAddress", formatAddress(bill));
        data.put("customerPhone", bill.getContactNo());

        BusinessAddress biz = businessAddress == null ? new BusinessAddress() : businessAddress;
        data.put("businessName", biz.getBusinessName());
        data.put("businessDescription", biz.getBusinessDescription());
        data.put("businessContactPerson", biz.getContactPerson());
        data.put("businessEmail", biz.getEmail());
        data.put("businessPhone", biz.getPhone());
        data.put("businessAddress", formatBusinessAddress(biz));
        data.put("businessWebsite", biz.getWebsite());
        data.put("businessTaxId", biz.getTaxId());
        data.put("businessRegistrationNumber", biz.getRegistrationNumber());

        return data;
    }

    private String formatAddress(BillingAddress address) {
        if (address == null || address.getAddress() == null) {
            return "Address not provided";
        }
        return String.format("%s, %s, %s, %s",
                address.getAddress(),
                address.getCity(),
                address.getState(),
                address.getCountry()
        );
    }

    private String formatBusinessAddress(BusinessAddress businessAddress) {
        if (businessAddress == null || businessAddress.getAddressLine1() == null) {
            return "Business address not configured";
        }

        StringBuilder sb = new StringBuilder();
        sb.append(businessAddress.getAddressLine1());

        if (businessAddress.getAddressLine2() != null && !businessAddress.getAddressLine2().trim().isEmpty()) {
            sb.append(", ").append(businessAddress.getAddressLine2());
        }

        sb.append(", ").append(businessAddress.getCity());
        sb.append(", ").append(businessAddress.getState());
        sb.append(", ").append(businessAddress.getCountry());

        if (businessAddress.getPostalCode() != null && !businessAddress.getPostalCode().trim().isEmpty()) {
            sb.append(" ").append(businessAddress.getPostalCode());
        }

        return sb.toString();
    }

    private static String formatMoney(Double amount) {
        if (amount == null || !Double.isFinite(amount)) {
            return "0.00";
        }
        return String.format(Locale.US, "%.2f", amount);
    }

    private static String formatPaymentMethodLabel(String method) {
        if (method == null || method.isBlank()) {
            return "—";
        }
        return switch (method.trim().toUpperCase(Locale.ROOT)) {
            case "CARD", "PAYSTACK" -> "Card";
            case "MPESA" -> "M-Pesa";
            case "WALLET" -> "Wallet";
            default -> method;
        };
    }

    /**
     * ID printed on the receipt: M-Pesa receipt number, or Paystack charge reference.
     */
    private static String resolveProviderTransactionId(CoinTransaction transaction) {
        String method = transaction.getPaymentMethod();
        if (method != null && "MPESA".equalsIgnoreCase(method.trim())) {
            return firstNonBlank(
                    transaction.getMpesaReceiptNumber(),
                    transaction.getTransactionUuid());
        }
        if (method != null && isPaystackCardMethod(method)) {
            return firstNonBlank(
                    transaction.getPaystackReference(),
                    transaction.getStripePaymentId(),
                    transaction.getTransactionUuid());
        }
        return firstNonBlank(
                transaction.getMpesaReceiptNumber(),
                transaction.getPaystackReference(),
                transaction.getStripePaymentId(),
                transaction.getTransactionUuid());
    }

    /** Extra provider line only when it differs from {@link #resolveProviderTransactionId}. */
    private static String resolveSecondaryPaymentReference(CoinTransaction transaction) {
        String primary = resolveProviderTransactionId(transaction);
        if (isPaystackCardMethod(safeMethod(transaction))) {
            String paystackPaymentId = blankToNull(transaction.getStripePaymentId());
            if (paystackPaymentId != null && !paystackPaymentId.equals(primary)) {
                return paystackPaymentId;
            }
        }
        return null;
    }

    private static String safeMethod(CoinTransaction transaction) {
        String m = transaction.getPaymentMethod();
        return m == null ? "" : m.trim();
    }

    /** Paystack card checkouts are stored as {@code CARD}; legacy rows may use {@code PAYSTACK}. */
    private static boolean isPaystackCardMethod(String method) {
        if (method == null || method.isBlank()) {
            return false;
        }
        String u = method.trim().toUpperCase(Locale.ROOT);
        return "CARD".equals(u) || "PAYSTACK".equals(u);
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private static String firstNonBlank(String... candidates) {
        if (candidates == null) {
            return "";
        }
        for (String c : candidates) {
            String v = blankToNull(c);
            if (v != null) {
                return v;
            }
        }
        return "";
    }
}
