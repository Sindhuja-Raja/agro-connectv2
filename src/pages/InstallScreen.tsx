import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Smartphone, Share, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-foreground mb-6">
        <ArrowLeft size={20} />
        <span className="font-medium">{language === 'ta' ? 'பின்செல்' : 'Back'}</span>
      </button>

      <div className="text-center space-y-6">
        <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
          <Smartphone size={40} className="text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          {language === 'ta' ? 'செயலியை நிறுவுங்கள்' : 'Install AgroMart'}
        </h1>

        <p className="text-muted-foreground">
          {language === 'ta'
            ? 'உங்கள் முகப்புத் திரையில் AgroMart-ஐ நிறுவி, எளிதாக அணுகுங்கள்.'
            : 'Add AgroMart to your home screen for quick access, offline support, and a native app experience.'}
        </p>

        {isInstalled ? (
          <div className="flex flex-col items-center gap-3 p-6 bg-primary/10 rounded-2xl">
            <CheckCircle size={48} className="text-primary" />
            <p className="font-semibold text-primary">
              {language === 'ta' ? 'ஏற்கனவே நிறுவப்பட்டது!' : 'Already installed!'}
            </p>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full gap-2">
            <Download size={20} />
            {language === 'ta' ? 'இப்போது நிறுவு' : 'Install Now'}
          </Button>
        ) : isIOS ? (
          <div className="bg-card rounded-2xl p-6 space-y-4 text-left border border-border">
            <h3 className="font-semibold text-foreground">
              {language === 'ta' ? 'iPhone-ல் நிறுவ:' : 'To install on iPhone:'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                <p className="text-sm text-foreground/80">
                  {language === 'ta'
                    ? 'Safari-ல் Share பொத்தானை அழுத்தவும்'
                    : 'Tap the Share button in Safari'}
                  <Share size={14} className="inline ml-1" />
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <p className="text-sm text-foreground/80">
                  {language === 'ta'
                    ? '"Add to Home Screen" என்பதைத் தேர்ந்தெடுக்கவும்'
                    : 'Select "Add to Home Screen"'}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shrink-0">3</span>
                <p className="text-sm text-foreground/80">
                  {language === 'ta' ? '"Add" என்பதை அழுத்தவும்' : 'Tap "Add"'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-6 space-y-4 text-left border border-border">
            <h3 className="font-semibold text-foreground">
              {language === 'ta' ? 'நிறுவ:' : 'To install:'}
            </h3>
            <p className="text-sm text-foreground/80">
              {language === 'ta'
                ? 'உலாவி மெனுவில் "Install app" அல்லது "Add to Home Screen" என்பதைத் தேர்ந்தெடுக்கவும்.'
                : 'Open your browser menu and select "Install app" or "Add to Home Screen".'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallScreen;
