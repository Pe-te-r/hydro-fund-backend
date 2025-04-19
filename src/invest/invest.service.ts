import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db/db.js";
import { orderItems, orders, users } from "../db/schema.js";
import type { CreateOrderInput } from "../utils/schemas.js";

const getOrderWithItems = async (orderId: string) => {
    return await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: {
            items: true,
            user: {
                columns: {
                    id: true,
                    username: true,
                    email: true,
                }
            }
        }
    });
};

// Get all orders for a user
export const getUserOrders = async (userId: string) => {
    return await db.query.orders.findMany({
        where: eq(orders.userId, userId),
        with: {
            items: true
        },
        orderBy: desc(orders.createdAt),
    });
};



/**
 * Saves an order to the database with all its items
 * @param orderData Validated order data matching CreateOrderSchema
 * @returns Promise<{ success: boolean; orderId?: string; error?: string }>
 */
export const saveOrderToDatabase = async (
    orderData: CreateOrderInput
): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
        // Start a transaction
        const result = await db.transaction(async (tx) => {
            // 1. Create the order record
            const [newOrder] = await tx.insert(orders)
                .values({
                    userId: orderData.userId,
                    totalAmount: orderData.totalAmount.toString(), // Convert to string for decimal
                    status: 'active',
                })
                .returning({ id: orders.id });

            // 2. Insert all order items
            await tx.insert(orderItems).values(
                orderData.items.map(item => ({
                    orderId: newOrder.id,
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    price: item.price.toString(),
                    dailyIncome: item.dailyIncome.toString(),
                    totalIncome: item.totalIncome.toString(),
                    cycle: item.cycle,
                }))
            );

            // 3. Update user's total invested amount
            await tx.update(users)
                .set({
                    totalInvested: sql`${users.totalInvested} + ${orderData.totalAmount.toString()}`,
                    balance: sql`${users.balance} - ${orderData.totalAmount.toString()}`
                })
                .where(eq(users.id, orderData.userId));

            return { success: true, orderId: newOrder.id };
        });

        return result;
    } catch (error) {
        console.error('Failed to save order:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};