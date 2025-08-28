
import { DynamicLoginFormWrapper } from '@/components/auth/DynamicLoginFormWrapper';
import { Logo } from '@/components/icons/Logo';
import Image from 'next/image';
import { ShieldCheck, Lock, DatabaseZap } from 'lucide-react';


export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center justify-center gap-4">
            <Logo className="h-24" />
            <div className="text-center">
                <h1 className="text-3xl font-bold text-primary">
                    Welcome to TradeHunter <span className="text-accent">Pro</span>
                </h1>
                <p className="mt-1 text-muted-foreground">DOMINATE YOUR TERRITORY</p>
            </div>
        </div>
        
        <div className="rounded-lg border bg-card p-8 shadow-lg">
           <DynamicLoginFormWrapper />
        </div>

        <div className="flex justify-center items-center gap-4 py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <span className="text-xs font-semibold">Cyber Security</span>
            </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-5 w-5 text-green-500" />
                <span className="text-xs font-semibold">SSL Certified</span>
            </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <DatabaseZap className="h-5 w-5 text-green-500" />
                <span className="text-xs font-semibold">Data Protection</span>
            </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
           &copy; {new Date().getFullYear()} TradeHunter Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
