import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, User, Phone, ArrowRight, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { login, signup, isAuthenticated } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await login(email, password);
        if (error) {
          toast.error(error.message || 'Invalid credentials');
        } else {
          toast.success('Welcome back!');
          navigate('/home');
        }
      } else {
        const { error } = await signup(name, mobile, email, password);
        if (error) {
          toast.error(error.message || 'Signup failed');
        } else {
          toast.success('Account created successfully!');
          navigate('/home');
        }
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Language Toggle */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
          className="px-4 py-2 bg-secondary rounded-full text-sm font-medium text-secondary-foreground"
        >
          {language === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center pt-8 pb-10 px-6">
        <div className="bg-primary/10 rounded-full p-4 mb-4">
          <Leaf size={48} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t('appName')}</h1>
        <p className="text-muted-foreground">{t('tagline')}</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pb-6">
        <div className="bg-card rounded-3xl shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            {isLogin ? t('login') : t('signup')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    type="text"
                    placeholder={t('name')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12 h-14 text-base rounded-xl"
                    required={!isLogin}
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    type="tel"
                    placeholder={t('mobileNumber')}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="pl-12 h-14 text-base rounded-xl"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="email"
                placeholder={t('email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 text-base rounded-xl"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="password"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                <>
                  {t('continueWith')}
                  <ArrowRight size={20} />
                </>
              )}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-muted-foreground text-sm hover:text-primary transition-colors"
              >
                {language === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டீர்களா?' : 'Forgot password?'}
              </button>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium"
            >
              {isLogin
                ? language === 'ta'
                  ? 'புதிய கணக்கு? பதிவு செய்'
                  : "New here? Sign Up"
                : language === 'ta'
                ? 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழை'
                : 'Have an account? Login'}
            </button>
          </div>
        </div>

        {/* Admin Login Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/admin-login')}
            className="inline-flex items-center gap-2 text-muted-foreground text-sm"
          >
            <Shield size={16} />
            {t('admin')} {t('login')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
