interface Order {
    id?: number;
    telegram_user_id: number;
    telegram_username?: string;
    template_id: string;
    amount_stars: number;
    payment_status: 'pending' | 'completed' | 'failed';
    telegram_payment_charge_id?: string;
    created_at?: string;
    completed_at?: string;
    delivery_message_id?: number;
}
export declare class OrdersDatabase {
    private db;
    constructor(dbPath?: string);
    private init;
    createOrder(order: Omit<Order, 'id' | 'created_at'>): Order;
    updateOrderStatus(orderId: number, status: 'completed' | 'failed', completedAt?: string, deliveryMessageId?: number): void;
    getOrdersByUser(userId: number): Order[];
    getOrderByPaymentChargeId(chargeId: string): Order | undefined;
    close(): void;
}
export {};
