import {eq } from "drizzle-orm"
import { sql } from 'drizzle-orm';
import { db } from "../db/db.js"
import { users, withdrawals } from "../db/schema.js"


interface WithdrawRequest {
    userId: string,
    amount: string,
    netAmount: string,
    fee: string,
    phone: string,
    admin_info?: string,
}


export const processWithdrawal = async (data: WithdrawRequest) => {
    // Verify amounts first (before transaction)
    const amount = parseFloat(data.amount);
    const fee = parseFloat(data.fee);
    const netAmount = parseFloat(data.netAmount);

 
    // Start transaction
    return db.transaction(async (tx) => {
        // 1. Verify and lock user balance
        const [user] = await tx.select({
            balance: users.balance
        })
            .from(users)
            .where(eq(users.id, data.userId))
            .for('update'); // This locks the row

        if (!user) {
            throw new Error('User not found');
        }

        const totalDeduction = amount + fee;

       

        // 3. Deduct from user balance
        await tx.update(users)
            .set({
                balance: sql`${users.balance} - ${totalDeduction}`,
                totalWithdrawn: sql`${users.totalWithdrawn} + ${amount}`
            })
            .where(eq(users.id, data.userId));

        // 4. Create withdrawal record
        const [withdrawal] = await tx.insert(withdrawals)
            .values({
                userId: data.userId,
                amount: data.amount,
                netAmount: data.netAmount,
                fee: data.fee,
                phone: data.phone,
                admin_info: data.admin_info,
                status: 'pending'
            })
            .returning();

        return withdrawal;
    });
};

export const transactionsHistoryService = async (id: string) => {
    return await db.query.withdrawals.findMany({
        where: eq(withdrawals.userId, id),
    })
}