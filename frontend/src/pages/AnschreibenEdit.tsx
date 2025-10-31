import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { AnschreibenService, type Anschreiben } from '@/services/anschreibenService';

const AnschreibenEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anschreiben, setAnschreiben] = useState<Anschreiben | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/anschreiben');
      return;
    }

    loadAnschreiben();
  }, [id]);

  const loadAnschreiben = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnschreibenService.getById(id!);
      setAnschreiben(data);
      setTitle(data.title);
      setContent(data.content);
      setIsTemplate(data.isTemplate);
    } catch (err: any) {
      console.error('Failed to load Anschreiben:', err);
      setError('Failed to load cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!anschreiben) return;

    try {
      setSaving(true);
      await AnschreibenService.update(anschreiben.id, {
        title,
        content,
        isTemplate,
      });
      navigate(`/anschreiben/${anschreiben.id}`);
    } catch (err: any) {
      console.error('Failed to update Anschreiben:', err);
      alert('Failed to update cover letter. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8 flex justify-center items-center min-h-[400px]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </MainLayout>
    );
  }

  if (error || !anschreiben) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="alert alert-error">
            <span>{error || 'Cover letter not found'}</span>
          </div>
          <button onClick={() => navigate('/anschreiben')} className="btn btn-ghost mt-4">
            Back to Anschreiben
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Cover Letter</h1>
          <p className="text-base-content/70">Make changes to your Anschreiben</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Title *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Frontend Developer Cover Letter - Company XYZ"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={isTemplate}
                    onChange={(e) => setIsTemplate(e.target.checked)}
                  />
                  <span className="label-text">Save as template</span>
                </label>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Templates can be reused for multiple applications
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Cover Letter Content *</span>
                  <span className="label-text-alt">{content.length} characters</span>
                </label>
                <textarea
                  className="textarea textarea-bordered font-mono"
                  rows={20}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your cover letter content here..."
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Professional German business letters typically use 300-400 words
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Application Link Info */}
          {anschreiben.application && (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">This cover letter is linked to an application</p>
                <p className="text-sm">
                  {anschreiben.application.job?.companyName} - {anschreiben.application.job?.positionTitle}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(`/anschreiben/${anschreiben.id}`)}
              className="btn btn-ghost"
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default AnschreibenEdit;
