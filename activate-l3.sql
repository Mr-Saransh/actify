-- Manual script to activate Level 3 for user saranshagrahari1221
-- Run this in Prisma Studio or via npx prisma db execute

-- Step 1: Find the user
SELECT * FROM "User" WHERE email = 'saranshagrahari1221@gmail.com';

-- Step 2: Find their active goal
SELECT * FROM "Goal" WHERE "userId" IN (
  SELECT id FROM "User" WHERE email = 'saranshagrahari1221@gmail.com'
) AND status = 'ACTIVE';

-- Step 3: Find task with dayIndex = 3
SELECT * FROM "Task" WHERE "goalId" IN (
  SELECT id FROM "Goal" WHERE "userId" IN (
    SELECT id FROM "User" WHERE email = 'saranshagrahari1221@gmail.com'
  ) AND status = 'ACTIVE'
) AND "dayIndex" = 3;

-- Step 4: Set all tasks to appropriate states (L1-L2 ACCEPTED, L3 ACTIVE, rest LOCKED)
UPDATE "Task" 
SET state = 'ACCEPTED'
WHERE "goalId" IN (
  SELECT id FROM "Goal" WHERE "userId" IN (
    SELECT id FROM "User" WHERE email = 'saranshagrahari1221@gmail.com'
  ) AND status = 'ACTIVE'
) AND "dayIndex" IN (1, 2);

UPDATE "Task" 
SET state = 'ACTIVE'
WHERE "goalId" IN (
  SELECT id FROM "Goal" WHERE "userId" IN (
    SELECT id FROM "User" WHERE email = 'saranshagrahari1221@gmail.com'
  ) AND status = 'ACTIVE'
) AND "dayIndex" = 3;

UPDATE "Task" 
SET state = 'LOCKED'
WHERE "goalId" IN (
  SELECT id FROM "Goal" WHERE "userId" IN (
    SELECT id FROM "User" WHERE email = 'saranshagrahari1221@gmail.com'
  ) AND status = 'ACTIVE'
) AND "dayIndex" > 3;
