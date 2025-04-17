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

// all transaction 
export const transactionHistory = async () => {
        return await db.query.withdrawals.findMany({
            // where: eq(withdrawals.status, 'pending'),
            columns: {
                processedAt: false,
                admin_info: false
            },
            with: {
                user: {
                    columns: {
                        balance: true,
                        email: true,
                        vipTier: true
                    }
                }
            }
        })

}

// single user
export const transactionsHistoryService = async (id: string,admin:boolean=false) => {
    
    return await db.query.withdrawals.findMany({
        where: eq(withdrawals.userId, id),
    })
}

// one transaction id
export const getTransaction = async (id: string) => {

    return await db.query.withdrawals.findFirst({where:eq(withdrawals.id,id)})
}

// cancel transactions
export const cancelWithdrawService = async (id: string, role: 'admin' | 'user', note = 'Withdrawal rejected by admin' ) => {
    return db.transaction(async (tx) => {
        // 1. First, get the withdrawal with user details and lock the rows
        const withdrawal = await tx.query.withdrawals.findFirst({
            where: eq(withdrawals.id, id),
            with: {
                user: true // Join with user table
            }
        });

        if (!withdrawal) {
            throw new Error('Withdrawal not found');
        }

        // 2. Verify the withdrawal can be canceled
        if (withdrawal.status !== 'pending') {
            throw new Error('Only pending withdrawals can be canceled');
        }

        // 3. Determine the new status based on role
        const newStatus = role === 'admin' ? 'rejected' : 'canceled';
        const adminNote = role === 'admin'
            ? note
            : 'Withdrawal canceled by user';

        // 4. Calculate refund amount (amount + fee)
        const refundAmount = sql`${withdrawal.amount} + ${withdrawal.fee}`;

        // 5. Execute the updates in a single transaction
        await tx.update(withdrawals)
            .set({
                status: newStatus,
                processedAt: sql`NOW()`,
                admin_info: adminNote
            })
            .where(eq(withdrawals.id, id));

        // 6. Refund the money to user's balance
        await tx.update(users)
            .set({
                balance: sql`${users.balance} + ${refundAmount}`,
                totalWithdrawn: sql`${users.totalWithdrawn} - ${withdrawal.amount}`
            })
            .where(eq(users.id, withdrawal.userId));

        return {
            success: true,
            message: `Withdrawal ${newStatus} successfully`,
            refundAmount: parseFloat(withdrawal.amount) + parseFloat(withdrawal.fee)
        };
    });
};