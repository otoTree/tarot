import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/lib/i18n';
import { Check, Copy, Share2 } from 'lucide-react';

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteModal({ open, onOpenChange }: InviteModalProps) {
  const { user } = useAuthStore();
  const { language } = useStore();
  const t = getTranslation(language);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteCode = user?.invitationCode || '...';
  const inviteLink = typeof window !== 'undefined' && inviteCode !== '...' 
    ? `${window.location.origin}?invite=${inviteCode}` 
    : '';

  const copyToClipboard = async (text: string, isLink: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isLink) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.auth.invite_friends}</DialogTitle>
          <DialogDescription>{t.auth.invite_description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>{t.auth.your_invite_code}</Label>
            <div className="flex gap-2">
              <div className="flex-1 p-2 bg-secondary rounded-md font-mono text-center tracking-wider text-lg">
                {inviteCode}
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(inviteCode, false)}
                disabled={!user?.invitationCode}
              >
                {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.auth.invite_link}</Label>
            <div className="flex gap-2">
              <Input readOnly value={inviteLink} />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(inviteLink, true)}
                disabled={!inviteLink}
              >
                {copiedLink ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
