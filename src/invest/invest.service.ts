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

// // Get all orders for a user
export const getUserOrders = async (userId: string) => {
    // First fetch all orders with their items
    const userOrders = await db.query.orders.findMany({
        where: eq(orders.userId, userId),
        with: {
            items: true
        },
        orderBy: desc(orders.createdAt),
    });

    // Process each order to check if all items have completed their cycles
    const processedOrders = await Promise.all(userOrders.map(async (order) => {
        // Check if all items in this order have completed their cycles
        const allItemsCompleted = order.items.every(item => {
            const daysPassed = Math.floor((Date.now() - new Date(item.createdAt || '').getTime()) / (1000 * 60 * 60 * 24));
            return daysPassed >= item.cycle;
        });

        // If all items are completed and order is still active, update it
        if (allItemsCompleted && order.status === 'active') {
            const [updatedOrder] = await db.update(orders)
                .set({
                    status: 'completed',
                    updatedAt: new Date()
                })
                .where(eq(orders.id, order.id))
                .returning();

            return {
                ...updatedOrder,
                items: order.items
            };
        }

        return order;
    }));

    return processedOrders;
};

export const claimOrder = async (orderId: string): Promise<boolean> => {
    try {
        await db.transaction(async (tx) => {
            // 1. Get the order with its items
            const order = await tx.query.orders.findFirst({
                where: eq(orders.id, orderId),
                with: { items: true }
            });

            if (!order) throw new Error('Order not found');
            if (!order.userId) throw new Error('Order has no user associated'); // Add this check
            if (order.claimed) throw new Error('Order already claimed');
            if (order.status !== 'completed') throw new Error('Order not completed');

            // 2. Calculate total earnings and fee
            let totalEarnings = 0;

            order.items.forEach(item => {
                const itemEarnings = Number(item.cycle) * Number(item.dailyIncome) * item.quantity;
                totalEarnings += itemEarnings;
            });

            const feeAmount = totalEarnings * 0.1;
            const userEarnings = totalEarnings - feeAmount;

            // 3. Update the order
            await tx.update(orders)
                .set({
                    claimed: true,
                    fee: (Number(order.fee) + feeAmount).toString(),
                    updatedAt: new Date()
                })
                .where(eq(orders.id, orderId));

            // 4. Update user balance - now we know order.userId exists
            await tx.update(users)
                .set({
                    balance: sql`${users.balance} + ${userEarnings}`, // Better to use SQL expression
                    // updatedAt: new Date()
                })
                .where(eq(users.id, order.userId)); // No optional chaining needed

        });
        return true;
    } catch (error) {
        console.error('Error claiming order:', error);
        return false;
    }
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
                    // fee:0,
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