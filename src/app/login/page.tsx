
import { DynamicLoginFormWrapper } from "@/components/auth/DynamicLoginFormWrapper";

export default function LoginPage() {
    return (
        <main className="flex items-center justify-center min-h-screen bg-muted/40">
            <DynamicLoginFormWrapper />
        </main>
    );
}
