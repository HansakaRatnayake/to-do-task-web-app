import { Client } from "pg";

async function createTestDB() {
    const client = new Client({
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        password: process.env.DB_PASSWORD || "1234",
        port: Number(process.env.DB_PORT) || 5432,
    });

    await client.connect();
    const dbName = process.env.TEST_DB_NAME || "todo_test";

    // Check if DB exists, create if not
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbName}'`);
    if (res.rowCount === 0) {
        console.log(`Creating test database: ${dbName}`);
        await client.query(`CREATE DATABASE "${dbName}"`);
    } else {
        console.log(`Test database ${dbName} already exists`);
    }

    await client.end();
}

createTestDB().catch((err) => {
    console.error(err);
    process.exit(1);
});
