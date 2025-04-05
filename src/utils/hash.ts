import * as bcrypt from 'bcrypt';
const saltRounds = 12; // Higher is more secure but slower

// Hash a password
async function hashPassword(plainPassword:string) {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(plainPassword, salt);
        return hash;
    } catch (err) {
        throw err;
    }
}

// Verify a password
async function verifyPassword(plainPassword:string, hashedPassword:string) {
    try {
        const match = await bcrypt.compare(plainPassword, hashedPassword);
        return match;
    } catch (err) {
        throw err;
    }
}
