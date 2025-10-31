import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { ApplicationService, type Application, type ApplicationStatus } from '@/services/applicationService';
import ApplicationModal from '@/components/applications/ApplicationModal';
import JobModal from '@/components/jobs/JobModal';
import { format } from 'date-fns';

const statusColors: Record<ApplicationStatus, string> = {
  TO_APPLY: 'badge-info',
  APPLIED: 'badge-primary',
  INTERVIEW: 'badge-warning',
  OFFER: 'badge-success',
  REJECTED: 'badge-error',
};

const statusLabels: Record<ApplicationStatus, string> = {
  TO_APPLY: 'To Apply',
  APPLIED: 'Applied',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
};

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'ALL'>('ALL');

  // Modal states
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | undefined>(undefined);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApplicationService.getAll();
      setApplications(data);
    } catch (err: any) {
      console.error('Failed to load applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      await ApplicationService.delete(id);
      setApplications(apps => apps.filter(app => app.id !== id));
    } catch (err: any) {
      console.error('Failed to delete application:', err);
      alert('Failed to delete application');
    }
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus): Promise<void> => {
    try {
      const updated = await ApplicationService.updateStatus(id, newStatus);
      setApplications(apps => apps.map(app => app.id === id ? updated : app));
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  const filteredApplications = filterStatus === 'ALL'
    ? applications
    : applications.filter(app => app.status === filterStatus);

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Applications</h1>
            <p className="text-base-content/70">Track all your job applications</p>
          </div>
          <div className="flex gap-2">
            <Link to="/kanban" className="btn btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Kanban View
            </Link>
            <button onClick={() => setShowJobModal(true)} className="btn btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Add Job
            </button>
            <button onClick={() => {
              setEditingApplication(undefined);
              setShowApplicationModal(true);
            }} className="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Application
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`btn btn-sm ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
          >
            All ({applications.length})
          </button>
          {(Object.keys(statusLabels) as ApplicationStatus[]).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-ghost'}`}
            >
              {statusLabels[status]} ({applications.filter(a => a.status === status).length})
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold mb-2">No applications yet</h3>
            <p className="text-base-content/70 mb-4">Start tracking your job applications</p>
            <button onClick={() => {
              setEditingApplication(undefined);
              setShowApplicationModal(true);
            }} className="btn btn-primary">Create your first application</button>
          </div>
        )}

        {/* Applications List */}
        {!loading && filteredApplications.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Interview Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map(app => (
                  <tr key={app.id} className="hover">
                    <td>
                      <div className="font-bold">{app.job?.companyName || 'N/A'}</div>
                      <div className="text-sm text-base-content/70">{app.job?.location}</div>
                    </td>
                    <td>{app.job?.positionTitle || 'N/A'}</td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        className={`select select-sm select-bordered ${statusColors[app.status]}`}
                      >
                        {(Object.keys(statusLabels) as ApplicationStatus[]).map(status => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{app.appliedDate ? format(new Date(app.appliedDate), 'MMM dd, yyyy') : '-'}</td>
                    <td>{app.interviewDate ? format(new Date(app.interviewDate), 'MMM dd, yyyy') : '-'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingApplication(app);
                            setShowApplicationModal(true);
                          }}
                          className="btn btn-ghost btn-xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(app.id)} className="btn btn-ghost btn-xs text-error">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Job Modal */}
        <JobModal
          isOpen={showJobModal}
          onClose={() => setShowJobModal(false)}
          onSave={(job) => {
            // Job saved, maybe refresh or show success message
            console.log('Job created:', job);
          }}
          mode="create"
        />

        {/* Application Modal */}
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setEditingApplication(undefined);
          }}
          onSave={(application) => {
            if (editingApplication) {
              // Update existing application in list
              setApplications(apps => apps.map(app => app.id === application.id ? application : app));
            } else {
              // Add new application to list
              setApplications([application, ...applications]);
            }
          }}
          initialData={editingApplication}
          mode={editingApplication ? 'edit' : 'create'}
        />
      </div>
    </MainLayout>
  );
};

export default Applications;
