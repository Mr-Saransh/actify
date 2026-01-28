// Debug script - Check what getCurrentLevelTask is returning
// Run: node debug-task.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugTask() {
    try {
        // Find user
        const user = await prisma.user.findFirst({
            where: { email: { contains: 'saranshagrahari1221' } }
        });

        console.log('User:', user?.email);

        // Find active goal
        const goal = await prisma.goal.findFirst({
            where: {
                userId: user.id,
                status: 'ACTIVE'
            }
        });

        console.log('Goal:', goal?.title, 'Status:', goal?.status);

        // Check ALL tasks
        const allTasks = await prisma.task.findMany({
            where: { goalId: goal.id },
            orderBy: { dayIndex: 'asc' }
        });

        console.log('\n=== ALL TASKS ===');
        allTasks.forEach(t => {
            console.log(`L${t.dayIndex}: ${t.state} (ID: ${t.id.substring(0, 8)}...)`);
        });

        // Specifically check for ACTIVE task
        const activeTask = await prisma.task.findFirst({
            where: { goalId: goal.id, state: 'ACTIVE' }
        });

        console.log('\n=== ACTIVE TASK ===');
        if (activeTask) {
            console.log('✅ Found ACTIVE task:', {
                dayIndex: activeTask.dayIndex,
                state: activeTask.state,
                id: activeTask.id
            });
        } else {
            console.log('❌ NO ACTIVE TASK FOUND!');

            // Try to find next locked task
            const nextLocked = await prisma.task.findFirst({
                where: { goalId: goal.id, state: 'LOCKED' },
                orderBy: { dayIndex: 'asc' }
            });

            if (nextLocked) {
                console.log('Found next LOCKED task: L' + nextLocked.dayIndex);
                console.log('Activating it now...');

                await prisma.task.update({
                    where: { id: nextLocked.id },
                    data: { state: 'ACTIVE' }
                });

                console.log('✅ Activated L' + nextLocked.dayIndex);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugTask();
