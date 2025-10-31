import { useState, useEffect } from 'react';
import { JobService, type Job } from '@/services/jobService';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Job) => void;
  initialData?: Job;
  mode: 'create' | 'edit';
}

const JobModal = ({ isOpen, onClose, onSave, initialData, mode }: JobModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    positionTitle: '',
    jobDescription: '',
    location: '',
    salaryRange: '',
    techStack: [] as string[],
    sourceUrl: '',
    sourcePlatform: '',
    isSaved: false,
  });
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName,
        positionTitle: initialData.positionTitle,
        jobDescription: initialData.jobDescription || '',
        location: initialData.location || '',
        salaryRange: initialData.salaryRange || '',
        techStack: initialData.techStack || [],
        sourceUrl: initialData.sourceUrl || '',
        sourcePlatform: initialData.sourcePlatform || '',
        isSaved: initialData.isSaved,
      });
    } else {
      // Reset form for create mode
      setFormData({
        companyName: '',
        positionTitle: '',
        jobDescription: '',
        location: '',
        salaryRange: '',
        techStack: [],
        sourceUrl: '',
        sourcePlatform: '',
        isSaved: false,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      let savedJob: Job;

      if (mode === 'create') {
        savedJob = await JobService.create(formData);
      } else if (initialData) {
        savedJob = await JobService.update(initialData.id, formData);
      } else {
        return;
      }

      onSave(savedJob);
      onClose();
    } catch (err: any) {
      console.error('Failed to save job:', err);
      alert('Failed to save job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTechStack = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, techInput.trim()],
      });
      setTechInput('');
    }
  };

  const removeTechStack = (tech: string) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter(t => t !== tech),
    });
  };

  const handleTechKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechStack();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">
          {mode === 'create' ? 'Add New Job' : 'Edit Job'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Company Name *</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>

          {/* Position Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Position Title *</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.positionTitle}
              onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
              required
            />
          </div>

          {/* Location */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Location</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Berlin, Germany"
            />
          </div>

          {/* Salary Range */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Salary Range</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.salaryRange}
              onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
              placeholder="e.g., €50,000 - €70,000"
            />
          </div>

          {/* Job Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Job Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              placeholder="Paste the job description here..."
            />
          </div>

          {/* Tech Stack */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Tech Stack</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input input-bordered flex-1"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={handleTechKeyPress}
                placeholder="e.g., React, TypeScript (press Enter to add)"
              />
              <button
                type="button"
                onClick={addTechStack}
                className="btn btn-primary btn-sm"
              >
                Add
              </button>
            </div>
            {formData.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.techStack.map((tech) => (
                  <div key={tech} className="badge badge-primary gap-2">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechStack(tech)}
                      className="btn btn-ghost btn-xs btn-circle"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Source URL */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Source URL</span>
            </label>
            <input
              type="url"
              className="input input-bordered"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Source Platform */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Source Platform</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.sourcePlatform}
              onChange={(e) => setFormData({ ...formData, sourcePlatform: e.target.value })}
              placeholder="e.g., LinkedIn, Indeed, Company Website"
            />
          </div>

          {/* Is Saved */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                className="checkbox"
                checked={formData.isSaved}
                onChange={(e) => setFormData({ ...formData, isSaved: e.target.checked })}
              />
              <span className="label-text">Mark as saved/favorite</span>
            </label>
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
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                mode === 'create' ? 'Add Job' : 'Update Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobModal;
