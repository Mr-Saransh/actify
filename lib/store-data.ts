export type StoreItem = {
    id: string;
    name: string;
    description: string;
    cost: number;
    category: "POWER-UP" | "MERCH" | "RESOURCE";
    icon: string;
    action: "FREEZE" | "BEYOND" | "NONE";
};

export const STORE_ITEMS: StoreItem[] = [
    {
        id: "freeze-1",
        name: "Freeze ACT",
        description: "Pause your goal for 24h without losing your streak or incurring failure penalties.",
        cost: 150,
        category: "POWER-UP",
        action: "FREEZE",
        icon: "❄️"
    },
    {
        id: "beyond-1",
        name: "Beyond ACT",
        description: "Bypass the daily task limit and complete one extra task today.",
        cost: 300,
        category: "POWER-UP",
        action: "BEYOND",
        icon: "⚡"
    },
    {
        id: "res-1",
        name: "UI/UX Starter Kit",
        description: "Figma templates and component libraries for modern SaaS design.",
        cost: 250,
        category: "RESOURCE",
        action: "NONE",
        icon: "🎨"
    },
    {
        id: "res-2",
        name: "System Design Guide",
        description: "Comprehensive PDF guide to cracking system design interviews.",
        cost: 400,
        category: "RESOURCE",
        action: "NONE",
        icon: "📐"
    },
    {
        id: "merch-1",
        name: "Execution OS Mousepad",
        description: "Premium desk mat with the ACTIFY Execution OS grid design.",
        cost: 1200,
        category: "MERCH",
        action: "NONE",
        icon: "🖱️"
    },
    {
        id: "merch-2",
        name: "ACTIFY Hoodie",
        description: "Black premium hoodie with minimalist ACTIFY branding.",
        cost: 2500,
        category: "MERCH",
        action: "NONE",
        icon: "👕"
    }
];
