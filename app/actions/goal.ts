"use server";

import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { getOrCreateUser } from "./user";
import { GoalType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const CreateGoalSchema = z.object({
    title: z.string().min(5, "Goal must be specific (min 5 chars)"),
    description: z.string().optional(),
    type: z.nativeEnum(GoalType),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid deadline date",
    }),
});

export type CreateGoalState = {
    errors?: {
        title?: string[];
        type?: string[];
        deadline?: string[];
        permission?: string[];
    };
    message?: string;
};

// Descriptive Curriculum Templates (Expanded & Rich)
type CurriculumItem = {
    title: string;
    description: string;
    hint: string;
};

const CURRICULA: Record<string, CurriculumItem[]> = {
    coding: [
        { title: "Environment Setup & Hello World", description: "Install the language runtime/SDK, setup VS Code, and write your first Hello World program.", hint: "Check official documentation for installation steps. Use 'print' or 'console.log'." },
        { title: "Understanding Variables & Data Types", description: "Learn about Integers, Floats, Strings, Booleans, and how to store data in variables.", hint: "Try creating variables for your name, age, and height." },
        { title: "Mastering Operators & Logic", description: "Practice arithmetic (+, -, *, /) and comparison (==, >, <) operators.", hint: "Combine operators: (5 + 3) > 10." },
        { title: "Control Flow: Conditionals", description: "Use If/Else statements to make decisions in your code.", hint: "Write a program that checks if a number is even or odd." },
        { title: "Control Flow: Loops & Iteration", description: "Automate repetitive tasks using For and While loops.", hint: "Print numbers from 1 to 10 using a loop." },
        { title: "Functions: Writing Reusable Code", description: "Define functions to begin organizing your logic.", hint: "Create a function 'add(a, b)' that returns the sum." },
        { title: "Data Structures: Arrays & Lists", description: "Store collections of items using Arrays/Lists.", hint: "Create a grocery list array and print the second item." },
        { title: "Data Structures: Dictionaries & Maps", description: "Store key-value pairs (e.g., user profiles).", hint: "Create a 'user' object with name and email properties." },
        { title: "String Manipulation Techniques", description: "Learn slicing, splitting, helping methods (upper, lower, replace).", hint: "Write a function to reverse a string." },
        { title: "File Input/Output Operations", description: "Read from and write to text files.", hint: "Create a 'log.txt' and write the current date to it." },
    ],
    music: [
        { title: "Instrument Anatomy & Maintenance", description: "Learn the parts of your instrument and how to care for it (tuning, cleaning).", hint: "Watch a diagram walkthrough on YouTube." },
        { title: "Posture & Hand Positioning", description: "Establish correct physical form to prevent injury and improve tone.", hint: "Keep your back straight and wrists relaxed." },
        { title: "Basic Music Theory & Notes", description: "Understand the musical alphabet (A-G) and basic scale steps.", hint: "Memorize the notes on the open strings/keys." },
        { title: "Reading Sheet Music/Tabs", description: "Learn to read standard notation or tablature for your instrument.", hint: "Find a simple song tab (e.g., Happy Birthday) and read it." },
        { title: "Major Scale Fundamentals", description: "Practice the Major scale pattern. It's the foundation of Western music.", hint: "Start slow using a metronome." },
        { title: "Basic Chords: Major & Minor", description: "Learn the 3-4 essential open chords (C, G, D, Am, Em).", hint: "Focus on clean finger placement; ensure all strings ring out." },
        { title: "Rhythm & Strumming Patterns", description: "Practice basic 4/4 strumming or rhythm counting.", hint: "Count out loud: '1 & 2 & 3 & 4 &'." },
        { title: "Fingerstyle/Picking Techniques", description: "Develop independence in your right hand (plucking or picking).", hint: "Try playing a simple arpeggio pattern." },
        { title: "Ear Training: Identifying Intervals", description: "Train your ear to recognize the distance between two notes.", hint: "Use an ear training app like Tenuto." },
        { title: "Playing Your First Song", description: "Combine chords and rhythm to play a complete song.", hint: "Pick a 3-chord song (e.g., 'Knockin' on Heaven's Door')." },
    ],
    // Simplified backups for brevity in this refactor, but structure is supported
    art: [
        { title: "Materials & Workspace Setup", description: "Organize your drawing/painting area and understand your tools.", hint: "Ensure good lighting and comfortable seating." },
        { title: "Line Control & Dexterity", description: "Practice drawing straight lines, curves, and circles without strict measurement.", hint: "Draw pages of parallel hatching lines." },
        { title: "Understanding Shapes & Form", description: "Break down complex objects into simple cubes, spheres, and cylinders.", hint: "Draw everyday objects as basic 3D shapes." },
        { title: "Value & Shading Fundamentals", description: "Learn to render light and shadow to create depth.", hint: "Create a 5-step value scale from white to black." },
        { title: "Perspective: 1-Point & 2-Point", description: "Create the illusion of depth using vanishing points.", hint: "Draw a simple city street or room interior." },
    ],
    language: [
        { title: "Alphabet & Pronunciation Basics", description: "Master the sounds and script of the target language.", hint: "Record yourself and compare with native speakers." },
        { title: "Essential Greetings & Intros", description: "Learn to say 'Hello', 'My name is...', and 'How are you?'.", hint: "Practice introducing yourself to a mirror." },
        { title: "Numbers, Days, & Time", description: "Learn counting, days of the week, and telling time.", hint: "Change your phone calendar setting to the target language." },
        { title: "Basic Sentence Structure (SVO)", description: "Understand Subject-Verb-Object order.", hint: "Write 5 simple sentences about your day." },
        { title: "Present Tense Conjugation", description: "Learn how to modify verbs for I, You, He/She.", hint: "create a conjugation table for regular verbs." },
    ],
    fitness: [
        { title: "Baseline Fitness Assessment", description: "Test your current max pushups, run time, or flexibility.", hint: "Record the numbers to track progress later." },
        { title: "Mobility & Dynamic Warmup", description: "Learn a 5-10 minute warmup routine to prevent injury.", hint: "Focus on hips, shoulders, and spine." },
        { title: "Cardiovascular Endurance Basics", description: "Complete a steady-state cardio session (Run/Bike/Row).", hint: "Keep your heart rate in Zone 2 (conversational)." },
        { title: "Upper Body Strength Fundamentals", description: "Practice Pushups, Pullups, or Overhead Press form.", hint: "Focus on controlling the negative (lowering) phase." },
        { title: "Lower Body Strength Fundamentals", description: "Practice Squats and Lunges with perfect form.", hint: "Keep your chest up and knees aligned with toes." },
    ],
    general: [
        { title: "Defining Clear Success Metrics", description: "Determine exactly what 'success' looks like for this goal.", hint: "Make it SMART (Specific, Measurable, Achievable, Relevant, Time-bound)." },
        { title: "Resource Gathering & Setup", description: "Collect all books, tools, or software needed.", hint: "Organize them in a dedicated physical or digital space." },
        { title: "Foundational Knowledge Study", description: "Read the intro chapters or watch primer videos.", hint: "Take notes on key concepts, not everything." },
        { title: "Initial Practical Application", description: "Try to do the 'Hello World' equivalent of your skill.", hint: "Expect to fail; focus on the process." },
        { title: "Feedback Loop & Adjustment", description: "Review your first attempt and identify 1 thing to improve.", hint: "Be honest about what went wrong." },
    ]
};

const SAFETY_BLOCKLIST = [
    "kill", "murder", "suicide", "bomb", "hack", "illegal", "drug", "cocaine", "heroin", "meth", "steal", "rob",
    "kidnap", "terror", "weapon", "gun", "cheat", "scam", "fraud", "crash", "destroy", "abuse", "harm", "dead"
];

export async function createGoal(prevState: CreateGoalState, formData: FormData) {
    const prisma = await getPrisma();
    const user = await getOrCreateUser();

    if (!user) {
        return { message: "Authentication required", errors: { permission: ["Login required."] } };
    }

    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        type: formData.get("type"),
        deadline: formData.get("deadline"),
    };

    const validatedFields = CreateGoalSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors, message: "Missing fields." };
    }

    const { title, description, type, deadline } = validatedFields.data;
    const titleLower = title.toLowerCase();
    const descLower = (description || "").toLowerCase();

    // 1. Safety Check
    const isUnsafe = SAFETY_BLOCKLIST.some(word => titleLower.includes(word) || descLower.includes(word));
    if (isUnsafe) {
        redirect("/dashboard/goal-rejected");
    }

    // 2. Feasibility Check (Heuristic)
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = Math.abs(deadlineDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Example: "Master" in < 3 days
    if (diffDays < 3 && (titleLower.includes("master") || titleLower.includes("expert") || titleLower.includes("fluent"))) {
        redirect("/dashboard/goal-rejected");
    }

    // Cap at 60 levels
    const totalLevels = Math.min(Math.max(diffDays, 1), 60);

    // 3. Select Curriculum
    let selectedCurriculum = CURRICULA.general;

    // Improved Matching Logic
    if (titleLower.includes("code") || titleLower.includes("python") || titleLower.includes("java") || titleLower.includes("react") || titleLower.includes("dev") || titleLower.includes("program")) {
        selectedCurriculum = CURRICULA.coding;
    } else if (titleLower.includes("music") || titleLower.includes("guitar") || titleLower.includes("piano") || titleLower.includes("drum") || titleLower.includes("sing") || titleLower.includes("instrument")) {
        selectedCurriculum = CURRICULA.music;
    } else if (titleLower.includes("art") || titleLower.includes("draw") || titleLower.includes("paint") || titleLower.includes("design") || titleLower.includes("sketch")) {
        selectedCurriculum = CURRICULA.art;
    } else if (titleLower.includes("spanish") || titleLower.includes("french") || titleLower.includes("german") || titleLower.includes("japanese") || titleLower.includes("language")) {
        selectedCurriculum = CURRICULA.language;
    } else if (titleLower.includes("fit") || titleLower.includes("gym") || titleLower.includes("weight") || titleLower.includes("run") || titleLower.includes("muscle") || titleLower.includes("train")) {
        selectedCurriculum = CURRICULA.fitness;
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Create Goal
            const newGoal = await tx.goal.create({
                data: {
                    userId: user.id,
                    title,
                    description: description || "",
                    type,
                    deadline: deadlineDate,
                    status: "ACTIVE",
                },
            });

            // Batch Create Levels
            for (let i = 1; i <= totalLevels; i++) {
                const template = selectedCurriculum[(i - 1) % selectedCurriculum.length];
                const fullTitle = `L${i}: ${template.title}`;

                await tx.task.create({
                    data: {
                        goalId: newGoal.id,
                        title: fullTitle,
                        description: template.description,
                        hints: template.hint,
                        date: new Date(),
                        dayIndex: i,
                        state: i === 1 ? "ACTIVE" : "LOCKED"
                    }
                });
            }
        });
    } catch (error) {
        return { message: "Database Error: Failed to create goal path." };
    }

    revalidatePath("/dashboard");
    return { message: "Goal created successfully" }
}

export async function terminateGoal(goalId: string) {
    const prisma = await getPrisma();
    const user = await getOrCreateUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const goal = await prisma.goal.findUnique({
        where: { id: goalId },
    });

    if (!goal || goal.userId !== user.id) {
        throw new Error("Goal not found or unauthorized");
    }

    await prisma.goal.update({
        where: { id: goalId },
        data: { status: "ARCHIVED" },
    });

    revalidatePath("/dashboard");
}
