import { eq, sql } from "drizzle-orm"
import { db } from "../db/db.js"
import { deposit, users } from "../db/schema.js"
import type { depositDataType } from "../utils/schemas.js"

export const depositService = async () => {
    return await db.query.deposit.findMany({
        where: eq(deposit.status, 'pending'),
        columns: {
            userId:false
        },
        with: {
            user: {
                columns: {
                    email: true,
                }
            }
        }
 })   
}
export const depositCreateService = async (data: depositDataType): Promise<boolean> => {
    try {
        await db.insert(deposit)
            .values({
                phone: data.phone,
                userId: data.userId,
                amount: String(data.amount),
                code: data.code,
                status: 'pending'
            })
            .returning()
            .execute();
        return true; 
    } catch (error) {
        console.error('Error creating deposit:', error);
        return false;
    }
};

export const updateDepositService = async (id: string): Promise<boolean> => {
    try {
        // Start a transaction
        await db.transaction(async (tx) => {
            // 1. First get the deposit record
            const depositRecord = await tx.query.deposit.findFirst({
                where: (deposit, { eq }) => eq(deposit.id, id),
            });

            if (!depositRecord) {
                throw new Error('Deposit record not found');
            }

            // 2. Update the deposit status to 'completed'
            await tx
                .update(deposit)
                .set({ status: 'completed' })
                .where(eq(deposit.id, id));

            // 3. Update the user's balance and deposit amounts
            await tx
                .update(users)
                .set({
                    balance: sql`${users.balance} + ${depositRecord.amount}`,
                    deposit: sql`${users.deposit} + ${depositRecord.amount}`,
                })
                .where(eq(users.id, String(depositRecord.userId)));
        });

        return true; // Success
    } catch (error) {
        console.error('Error updating deposit:', error);
        return false; // Failure
    }
};