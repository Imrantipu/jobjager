import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { AnschreibenService, type Anschreiben } from '@/services/anschreibenService';
import { format } from 'date-fns';

const AnschreibenView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anschreiben, setAnschreiben] = useState<Anschreiben | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refineInstructions, setRefineInstructions] = useState('');
  const [refining, setRefining] = useState(false);

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
    } catch (err: any) {
      console.error('Failed to load Anschreiben:', err);
      setError('Failed to load cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!anschreiben || !refineInstructions.trim()) return;

    try {
      setRefining(true);
      const refined = await AnschreibenService.refine(anschreiben.id, {
        improvementInstructions: refineInstructions,
      });
      setAnschreiben(refined);
      setShowRefineModal(false);
      setRefineInstructions('');
    } catch (err: any) {
      console.error('Failed to refine Anschreiben:', err);
      alert('Failed to refine cover letter. Please try again.');
    } finally {
      setRefining(false);
    }
  };

  const handleDelete = async () => {
    if (!anschreiben || !confirm('Are you sure you want to delete this cover letter?')) return;

    try {
      await AnschreibenService.delete(anschreiben.id);
      navigate('/anschreiben');
    } catch (err: any) {
      console.error('Failed to delete Anschreiben:', err);
      alert('Failed to delete cover letter');
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
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex gap-2 items-center mb-2">
              <h1 className="text-3xl font-bold">{anschreiben.title}</h1>
              {anschreiben.isTemplate && (
                <div className="badge badge-info">Template</div>
              )}
              {anschreiben.applicationId && (
                <div className="badge badge-success">Linked</div>
              )}
            </div>
            <p className="text-base-content/70">
              Created {format(new Date(anschreiben.createdAt), 'MMMM dd, yyyy')}
              {anschreiben.createdAt !== anschreiben.updatedAt && (
                <> • Updated {format(new Date(anschreiben.updatedAt), 'MMMM dd, yyyy')}</>
              )}
            </p>
          </div>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </label>
            <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-200 rounded-box w-52">
              <li>
                <Link to={`/anschreiben/${anschreiben.id}/edit`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
              </li>
              <li>
                <button onClick={() => setShowRefineModal(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Refine with AI
                </button>
              </li>
              <li className="menu-title">
                <span className="text-error">Danger Zone</span>
              </li>
              <li>
                <button onClick={handleDelete} className="text-error">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Application Info */}
        {anschreiben.application && (
          <div className="alert alert-info mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Linked to Application</p>
              <p className="text-sm">
                {anschreiben.application.job?.companyName} - {anschreiben.application.job?.positionTitle}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-base leading-relaxed">
                {anschreiben.content}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={() => navigate('/anschreiben')} className="btn btn-ghost">
            Back to List
          </button>
          <Link to={`/anschreiben/${anschreiben.id}/edit`} className="btn btn-primary">
            Edit Cover Letter
          </Link>
        </div>

        {/* Refine Modal */}
        {showRefineModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Refine with AI</h3>
              <form onSubmit={handleRefine}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Improvement Instructions</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-32"
                    value={refineInstructions}
                    onChange={(e) => setRefineInstructions(e.target.value)}
                    placeholder="e.g., Make it more concise, add more emphasis on leadership skills, adjust tone to be more formal..."
                    required
                  />
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowRefineModal(false)}
                    disabled={refining}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={refining}>
                    {refining ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Refining...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Refine
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AnschreibenView;
