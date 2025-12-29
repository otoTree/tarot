import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, sendVerificationCode } = useAuthStore();
  const { language } = useStore();
  const t = getTranslation(language);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('invite');
      if (code) {
        setInviteCode(code);
      }
    }
  }, []);

  const handleSendCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    const emailInput = document.getElementById('register-email') as HTMLInputElement;
    const email = emailInput?.value;

    if (!email) {
      setError(t.auth.email_placeholder);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await sendVerificationCode(email);
      setCountdown(600); // 10 minutes countdown for UI (though API enforces 10m)
      
      // Start countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t.auth.error_generic);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, type: 'login' | 'register') => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (type === 'login') {
        await login(email, password);
      } else {
        const code = formData.get('code') as string;
        const inputInviteCode = formData.get('inviteCode') as string;
        await register(email, password, code, inputInviteCode);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t.auth.error_generic);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.auth.account}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t.auth.login}</TabsTrigger>
            <TabsTrigger value="register">{t.auth.register}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input id="email" name="email" type="email" required placeholder={t.auth.email_placeholder} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.auth.password}</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.auth.login}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={(e) => handleSubmit(e, 'register')} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="register-email">{t.auth.email}</Label>
                <div className="flex gap-2">
                  <Input id="register-email" name="email" type="email" required placeholder={t.auth.email_placeholder} />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleSendCode}
                    disabled={isLoading || countdown > 0}
                    className="whitespace-nowrap"
                  >
                    {countdown > 0 ? formatTime(countdown) : t.auth.send_code}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">{t.auth.verification_code}</Label>
                <Input id="code" name="code" type="text" required placeholder="123456" maxLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteCode">{t.auth.invite_code}</Label>
                <Input id="inviteCode" name="inviteCode" type="text" placeholder="INVITE123" defaultValue={inviteCode} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">{t.auth.password}</Label>
                <Input id="register-password" name="password" type="password" required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.auth.register}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
