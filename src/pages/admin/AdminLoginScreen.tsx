import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const AdminLoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await login(email, password);
      if (error) {
        toast.error('Invalid credentials');
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        toast.error('Please try again');
        await logout();
        return;
      }

      const { data: adminRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError || !adminRole) {
        toast.error('Access denied: Admins only');
        await logout();
        navigate('/home', { replace: true });
        return;
      }

      toast.success('Welcome Admin!');
      navigate('/admin', { replace: true });
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate('/login')}>
          <ArrowLeft size={20} />
          {t('back')}
        </Button>
      </div>

      <div className="flex flex-col items-center pt-8 pb-10 px-6">
        <div className="bg-soil/10 rounded-full p-4 mb-4">
          <Shield size={48} className="text-soil" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t('admin')} Portal</h1>
        <p className="text-muted-foreground">Shop Management Dashboard</p>
      </div>

      <div className="flex-1 px-6 pb-6">
        <div className="bg-card rounded-3xl shadow-lg p-6 max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>

            <Button
              type="submit"
              variant="farmer"
              className="w-full bg-soil hover:bg-soil/90"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {t('login')}
                  <ArrowRight size={20} />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Admin accounts require special permissions
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginScreen;
