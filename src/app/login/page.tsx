
import { DynamicLoginFormWrapper } from '@/components/auth/DynamicLoginFormWrapper';
import { Logo } from '@/components/icons/Logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
            {/* Using a modified Logo component that fits the login page style */}
            <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-3 p-4 rounded-full bg-primary/10 border border-primary/20">
                    <Logo width={40} height={40} className="[&>div>span]:hidden text-primary" />
                </div>
                 <h1 className="text-3xl font-bold text-primary">TradeHunter Pro</h1>
            </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6 shadow-lg">
           <h2 className="mb-1 text-xl font-semibold text-center text-foreground">Welcome Back</h2>
           <p className="mb-6 text-center text-sm text-muted-foreground">Sign in to access your branch portal</p>
           <DynamicLoginFormWrapper />
        </div>

        <p className="text-center text-xs text-muted-foreground">
           &copy; {new Date().getFullYear()} TradeHunter Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
