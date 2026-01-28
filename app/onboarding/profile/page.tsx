import { getOrCreateUser } from "@/app/actions/user";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";

export default async function OnboardingProfilePage() {
    const user = await getOrCreateUser();

    if (!user) {
        // Should rely on Clerk middleware really, but safe fallback
        return <div>Loading...</div>;
    }

    // If user already has a name, redirect to dashboard?
    if (user.name) {
        redirect("/dashboard");
    }

    return (
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">👤</span>
                </div>
                <CardTitle className="text-2xl">Identify Yourself</CardTitle>
                <CardDescription>
                    To participate in the Actify enforcement protocol, you must register your identity details.
                </CardDescription>
            </CardHeader>
            <ProfileForm userEmail={user.email} />
        </Card>
    );
}
