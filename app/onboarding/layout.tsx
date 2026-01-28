export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                {children}
            </div>
        </div>
    );
}
