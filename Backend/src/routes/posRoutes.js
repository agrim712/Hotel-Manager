import express from "express";
import { auth as authenticateToken, authorizeRoles } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

// Import controllers
import * as menuController from "../controllers/POS/menuController.js";
import * as orderController from "../controllers/POS/orderController.js";
import * as tableController from "../controllers/POS/tableController.js";
import * as waiterController from "../controllers/POS/waiterController.js";
import * as billingController from "../controllers/POS/billingController.js";
import * as inventoryController from "../controllers/POS/inventoryController.js";
import * as kitchenController from "../controllers/POS/kitchenController.js";
import * as reportController from "../controllers/POS/reportController.js";
import * as couponController from "../controllers/POS/couponController.js";
import * as queueController from "../controllers/POS/queueController.js";
import * as thirdPartyController from "../controllers/POS/thirdPartyController.js";

const router = express.Router();

router.use(authenticateToken);

// Role-based middleware for different operations
const requireManagerOrAdmin = authorizeRoles('HOTELADMIN', 'RESTAURANTMANAGER');
const requireStaffOrAbove = authorizeRoles('HOTELADMIN', 'RESTAURANTMANAGER', 'WAITER', 'CHIEF');
const requireAdminOnly = authorizeRoles('HOTELADMIN');

// ===================== MENU MANAGEMENT ROUTES =====================
router.get("/menu/categories", menuController.getMenuCategories);
router.post("/menu/categories", requireManagerOrAdmin, menuController.createMenuCategory);
router.put("/menu/categories/:id", requireManagerOrAdmin, menuController.updateMenuCategory);
router.delete("/menu/categories/:id", requireManagerOrAdmin, menuController.deleteMenuCategory);

router.get("/menu/items", menuController.getMenuItems);
router.get("/menu/items/:id", menuController.getMenuItem);
router.post("/menu/items", requireManagerOrAdmin, upload.array("images", 5), menuController.createMenuItem);
router.put("/menu/items/:id", requireManagerOrAdmin, upload.array("images", 5), menuController.updateMenuItem);
router.delete("/menu/items/:id", requireManagerOrAdmin, menuController.deleteMenuItem);

router.get("/menu/modifiers", menuController.getMenuModifiers);
router.post("/menu/modifiers", requireManagerOrAdmin, menuController.createMenuModifier);
router.put("/menu/modifiers/:id", requireManagerOrAdmin, menuController.updateMenuModifier);
router.delete("/menu/modifiers/:id", requireManagerOrAdmin, menuController.deleteMenuModifier);

router.get("/menu/combos", menuController.getComboItems);
router.post("/menu/combos", requireManagerOrAdmin, menuController.createComboItem);
router.put("/menu/combos/:id", requireManagerOrAdmin, menuController.updateComboItem);
router.delete("/menu/combos/:id", requireManagerOrAdmin, menuController.deleteComboItem);

// ===================== ORDER MANAGEMENT ROUTES =====================
router.get("/orders", orderController.getOrders);
router.get("/orders/:id", orderController.getOrder);
router.post("/orders", requireStaffOrAbove, orderController.createOrder);
router.put("/orders/:id", requireStaffOrAbove, orderController.updateOrder);
router.put("/orders/:id/status", requireStaffOrAbove, orderController.updateOrderStatus);
router.delete("/orders/:id", requireManagerOrAdmin, orderController.cancelOrder);

// Order items
router.post("/orders/:orderId/items", requireStaffOrAbove, orderController.addOrderItem);
router.put("/orders/:orderId/items/:itemId", requireStaffOrAbove, orderController.updateOrderItem);
router.delete("/orders/:orderId/items/:itemId", requireStaffOrAbove, orderController.removeOrderItem);

// Order modifiers
router.post("/orders/:orderId/items/:itemId/modifiers", requireStaffOrAbove, orderController.addOrderModifier);
router.delete("/orders/:orderId/items/:itemId/modifiers/:modifierId", requireStaffOrAbove, orderController.removeOrderModifier);

// Order splitting
router.post("/orders/:id/split", requireStaffOrAbove, orderController.splitOrder);
router.get("/orders/:id/splits", orderController.getOrderSplits);

// ===================== TABLE MANAGEMENT ROUTES =====================
router.get("/tables", tableController.getTables);
router.get("/tables/:id", tableController.getTable);
router.post("/tables", requireManagerOrAdmin, tableController.createTable);
router.put("/tables/:id", requireManagerOrAdmin, tableController.updateTable);
router.delete("/tables/:id", requireManagerOrAdmin, tableController.deleteTable);

router.get("/areas", tableController.getAreas);
router.post("/areas", requireManagerOrAdmin, tableController.createArea);
router.put("/areas/:id", requireManagerOrAdmin, tableController.updateArea);
router.delete("/areas/:id", requireManagerOrAdmin, tableController.deleteArea);

router.put("/tables/:id/status", requireStaffOrAbove, tableController.updateTableStatus);
router.get("/tables/available", tableController.getAvailableTables);

// ===================== WAITER MANAGEMENT ROUTES =====================
router.get("/waiters", waiterController.getWaiters);
router.get("/waiters/:id", waiterController.getWaiter);
router.post("/waiters", requireManagerOrAdmin, waiterController.createWaiter);
router.put("/waiters/:id", requireManagerOrAdmin, waiterController.updateWaiter);
router.delete("/waiters/:id", requireManagerOrAdmin, waiterController.deleteWaiter);

router.post("/waiters/:id/assign-tables", requireManagerOrAdmin, waiterController.assignTablesToWaiter);
router.post("/waiters/:id/remove-tables", requireManagerOrAdmin, waiterController.removeTablesFromWaiter);
router.get("/waiters/:id/tables", waiterController.getWaiterTables);

// ===================== BILLING & PAYMENT ROUTES =====================
router.get("/bills", billingController.getBills);
router.get("/bills/:id", billingController.getBill);
router.post("/bills", requireStaffOrAbove, billingController.createBill);
router.put("/bills/:id", requireStaffOrAbove, billingController.updateBill);

router.get("/payments", billingController.getPayments);
router.post("/payments", requireStaffOrAbove, billingController.createPayment);
router.put("/payments/:id", requireStaffOrAbove, billingController.updatePayment);

router.get("/tax-config", billingController.getTaxConfiguration);
router.post("/tax-config", requireAdminOnly, billingController.createTaxConfiguration);
router.put("/tax-config/:id", requireAdminOnly, billingController.updateTaxConfiguration);

router.get("/receipt-templates", billingController.getReceiptTemplates);
router.post("/receipt-templates", requireAdminOnly, billingController.createReceiptTemplate);
router.put("/receipt-templates/:id", requireAdminOnly, billingController.updateReceiptTemplate);

// ===================== INVENTORY MANAGEMENT ROUTES =====================
router.get("/inventory", inventoryController.getInventoryItems);
router.get("/inventory/:id", inventoryController.getInventoryItem);
router.post("/inventory", requireManagerOrAdmin, inventoryController.createInventoryItem);
router.put("/inventory/:id", requireManagerOrAdmin, inventoryController.updateInventoryItem);
router.delete("/inventory/:id", requireManagerOrAdmin, inventoryController.deleteInventoryItem);

router.get("/inventory/transactions", inventoryController.getInventoryTransactions);
router.post("/inventory/transactions", requireStaffOrAbove, inventoryController.createInventoryTransaction);

router.get("/inventory/low-stock", inventoryController.getLowStockItems);
router.post("/inventory/adjust", requireStaffOrAbove, inventoryController.adjustInventory);

router.get("/suppliers", inventoryController.getSuppliers);
router.post("/suppliers", requireManagerOrAdmin, inventoryController.createSupplier);
router.put("/suppliers/:id", requireManagerOrAdmin, inventoryController.updateSupplier);
router.delete("/suppliers/:id", requireManagerOrAdmin, inventoryController.deleteSupplier);

router.get("/purchase-orders", inventoryController.getPurchaseOrders);
router.get("/purchase-orders/:id", inventoryController.getPurchaseOrder);
router.post("/purchase-orders", requireManagerOrAdmin, inventoryController.createPurchaseOrder);
router.put("/purchase-orders/:id", requireManagerOrAdmin, inventoryController.updatePurchaseOrder);
router.put("/purchase-orders/:id/status", requireManagerOrAdmin, inventoryController.updatePurchaseOrderStatus);

// ===================== KITCHEN DISPLAY SYSTEM ROUTES =====================
router.get("/kitchen/orders", kitchenController.getKitchenOrders);
router.get("/kitchen/orders/:id", kitchenController.getKitchenOrder);
router.put("/kitchen/orders/:id/status", authorizeRoles('HOTELADMIN', 'RESTAURANTMANAGER', 'CHIEF'), kitchenController.updateKitchenOrderStatus);
router.put("/kitchen/orders/:id/time", authorizeRoles('HOTELADMIN', 'RESTAURANTMANAGER', 'CHIEF'), kitchenController.updateKitchenOrderTime);

router.get("/kitchen/displays", kitchenController.getKitchenDisplays);
router.post("/kitchen/displays", requireManagerOrAdmin, kitchenController.createKitchenDisplay);
router.put("/kitchen/displays/:id", requireManagerOrAdmin, kitchenController.updateKitchenDisplay);
router.delete("/kitchen/displays/:id", requireManagerOrAdmin, kitchenController.deleteKitchenDisplay);

// ===================== COUPON & DISCOUNT ROUTES =====================
router.get("/coupons", couponController.getCoupons);
router.get("/coupons/:id", couponController.getCoupon);
router.post("/coupons", requireManagerOrAdmin, couponController.createCoupon);
router.put("/coupons/:id", requireManagerOrAdmin, couponController.updateCoupon);
router.delete("/coupons/:id", requireManagerOrAdmin, couponController.deleteCoupon);

router.post("/coupons/validate", requireStaffOrAbove, couponController.validateCoupon);
router.put("/coupons/:id/usage", requireStaffOrAbove, couponController.updateCouponUsage);

// ===================== QUEUE MANAGEMENT ROUTES =====================
router.get("/queue", queueController.getQueueEntries);
router.get("/queue/:id", queueController.getQueueEntry);
router.post("/queue", requireStaffOrAbove, queueController.addToQueue);
router.put("/queue/:id", requireStaffOrAbove, queueController.updateQueueEntry);
router.put("/queue/:id/status", requireStaffOrAbove, queueController.updateQueueStatus);
router.delete("/queue/:id", requireStaffOrAbove, queueController.removeFromQueue);

router.get("/queue/wait-times", queueController.getEstimatedWaitTimes);

// ===================== THIRD-PARTY INTEGRATION ROUTES =====================
router.get("/third-party/orders", thirdPartyController.getThirdPartyOrders);
router.get("/third-party/orders/:id", thirdPartyController.getThirdPartyOrder);
router.post("/third-party/orders", requireStaffOrAbove, thirdPartyController.createThirdPartyOrder);
router.put("/third-party/orders/:id", requireStaffOrAbove, thirdPartyController.updateThirdPartyOrder);
router.put("/third-party/orders/:id/status", requireStaffOrAbove, thirdPartyController.updateThirdPartyOrderStatus);

router.post("/third-party/swiggy/webhook", thirdPartyController.swiggyWebhook);
router.post("/third-party/zomato/webhook", thirdPartyController.zomatoWebhook);
router.post("/third-party/uber-eats/webhook", thirdPartyController.uberEatsWebhook);

// ===================== REPORTING ROUTES =====================
router.get("/reports/sales", requireManagerOrAdmin, reportController.getSalesReport);
router.get("/reports/inventory", requireManagerOrAdmin, reportController.getInventoryReport);
router.get("/reports/revenue", requireManagerOrAdmin, reportController.getRevenueReport);
router.get("/reports/kitchen", requireManagerOrAdmin, reportController.getKitchenReport);
router.get("/reports/customer", requireManagerOrAdmin, reportController.getCustomerReport);

router.get("/reports/dashboard", requireManagerOrAdmin, reportController.getDashboardData);
router.get("/reports/analytics", requireManagerOrAdmin, reportController.getAnalyticsData);

// ===================== CUSTOMER MANAGEMENT ROUTES =====================
router.get("/customers", orderController.getCustomers);
router.get("/customers/:id", orderController.getCustomer);
router.post("/customers", requireStaffOrAbove, orderController.createCustomer);
router.put("/customers/:id", requireStaffOrAbove, orderController.updateCustomer);

router.get("/customers/:id/orders", orderController.getCustomerOrders);
router.get("/customers/:id/feedback", orderController.getCustomerFeedback);

export default router;
