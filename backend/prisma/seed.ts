import { PrismaClient } from "@prisma/client";
import { v4 as uuidV4 } from 'uuid';


const prisma = new PrismaClient();

async function main() {
    const genders = ["Male", "Female", "Other"];

    for (const name of genders) {
        await prisma.gender.upsert({
            where: { name },
            update: {},
            create: { propertyId:uuidV4(), name },
        });
    }

    console.log("✅ Genders initialized");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
