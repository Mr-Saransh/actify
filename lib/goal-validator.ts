/**
 * Goal Validation & Feasibility Logic
 * Ensures goals are realistic, specific, and generate meaningful task breakdowns
 */

export type GoalValidationResult = {
    isValid: boolean;
    error?: string;
    domain?: string;
    minimumDays?: number;
    minimumTasks?: number;
};

// Domain-specific minimum timeline requirements (in days)
const DOMAIN_MIN_DAYS = {
    coding: 10,
    music: 14,
    language: 21,
    art: 7,
    fitness: 14,
    general: 5,
} as const;

// Goal type minimum task requirements
const TYPE_MIN_TASKS = {
    SKILL: 7,
    PROJECT: 5,
    EXAM: 10,
} as const;

// Keywords that indicate skill acquisition (requires longer timelines)
const LEARNING_KEYWORDS = [
    'learn', 'master', 'study', 'understand', 'fluent', 'proficient',
    'acquire', 'develop', 'practice', 'train', 'improve'
];

// Domain detection keywords
const DOMAIN_KEYWORDS = {
    coding: ['code', 'python', 'java', 'javascript', 'react', 'dev', 'program', 'software', 'web', 'app'],
    music: ['music', 'guitar', 'piano', 'drum', 'sing', 'instrument', 'play', 'melody'],
    art: ['art', 'draw', 'paint', 'design', 'sketch', 'illustrate', 'create'],
    language: ['spanish', 'french', 'german', 'japanese', 'chinese', 'arabic', 'language', 'speak', 'fluent'],
    fitness: ['fit', 'gym', 'weight', 'run', 'muscle', 'train', 'exercise', 'workout', 'athlete'],
};

/**
 * Detect goal domain based on title keywords
 */
export function detectDomain(title: string): keyof typeof DOMAIN_MIN_DAYS {
    const titleLower = title.toLowerCase();

    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
        if (keywords.some(keyword => titleLower.includes(keyword))) {
            return domain as keyof typeof DOMAIN_MIN_DAYS;
        }
    }

    return 'general';
}

/**
 * Check if goal contains learning/skill acquisition keywords
 */
function isSkillAcquisitionGoal(title: string): boolean {
    const titleLower = title.toLowerCase();
    return LEARNING_KEYWORDS.some(keyword => titleLower.includes(keyword));
}

/**
 * Validate goal feasibility and specificity
 */
export function validateGoal(
    title: string,
    type: 'SKILL' | 'PROJECT' | 'EXAM',
    deadlineDays: number
): GoalValidationResult {
    const titleLower = title.toLowerCase();

    // 1. Check for vague/too short goals
    if (title.length < 10) {
        return {
            isValid: false,
            error: 'Goal is too vague. Please be more specific about what you want to achieve.',
        };
    }

    // 2. Detect domain
    const domain = detectDomain(title);
    const domainMinDays = DOMAIN_MIN_DAYS[domain];

    // 3. Check for skill acquisition goals with insufficient timeline
    if (isSkillAcquisitionGoal(title)) {
        if (deadlineDays < 10) {
            return {
                isValid: false,
                error: `Skill acquisition requires a realistic timeline. Minimum 10 days needed for meaningful progress.`,
                minimumDays: 10,
            };
        }
    }

    // 4. Domain-specific timeline validation
    if (domain !== 'general' && deadlineDays < domainMinDays) {
        const domainName = domain.charAt(0).toUpperCase() + domain.slice(1);
        return {
            isValid: false,
            error: `${domainName} goals require at least ${domainMinDays} days to break down into actionable tasks.`,
            domain,
            minimumDays: domainMinDays,
        };
    }

    // 5. Type-specific task count validation
    const typeMinTasks = TYPE_MIN_TASKS[type];
    if (deadlineDays < typeMinTasks) {
        return {
            isValid: false,
            error: `${type} goals need at least ${typeMinTasks} days to create a meaningful learning path.`,
            minimumTasks: typeMinTasks,
        };
    }

    // 6. Check for overly ambitious goals with short timelines
    const ambitiousWords = ['master', 'expert', 'fluent', 'advanced', 'professional'];
    const hasAmbitiousWord = ambitiousWords.some(word => titleLower.includes(word));

    if (hasAmbitiousWord && deadlineDays < 30) {
        return {
            isValid: false,
            error: 'Mastery and expertise require sustained effort. Please allow at least 30 days.',
            minimumDays: 30,
        };
    }

    // All validations passed
    return {
        isValid: true,
        domain,
    };
}

/**
 * Calculate recommended task count based on timeline and domain
 */
export function calculateTaskCount(deadlineDays: number, domain: string): number {
    // Cap between minimum and maximum
    const baseCount = Math.min(Math.max(deadlineDays, 5), 60);

    // For skill-based domains, ensure minimum viable curriculum
    if (domain !== 'general' && baseCount < 10) {
        return 10;
    }

    return baseCount;
}
