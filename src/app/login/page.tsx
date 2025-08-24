
import { DynamicLoginFormWrapper } from '@/components/auth/DynamicLoginFormWrapper';
import { Logo } from '@/components/icons/Logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center justify-center gap-4">
            <Logo className="h-20" />
            <div className="text-center">
                <h1 className="text-3xl font-bold text-primary">
                    Welcome to TradeHunter <span className="text-accent">Pro</span>
                </h1>
                <p className="mt-1 text-muted-foreground">Sign in to your branch account</p>
            </div>
        </div>
        
        <div className="rounded-lg border bg-card p-8 shadow-lg">
           <DynamicLoginFormWrapper />
        </div>

        <p className="text-center text-xs text-muted-foreground">
           &copy; {new Date().getFullYear()} TradeHunter Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
