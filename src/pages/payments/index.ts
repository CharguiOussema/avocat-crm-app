/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 11/22/2025
 */

// Main unified payments interface
export { ClientPayments } from "./ClientPayments";
export { AddEditClientPayment } from "./AddEditClientPayment";
export { ClientPaymentDetail } from "./ClientPaymentDetail";
export { useClientPaymentTableColumns } from "./ClientPaymentTableColumns";

// Legacy exports (can be removed if not used elsewhere)
export { Payments } from "./Payments";
export { AddEditPayment } from "./AddEditPayment";
export { usePaymentTableColumns } from "./PaymentTableColumns";
