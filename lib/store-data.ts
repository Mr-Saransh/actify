export type StoreItem = {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: "POWERUP" | "MERCH" | "RESOURCE";
    icon: string;
    action: "FREEZE" | "BEYOND" | "NONE";
};

export const STORE_ITEMS: StoreItem[] = [
    {
        id: "freeze_01",
        name: "Liquid Nitrogen Freeze",
        description: "Forgives one full day of failure. Automatically consumed.",
        cost: 15,
        type: "POWERUP",
        icon: "/liquid-freeze.png",
        action: "FREEZE"
    },
    {
        id: "beyond_01",
        name: "Beyond ACT",
        description: "Instantly unlocks the next task, ignoring daily limits.",
        cost: 10,
        type: "POWERUP",
        icon: "/beyond-act.png",
        action: "BEYOND"
    },
    // Merch Placeholders
    {
        id: "merch_hoodie",
        name: "Actify Operator Tee",
        description: "Premium cotton tee with Actify branding. Execute or Fail.",
        cost: 500,
        type: "MERCH",
        icon: "/actify-tshirt.png",
        action: "NONE"
    },
    {
        id: "merch_sticker",
        name: "Holographic Sticker Pack",
        description: "5x Die-cut holographic stickers. Execute or Fail branding.",
        cost: 50,
        type: "MERCH",
        icon: "/actify-sticker.jpg",
        action: "NONE"
    }
];
