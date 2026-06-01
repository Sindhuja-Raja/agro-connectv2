import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Lock, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ResetPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { updatePassword } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const recoveryDetected = useRef(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryDetected.current = true;
        setReady(true);
      } else if (event === 'SIGNED_IN' && !recoveryDetected.current) {
        // User signed in but not via recovery — check if already on page with session
        setReady(true);
      }
    });

    // Fallback: if session already exists (e.g. page reload), allow form
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      } else {
        // No session and no recovery event after 5s → invalid link
        setTimeout(() => {
          if (!recoveryDetected.current) {
            toast.error(language === 'ta' ? 'தவறான மீட்டமைப்பு இணைப்பு' : 'Invalid reset link');
            navigate('/login');
          }
        }, 5000);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(language === 'ta' ? 'கடவுச்சொற்கள் பொருந்தவில்லை' : 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error(language === 'ta' ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast.error(error.message || 'Failed to reset password');
      } else {
        setSuccess(true);
        toast.success(language === 'ta' ? 'கடவுச்சொல் வெற்றிகரமாக மீட்டமைக்கப்பட்டது!' : 'Password reset successfully!');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-col items-center pt-16 pb-10 px-6">
        <div className="bg-primary/10 rounded-full p-4 mb-4">
          <Leaf size={48} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'ta' ? 'புதிய கடவுச்சொல் அமை' : 'Set New Password'}
        </h1>
        <p className="text-muted-foreground text-center mt-2">
          {language === 'ta' 
            ? 'உங்கள் புதிய கடவுச்சொல்லை உள்ளிடவும்' 
            : 'Enter your new password below'}
        </p>
      </div>

      <div className="flex-1 px-6 pb-6">
        <div className="bg-card rounded-3xl shadow-lg p-6 max-w-md mx-auto">
          {!ready ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'ta' ? 'சரிபார்க்கிறது...' : 'Verifying reset link...'}
              </p>
            </div>
          ) : success ? (
            <div className="text-center py-8">
              <div className="bg-primary/10 rounded-full p-4 mx-auto w-fit mb-4">
                <CheckCircle size={48} className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {language === 'ta' ? 'கடவுச்சொல் மீட்டமைக்கப்பட்டது!' : 'Password Reset!'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'ta' 
                  ? 'உங்கள் கடவுச்சொல் வெற்றிகரமாக புதுப்பிக்கப்பட்டது'
                  : 'Your password has been successfully updated'}
              </p>
              <Button
                variant="farmer"
                onClick={() => navigate('/home')}
                className="w-full"
              >
                {language === 'ta' ? 'முகப்புக்கு செல்' : 'Go to Home'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  type="password"
                  placeholder={language === 'ta' ? 'புதிய கடவுச்சொல்' : 'New Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 text-base rounded-xl"
                  required
                  minLength={6}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  type="password"
                  placeholder={language === 'ta' ? 'கடவுச்சொல்லை உறுதிப்படுத்து' : 'Confirm Password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 h-14 text-base rounded-xl"
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                variant="farmer"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  language === 'ta' ? 'கடவுச்சொல்லை மீட்டமை' : 'Reset Password'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
