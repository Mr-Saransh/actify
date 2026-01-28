"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";
import { GoalType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateGoal, detectDomain, calculateTaskCount } from "@/lib/goal-validator";

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
        validation?: string[]; // New: specific validation errors
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
        // BEGINNER (L1-3): Setup & Fundamentals
        { title: "Environment Setup & Hello World", description: "Install the language runtime/SDK, setup VS Code, and write your first Hello World program.", hint: "Check official documentation for installation steps. Use 'print' or 'console.log'." },
        { title: "Understanding Variables & Data Types", description: "Learn about Integers, Floats, Strings, Booleans, and how to store data in variables.", hint: "Try creating variables for your name, age, and height." },
        { title: "Mastering Operators & Logic", description: "Practice arithmetic (+, -, *, /) and comparison (==, >, <) operators.", hint: "Combine operators: (5 + 3) > 10." },
        // INTERMEDIATE (L4-7): Control Flow & Functions
        { title: "Control Flow: Conditionals", description: "Use If/Else statements to make decisions in your code.", hint: "Write a program that checks if a number is even or odd." },
        { title: "Control Flow: Loops & Iteration", description: "Automate repetitive tasks using For and While loops.", hint: "Print numbers from 1 to 10 using a loop." },
        { title: "Functions: Writing Reusable Code", description: "Define functions to begin organizing your logic.", hint: "Create a function 'add(a, b)' that returns the sum." },
        { title: "Working with Arrays & Lists", description: "Store collections of items using Arrays/Lists and iterate through them.", hint: "Create a grocery list array and calculate total items." },
        // ADVANCED (L8-11): Data Structures & File I/O
        { title: "Dictionaries & Key-Value Pairs", description: "Store complex data using objects/dictionaries (e.g., user profiles).", hint: "Create a 'user' object with name, email, and age properties." },
        { title: "String Manipulation & Methods", description: "Learn slicing, splitting, and string methods (upper, lower, replace).", hint: "Write a function to count vowels in a string." },
        { title: "File Input/Output Operations", description: "Read from and write to text files for data persistence.", hint: "Create a 'log.txt' and write timestamped entries." },
        { title: "Error Handling & Debugging", description: "Use try/catch blocks and debugging techniques to handle errors gracefully.", hint: "Add error handling to your file I/O code." },
        // CONCLUSION (L12): Integration & Review
        { title: "Final Project: Mini Application", description: "Build a complete mini-application combining variables, functions, loops, and file I/O. (e.g., simple task tracker, calculator with history)", hint: "Use everything you've learned. Test edge cases and add comments." },
    ],
    music: [
        // BEGINNER (L1-3): Setup & Basic  Theory
        { title: "Instrument Anatomy & Care", description: "Learn the parts of your instrument and basic maintenance (tuning, cleaning).", hint: "Watch a beginner tutorial. Handle with care." },
        { title: "Posture & Hand Positioning", description: "Establish correct physical form to prevent injury and improve tone.", hint: "Keep your back straight and wrists relaxed." },
        { title: "Music Theory Basics: Notes & Scales", description: "Understand the musical alphabet (A-G) and the C Major scale.", hint: "Memorize the notes on your instrument." },
        // INTERMEDIATE (L4-7): Reading & Basic Chords
        { title: "Reading Sheet Music/Tabs", description: "Learn to read basic notation or tablature for your instrument.", hint: "Start with a simple melody like 'Mary Had a Little Lamb'." },
        { title: "Essential Chords: Major & Minor", description: "Master 3-4 Open chords (C, G, D, Am).", hint: "Practice transitions slowly, focus on clean sound." },
        { title: "Rhythm & Strumming Fundamentals", description: "Practice basic 4/4 rhythm and simple strumming patterns.", hint: "Use a metronome. Count: '1 & 2 & 3 & 4 &'." },
        { title: "Chord Progressions & Changes", description: "Practice smooth transitions between chords in common progressions (C-G-Am-F).", hint: "Start slow, gradually increase speed." },
        // ADVANCED (L8-11): Techniques & Ear Training
        { title: "Fingerstyle & Advanced Picking", description: "Develop finger independence for arpeggios and fingerstyle patterns.", hint: "Try a classical fingerstyle exercise." },
        { title: "Bar Chords & Extended Techniques", description: "Learn movable bar chord shapes and advanced techniques.", hint: "Start with F major bar chord. Build finger strength." },
        { title: "Ear Training & Improvisation", description: "Identify intervals by ear and try improvising over backing tracks.", hint: "Use ear training apps. Start with simple melodies." },
        { title: "Music Theory II: Scales & Modes", description: "Learn minor scales, pentatonic scales, and basic modes.", hint: "Practice each scale across the fretboard/keys." },
        // CONCLUSION (L12): Performance
        { title: "Final Performance: Complete Song", description: "Perform a full song from memory with proper technique, rhythm, and expression.", hint: "Record yourself. Focus on smooth transitions and musicality." },
    ],
    // Simplified backups for brevity in this refactor, but structure is supported
    art: [
        // BEGINNER (L1-3): Tools & Lines
        { title: "Materials & Workspace Setup", description: "Organize your drawing area and understand your tools (pencils, erasers, paper).", hint: "Good lighting is essential. Start with HB pencil." },
        { title: "Line Control & Basic Strokes", description: "Practice drawing straight lines, curves, and circles freehand.", hint: "Fill pages with parallel lines. Focus on smooth motion." },
        { title: "Understanding Basic Shapes", description: "Draw circles, squares, triangles. Break objects into simple shapes.", hint: "Everything is made of basic shapes." },
        // INTERMEDIATE (L4-7): Form & Value
        { title: "3D Forms: Cubes, Spheres, Cylinders", description: "Transform 2D shapes into 3D forms using construction lines.", hint: "Draw a box, sphere, and cylinder from different angles." },
        { title: "Value & Shading Techniques", description: "Learn to create value scales and shade forms to show depth.", hint: "Create a 5-step value scale from white to black." },
        { title: "Light & Shadow Fundamentals", description: "Understand highlights, midtones, core shadows, and cast shadows.", hint: "Shade a sphere with a single light source." },
        { title: "Texture & Surface Quality", description: "Practice rendering different textures (wood, metal, fabric).", hint: "Study reference photos. Vary pencil pressure." },
        // ADVANCED (L8-11): Perspective & Composition
        { title: "1-Point Perspective Basics", description: "Create depth using a single vanishing point (hallways, roads).", hint: "Draw a simple room interior with furniture." },
        { title: "2-Point Perspective", description: "Draw buildings and objects using two vanishing points.", hint: "Sketch a city street corner." },
        { title: "Composition & Visual Balance", description: "Learn rule of thirds, focal points, and creating balanced compositions.", hint: "Thumbnail sketches help plan compositions." },
        { title: "Anatomy Basics: Proportions", description: "Study basic human/animal proportions and simplified anatomy.", hint: "Start with stick figures, add basic volumes." },
        // CONCLUSION (L12): Complete Artwork
        { title: "Final Project: Complete Drawing", description: "Create a finished drawing combining form, shading, perspective, and composition.", hint: "Work from reference. Take your time. Show your best work." },
    ],
    language: [
        // BEGINNER (L1-4): Alphabet & Basics
        { title: "Alphabet & Pronunciation", description: "Master the sounds and writing system of the target language.", hint: "Record yourself and compare with native audio." },
        { title: "Essential Greetings & Introductions", description: "Learn 'Hello', 'My name is...', 'How are you?', 'Thank you'.", hint: "Practice daily. Introduce yourself to a mirror." },
        { title: "Numbers, Days, & Time", description: "Count to 100, learn days/months, tell time.", hint: "Change phone to target language for practice." },
        { title: "Basic Nouns & Common Words", description: "Learn 50-100 essential nouns (family, food, home, colors).", hint: "Use flashcards or a spaced repetition app." },
        // INTERMEDIATE (L5-8): Grammar & Sentences
        { title: "Sentence Structure (SVO)", description: "Understand word order: Subject-Verb-Object.", hint: "Write 10 simple sentences about your day." },
        { title: "Present Tense Conjugation", description: "Conjugate regular verbs for I, you, he/she, we, they.", hint: "Create conjugation tables. Practice daily." },
        { title: "Basic Questions & Answers", description: "Form questions using Who, What, Where, When, Why, How.", hint: "Practice asking and answering about daily routines." },
        { title: "Adjectives & Descriptions", description: "Describe people, places, and things using common adjectives.", hint: "Describe your room in the target language." },
        // ADVANCED (L9-12): Conversation & Past Tense
        { title: "Past Tense & Storytelling", description: "Learn past tense conjugations. Tell simple stories about yesterday.", hint: "Write a diary entry about your weekend." },
        { title: "Future Tense & Plans", description: "Express future intentions and plans.", hint: "Describe your goals for next week." },
        { title: "Conversational Practice", description: "Hold basic conversations about common topics (weather, hobbies, family).", hint: "Find a language exchange partner or tutor." },
        // CONCLUSION (L13): Assessment
        { title: "Final Assessment: Real Conversation", description: "Have a 5-10 minute conversation covering greetings, introductions, and daily life.", hint: "Record yourself. Show off everything you've learned!" },
    ],
    fitness: [
        // BEGINNER (L1-3): Assessment & Warm-up
        { title: "Baseline Fitness Assessment", description: "Test your current max pushups, 1-mile run time, and flexibility.", hint: "Record numbers. Don't push to injury." },
        { title: "Mobility & Dynamic Warm-up", description: "Learn a 10-minute dynamic warm-up routine to prevent injury.", hint: "Focus on hips, shoulders, ankles. Do before every workout." },
        { title: "Bodyweight Basics: Form Focus", description: "Master correct form for squats, pushups, and planks.", hint: "Quality over quantity. Film yourself to check form." },
        // INTERMEDIATE (L4-7): Strength Foundation
        { title: "Upper Body Strength I", description: "Build pushup and pulling strength. Practice incline/decline variations.", hint: "Aim for 3 sets of max reps with good form." },
        { title: "Lower Body Strength I", description: "Practice squats, lunges, and step-ups with bodyweight.", hint: "Full range of motion. Chest up, knees out." },
        { title: "Core Strength & Stability", description: "Build a strong core with planks, dead bugs, and hollow holds.", hint: "Brace your core, don't let lower back arch." },
        { title: "Cardiovascular Endurance I", description: "Complete 20-30min steady cardio (running, cycling, rowing).", hint: "Stay in Zone 2 (can hold a conversation)." },
        // ADVANCED (L8-11): Progressive Overload
        { title: "Upper Body Strength II", description: "Add difficulty: close-grip pushups, archer pushups, or add weight.", hint: "Progressive overload: increase reps or difficulty weekly." },
        { title: "Lower Body Strength II", description: "Progress to jump squats, Bulgarian split squats, pistol squat progressions.", hint: "Land softly. Control the eccentric." },
        { title: "High-Intensity Interval Training", description: "Complete a HIIT workout: 30s work, 30s rest for 10-15 minutes.", hint: "Push hard during work intervals. True max effort." },
        { title: "Flexibility & Recovery", description: "Learn static stretching and foam rolling routines for recovery.", hint: "Hold each stretch 30-60s. Breathe deeply." },
        // CONCLUSION (L12): Final Test
        { title: "Final Assessment & Progress Review", description: "Retest your initial baselines. Compare progress and set new goals.", hint: "Celebrate improvements! Set your next challenge." },
    ],
    general: [
        // BEGINNER (L1-2): Planning & Setup
        { title: "Defining Clear Success Metrics", description: "Determine exactly what 'success' looks like for this goal.", hint: "Make it SMART (Specific, Measurable, Achievable, Relevant, Time-bound)." },
        { title: "Resource Gathering & Environment Setup", description: "Collect all books, tools, software, or materials needed.", hint: "Organize everything in a dedicated workspace." },
        // INTERMEDIATE (L3-4): Learning & Practice
        { title: "Foundational Knowledge Study", description: "Study core concepts through books, courses, or tutorials.", hint: "Take notes on key principles. Don't just consume passively." },
        { title: "Initial Practical Application", description: "Try the 'Hello World' equivalent  - your first hands-on attempt.", hint: "Expect mistakes. Focus on learning, not perfection." },
        // ADVANCED (L5-6): Refinement & Feedback
        { title: "Deliberate Practice & Iteration", description: "Practice with focused intensity on weak areas. Track progress.", hint: "Quality practice beats quantity. Stay consistent." },
        { title: "Feedback Loop & Course Correction", description: "Get feedback from mentors/peers. Identify gaps and adjust approach.", hint: "Be honest about weaknesses. Ask for help." },
        // CONCLUSION (L7): Final Project
        { title: "Final Project & Knowledge Integration", description: "Complete a capstone project demonstrating all learned skills.", hint: "Show off what you can do. Document your process." },
    ]
};

const SAFETY_BLOCKLIST = [
    "kill", "murder", "suicide", "bomb", "hack", "illegal", "drug", "cocaine", "heroin", "meth", "steal", "rob",
    "kidnap", "terror", "weapon", "gun", "cheat", "scam", "fraud", "crash", "destroy", "abuse", "harm", "dead"
];

export async function createGoal(prevState: CreateGoalState, formData: FormData) {
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
        return {
            errors: { validation: ["This goal contains unsafe content and cannot be created."] },
            message: "Goal rejected for safety reasons."
        };
    }

    // 2. Calculate timeline
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = Math.abs(deadlineDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 3. Validate goal feasibility
    const validation = validateGoal(title, type, diffDays);

    if (!validation.isValid) {
        return {
            errors: { validation: [validation.error || "Goal validation failed."] },
            message: "Please adjust your goal timeline or description."
        };
    }

    // 4. Detect domain and calculate appropriate task count
    const domain = validation.domain || detectDomain(title);
    const totalLevels = calculateTaskCount(diffDays, domain);

    // 5. Select curriculum based on detected domain
    let selectedCurriculum = CURRICULA.general;

    if (domain === 'coding') {
        selectedCurriculum = CURRICULA.coding;
    } else if (domain === 'music') {
        selectedCurriculum = CURRICULA.music;
    } else if (domain === 'art') {
        selectedCurriculum = CURRICULA.art;
    } else if (domain === 'language') {
        selectedCurriculum = CURRICULA.language;
    } else if (domain === 'fitness') {
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

            // Batch Create All Tasks at Once (Much Faster)
            const tasksData = [];
            for (let i = 1; i <= totalLevels; i++) {
                const template = selectedCurriculum[(i - 1) % selectedCurriculum.length];
                const fullTitle = `L${i}: ${template.title}`;

                tasksData.push({
                    goalId: newGoal.id,
                    title: fullTitle,
                    description: template.description,
                    hints: template.hint,
                    date: new Date(),
                    dayIndex: i,
                    state: (i === 1 ? "ACTIVE" : "LOCKED") as "ACTIVE" | "LOCKED"
                });
            }

            // Single batch insert instead of N individual inserts
            await tx.task.createMany({
                data: tasksData
            });
        });
    } catch (error) {
        console.error("Goal creation error:", error);
        return { message: "Database Error: Failed to create goal path." };
    }

    revalidatePath("/dashboard");
    return { message: "Goal created successfully" }
}

export async function terminateGoal(goalId: string) {
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
