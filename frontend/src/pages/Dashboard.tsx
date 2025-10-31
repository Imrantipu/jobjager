import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import MainLayout from '@/components/layout/MainLayout';
import { ApplicationService } from '@/services/applicationService';
import { CVService } from '@/services/cvService';
import { AnschreibenService } from '@/services/anschreibenService';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>({
    applications: { total: 0, byStatus: {}, successRate: 0 },
    cvs: { total: 0 },
    anschreiben: { total: 0, templates: 0 },
    loading: true,
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const [appStats, cvStats, anschStats] = await Promise.all([
        ApplicationService.getStatistics(),
        CVService.getStatistics(),
        AnschreibenService.getStatistics(),
      ]);

      setStats({
        applications: appStats,
        cvs: cvStats,
        anschreiben: anschStats,
        loading: false,
      });
    } catch (err) {
      console.error('Failed to load statistics:', err);
      setStats((prev: any) => ({ ...prev, loading: false }));
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to JobJäger, {user?.firstName}!
        </h1>
        <p className="text-lg text-base-content/70 mb-8">
          Your job application journey starts here.
        </p>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div className="stat-title">Total Applications</div>
              <div className="stat-value text-primary">{stats.loading ? '...' : stats.applications.total}</div>
              <div className="stat-desc">Track your progress</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="stat-title">Applied</div>
              <div className="stat-value text-info">{stats.loading ? '...' : stats.applications.applied}</div>
              <div className="stat-desc">Waiting for response</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-warning">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="stat-title">Interviews</div>
              <div className="stat-value text-warning">{stats.loading ? '...' : stats.applications.interview}</div>
              <div className="stat-desc">Scheduled interviews</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-success">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div className="stat-title">Offers</div>
              <div className="stat-value text-success">{stats.loading ? '...' : stats.applications.offer}</div>
              <div className="stat-desc">Job offers received</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Applications
              </h2>
              <p>Track and manage your job applications</p>
              <div className="divider my-2"></div>
              <div className="flex justify-between text-sm">
                <span>To Apply: {stats.applications.toApply}</span>
                <span>Applied: {stats.applications.applied}</span>
              </div>
              <div className="card-actions justify-end mt-4">
                <Link to="/applications" className="btn btn-primary btn-sm">
                  View All
                </Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CV Builder
              </h2>
              <p>Create and manage your CVs</p>
              <div className="divider my-2"></div>
              <div className="text-sm">
                <span>{stats.cvs.total} CV{stats.cvs.total !== 1 ? 's' : ''} created</span>
              </div>
              <div className="card-actions justify-end mt-4">
                <Link to="/cv" className="btn btn-primary btn-sm">
                  View CVs
                </Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
            <div className="card-body">
              <h2 className="card-title">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Anschreiben
              </h2>
              <p>AI-powered German cover letters</p>
              <div className="divider my-2"></div>
              <div className="text-sm">
                <span>{stats.anschreiben.total} cover letter{stats.anschreiben.total !== 1 ? 's' : ''}</span>
              </div>
              <div className="card-actions justify-end mt-4">
                <Link to="/anschreiben" className="btn btn-primary btn-sm">
                  View All
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
