"use strict";
var __assign  (this && this.__assign) || function () {
    __assign  Object.assign || function(t) {
        for (var s, i  1, n  arguments.length; i < n; i++) {
            s  arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p]  s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersDatabase  void 0;
var better_sqlite3_1  require("better-sqlite3");
var OrdersDatabase  /** @class */ (function () {
    function OrdersDatabase(dbPath) {
        if (dbPath  void 0) { dbPath  './orders.db'; }
        this.db  new better_sqlite3_1.default(dbPath);
        // Enable WAL mode for better concurrency (multiple users can buy simultaneously)
        this.db.pragma('journal_mode  WAL');
        this.init();
    }
    OrdersDatabase.prototype.init  function () {
        this.db.exec("\n      CREATE TABLE IF NOT EXISTS orders (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        telegram_user_id BIGINT NOT NULL,\n        telegram_username TEXT,\n        template_id TEXT NOT NULL,\n        amount_stars INTEGER NOT NULL,\n        payment_status TEXT DEFAULT 'pending',\n        telegram_payment_charge_id TEXT UNIQUE,\n        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n        completed_at TIMESTAMP,\n        delivery_message_id BIGINT\n      );\n\n      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(telegram_user_id);\n      CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);\n    ");
    };
    OrdersDatabase.prototype.createOrder  function (order) {
        var stmt  this.db.prepare("\n      INSERT INTO orders (\n        telegram_user_id, telegram_username, template_id,\n        amount_stars, payment_status, telegram_payment_charge_id\n      ) VALUES (?, ?, ?, ?, ?, ?)\n    ");
        var info  stmt.run(order.telegram_user_id, order.telegram_username || null, order.template_id, order.amount_stars, order.payment_status, order.telegram_payment_charge_id || null);
        return __assign(__assign({}, order), { id: info.lastInsertRowid });
    };
    OrdersDatabase.prototype.updateOrderStatus  function (orderId, status, completedAt, deliveryMessageId) {
        var stmt  this.db.prepare("\n      UPDATE orders\n      SET payment_status  ?, completed_at  ?, delivery_message_id  ?\n      WHERE id  ?\n    ");
        stmt.run(status, completedAt || null, deliveryMessageId || null, orderId);
    };
    OrdersDatabase.prototype.getOrdersByUser  function (userId) {
        var stmt  this.db.prepare('SELECT * FROM orders WHERE telegram_user_id  ?');
        return stmt.all(userId);
    };
    OrdersDatabase.prototype.getOrderByPaymentChargeId  function (chargeId) {
        var stmt  this.db.prepare('SELECT * FROM orders WHERE telegram_payment_charge_id  ?');
        return stmt.get(chargeId);
    };
    OrdersDatabase.prototype.close  function () {
        this.db.close();
    };
    return OrdersDatabase;
}());
exports.OrdersDatabase  OrdersDatabase;
