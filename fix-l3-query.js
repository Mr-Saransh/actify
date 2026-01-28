const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
    try {
        // First, find the user and goal
        const user = await prisma.user.findFirst({
            where: { email: { contains: 'saranshagrahari1221' } }
        });

        const goal = await prisma.goal.findFirst({
            where: { userId: user.id, status: 'ACTIVE' }
        });

        // Find L3 task
        const l3Task = await prisma.task.findFirst({
            where: { goalId: goal.id, dayIndex: 3 }
        });

        console.log('Found L3:', l3Task.id, 'State:', l3Task.state);

        // Update it to ACTIVE
        const updated = await prisma.task.update({
            where: { id: l3Task.id },
            data: { state: 'ACTIVE' }
        });

        console.log('✅ L3 is now ACTIVE!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
})();
