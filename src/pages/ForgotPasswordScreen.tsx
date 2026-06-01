import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Mail, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast.error(error.message || 'Failed to send reset email');
      } else {
        setEmailSent(true);
        toast.success(language === 'ta' ? 'மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டது!' : 'Reset link sent!');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4">
        <button onClick={() => navigate('/login')} className="p-2">
          <ArrowLeft className="text-foreground" size={24} />
        </button>
      </div>

      <div className="flex flex-col items-center pt-8 pb-10 px-6">
        <div className="bg-primary/10 rounded-full p-4 mb-4">
          <Leaf size={48} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {language === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டீர்களா?' : 'Forgot Password?'}
        </h1>
        <p className="text-muted-foreground text-center mt-2">
          {language === 'ta' 
            ? 'உங்கள் மின்னஞ்சலை உள்ளிடவும், மீட்டமைப்பு இணைப்பை அனுப்புவோம்' 
            : "Enter your email and we'll send you a reset link"}
        </p>
      </div>

      <div className="flex-1 px-6 pb-6">
        <div className="bg-card rounded-3xl shadow-lg p-6 max-w-md mx-auto">
          {emailSent ? (
            <div className="text-center py-8">
              <div className="bg-primary/10 rounded-full p-4 mx-auto w-fit mb-4">
                <Mail size={48} className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {language === 'ta' ? 'உங்கள் மின்னஞ்சலை சரிபார்க்கவும்' : 'Check your email'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'ta' 
                  ? `${email} க்கு கடவுச்சொல் மீட்டமைப்பு இணைப்பை அனுப்பியுள்ளோம்`
                  : `We've sent a password reset link to ${email}`}
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                {language === 'ta' ? 'உள்நுழைவுக்கு திரும்பு' : 'Back to Login'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  type="email"
                  placeholder={language === 'ta' ? 'மின்னஞ்சல்' : 'Email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 text-base rounded-xl"
                  required
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
                  language === 'ta' ? 'மீட்டமைப்பு இணைப்பை அனுப்பு' : 'Send Reset Link'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
