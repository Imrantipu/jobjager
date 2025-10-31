import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { ApplicationService, type Application, type ApplicationStatus } from '@/services/applicationService';
import { format } from 'date-fns';

const statusColumns: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: 'TO_APPLY', label: 'To Apply', color: 'bg-info/10 border-info' },
  { status: 'APPLIED', label: 'Applied', color: 'bg-primary/10 border-primary' },
  { status: 'INTERVIEW', label: 'Interview', color: 'bg-warning/10 border-warning' },
  { status: 'OFFER', label: 'Offer', color: 'bg-success/10 border-success' },
  { status: 'REJECTED', label: 'Rejected', color: 'bg-error/10 border-error' },
];

const Kanban = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedApp, setDraggedApp] = useState<Application | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
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

  const handleDragStart = (app: Application) => {
    setDraggedApp(app);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: ApplicationStatus) => {
    e.preventDefault();

    if (!draggedApp || draggedApp.status === newStatus) {
      setDraggedApp(null);
      return;
    }

    try {
      const updated = await ApplicationService.updateStatus(draggedApp.id, newStatus);
      setApplications(apps => apps.map(app => app.id === draggedApp.id ? updated : app));
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert('Failed to update application status');
    } finally {
      setDraggedApp(null);
    }
  };

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return applications.filter(app => app.status === status);
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Kanban Board</h1>
            <p className="text-base-content/70">Drag and drop to update application status</p>
          </div>
          <Link to="/applications" className="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List View
          </Link>
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

        {/* Kanban Board */}
        {!loading && (
          <div className="grid grid-cols-5 gap-4">
            {statusColumns.map(({ status, label, color }) => {
              const apps = getApplicationsByStatus(status);

              return (
                <div key={status} className="flex flex-col">
                  {/* Column Header */}
                  <div className={`rounded-t-lg border-2 ${color} p-3`}>
                    <h3 className="font-bold text-center">
                      {label}
                      <span className="ml-2 badge badge-sm">{apps.length}</span>
                    </h3>
                  </div>

                  {/* Column Content */}
                  <div
                    className={`flex-1 rounded-b-lg border-2 border-t-0 ${color} p-2 min-h-[500px]`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    <div className="space-y-2">
                      {apps.map(app => (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={() => handleDragStart(app)}
                          className="card bg-base-100 shadow-md hover:shadow-lg cursor-move transition"
                        >
                          <div className="card-body p-4">
                            {/* Company Name */}
                            <h4 className="font-bold text-sm line-clamp-1">
                              {app.job?.companyName || 'N/A'}
                            </h4>

                            {/* Position */}
                            <p className="text-xs text-base-content/70 line-clamp-1">
                              {app.job?.positionTitle || 'N/A'}
                            </p>

                            {/* Location */}
                            {app.job?.location && (
                              <p className="text-xs text-base-content/50 line-clamp-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {app.job.location}
                              </p>
                            )}

                            {/* Dates */}
                            {app.appliedDate && (
                              <p className="text-xs text-base-content/50 mt-2">
                                Applied: {format(new Date(app.appliedDate), 'MMM dd, yyyy')}
                              </p>
                            )}
                            {app.interviewDate && (
                              <p className="text-xs text-warning font-semibold">
                                Interview: {format(new Date(app.interviewDate), 'MMM dd, yyyy')}
                              </p>
                            )}

                            {/* Tech Stack */}
                            {app.job?.techStack && app.job.techStack.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {app.job.techStack.slice(0, 3).map((tech, idx) => (
                                  <span key={idx} className="badge badge-xs">
                                    {tech}
                                  </span>
                                ))}
                                {app.job.techStack.length > 3 && (
                                  <span className="badge badge-xs">+{app.job.techStack.length - 3}</span>
                                )}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-3">
                              <Link
                                to={`/applications/${app.id}`}
                                className="btn btn-ghost btn-xs flex-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Empty State */}
                      {apps.length === 0 && (
                        <div className="text-center py-8 text-base-content/30">
                          <p className="text-sm">No applications</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Kanban;
