import { HeroSection } from "@/components/landing/hero";
import { MissionSimulation } from "@/components/landing/mission-simulation";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { MarketplaceSection } from "@/components/landing/marketplace";
import { CurrencySection } from "@/components/landing/currency";
import { PowerUpsSection } from "@/components/landing/powerups";
import { CommunitySection, TestimonialsSection, FinalCTA, Footer } from "@/components/landing/sections";
import { MouseFollower } from "@/components/landing/animations";

export const metadata = {
    title: "ACTIFY — The AI Execution Operating System",
    description: "The world's first AI Execution Operating System. Turn any goal into an AI-generated mission with adaptive execution, proof verification, and verified learning journeys.",
};

export default function Home() {
    return (
        <div className="relative overflow-hidden" style={{ background: "#090909", color: "#ffffff" }}>
            <MouseFollowerWrapper />
            <HeroSection />
            <MissionSimulation />
            <HowItWorks />
            <DashboardPreview />
            <MarketplaceSection />
            <CurrencySection />
            <PowerUpsSection />
            <CommunitySection />
            <TestimonialsSection />
            <FinalCTA />
            <Footer />
        </div>
    );
}

// Client wrapper for mouse follower
function MouseFollowerWrapper() {
    return <MouseFollower />;
}
