import { Redirect } from 'expo-router';

import { RecruiterDashboard } from '@/components/RecruiterDashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function RecruiterTabScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user?.role !== 'recruiter' && user?.role !== 'admin') {
    return <Redirect href="/unauthorized" />;
  }

  return <RecruiterDashboard />;
}
