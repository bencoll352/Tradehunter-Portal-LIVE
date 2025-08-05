
import { DynamicLoginFormWrapper } from '@/components/auth/DynamicLoginFormWrapper';
import { Database } from 'lucide-react'; // Changed from Logo

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 border border-primary/20">
                <Database className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-primary">TradeHunter Pro Portal</h1>
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
