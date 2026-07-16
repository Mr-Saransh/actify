import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <SignUp appearance={{
                elements: {
                    rootBox: "mx-auto",
                    card: "bg-card border-border shadow-xl",
                    headerTitle: "text-foreground",
                    headerSubtitle: "text-muted-foreground",
                    socialButtonsBlockButton: "border-border text-foreground hover:bg-secondary",
                    socialButtonsBlockButtonText: "text-foreground",
                    dividerLine: "bg-border",
                    dividerText: "text-muted-foreground",
                    formFieldLabel: "text-foreground",
                    formFieldInput: "bg-background border-border text-foreground focus:ring-primary",
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                    footerActionText: "text-muted-foreground",
                    footerActionLink: "text-primary hover:text-primary/90",
                }
            }} />
        </div>
    );
}
