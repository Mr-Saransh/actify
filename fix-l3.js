const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
    try {
        // Update L3 from FAILED to ACTIVE
        const task = await prisma.task.update({
            where: { id: '389f65bd-7555-4c04-87fe-f4c6e82e88bb' },
            data: { state: 'ACTIVE' }
        });
        console.log('✅ L3 activated:', task.dayIndex, task.state);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
})();
