import { useState, useEffect } from 'react';
import { ApplicationService, type Application, type ApplicationStatus } from '@/services/applicationService';
import { JobService, type Job } from '@/services/jobService';
import { CVService, type CV } from '@/services/cvService';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (application: Application) => void;
  initialData?: Application;
  mode: 'create' | 'edit';
  preselectedJobId?: string;
}

const statuses: { value: ApplicationStatus; label: string }[] = [
  { value: 'TO_APPLY', label: 'To Apply' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
];

const ApplicationModal = ({ isOpen, onClose, onSave, initialData, mode, preselectedJobId }: ApplicationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [cvs, setCVs] = useState<CV[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    jobId: '',
    cvId: '',
    status: 'TO_APPLY' as ApplicationStatus,
    appliedDate: '',
    followUpDate: '',
    interviewDate: '',
    notes: '',
    contactPerson: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadJobsAndCVs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        jobId: initialData.jobId,
        cvId: initialData.cvId || '',
        status: initialData.status,
        appliedDate: initialData.appliedDate ? new Date(initialData.appliedDate).toISOString().split('T')[0] : '',
        followUpDate: initialData.followUpDate ? new Date(initialData.followUpDate).toISOString().split('T')[0] : '',
        interviewDate: initialData.interviewDate ? new Date(initialData.interviewDate).toISOString().split('T')[0] : '',
        notes: initialData.notes || '',
        contactPerson: initialData.contactPerson || '',
      });
    } else if (preselectedJobId) {
      setFormData({
        jobId: preselectedJobId,
        cvId: '',
        status: 'TO_APPLY',
        appliedDate: '',
        followUpDate: '',
        interviewDate: '',
        notes: '',
        contactPerson: '',
      });
    } else {
      // Reset form for create mode
      setFormData({
        jobId: '',
        cvId: '',
        status: 'TO_APPLY',
        appliedDate: '',
        followUpDate: '',
        interviewDate: '',
        notes: '',
        contactPerson: '',
      });
    }
  }, [initialData, preselectedJobId, isOpen]);

  const loadJobsAndCVs = async () => {
    try {
      setLoadingData(true);
      const [jobsData, cvsData] = await Promise.all([
        JobService.getAll(),
        CVService.getAll(),
      ]);
      setJobs(jobsData);
      setCVs(cvsData);
    } catch (err: any) {
      console.error('Failed to load jobs and CVs:', err);
      alert('Failed to load jobs and CVs');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      let savedApplication: Application;

      const dataToSubmit = {
        ...formData,
        appliedDate: formData.appliedDate ? new Date(formData.appliedDate).toISOString() : undefined,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : undefined,
        interviewDate: formData.interviewDate ? new Date(formData.interviewDate).toISOString() : undefined,
      };

      if (mode === 'create') {
        savedApplication = await ApplicationService.create(dataToSubmit);
      } else if (initialData) {
        savedApplication = await ApplicationService.update(initialData.id, dataToSubmit);
      } else {
        return;
      }

      onSave(savedApplication);
      onClose();
    } catch (err: any) {
      console.error('Failed to save application:', err);
      alert('Failed to save application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">
          {mode === 'create' ? 'Create New Application' : 'Edit Application'}
        </h3>

        {loadingData ? (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Job Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Job *</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.jobId}
                onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                required
              >
                <option value="">Select a job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.companyName} - {job.positionTitle}
                  </option>
                ))}
              </select>
              {jobs.length === 0 && (
                <label className="label">
                  <span className="label-text-alt text-warning">No jobs available. Create a job first.</span>
                </label>
              )}
            </div>

            {/* CV Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">CV</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.cvId}
                onChange={(e) => setFormData({ ...formData, cvId: e.target.value })}
              >
                <option value="">Select a CV (optional)</option>
                {cvs.map((cv) => (
                  <option key={cv.id} value={cv.id}>
                    {cv.title} {cv.isDefault && '(Default)'}
                  </option>
                ))}
              </select>
              {cvs.length === 0 && (
                <label className="label">
                  <span className="label-text-alt text-info">No CVs available. You can create one later.</span>
                </label>
              )}
            </div>

            {/* Status */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Status *</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                required
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Applied Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={formData.appliedDate}
                  onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Follow-up Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Interview Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={formData.interviewDate}
                  onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                />
              </div>
            </div>

            {/* Contact Person */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Contact Person</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g., John Doe (Recruiter)"
              />
            </div>

            {/* Notes */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Notes</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes about this application..."
              />
            </div>

            {/* Actions */}
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || jobs.length === 0}>
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  mode === 'create' ? 'Create Application' : 'Update Application'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplicationModal;
