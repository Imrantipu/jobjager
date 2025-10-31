import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { AnschreibenService, type Anschreiben as AnschreibenType, type GenerateAnschreibenData } from '@/services/anschreibenService';
import { format } from 'date-fns';

const Anschreiben = () => {
  const [anschreibenList, setAnschreibenList] = useState<AnschreibenType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTemplate, setFilterTemplate] = useState<'ALL' | 'TEMPLATES' | 'LINKED'>('ALL');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  // const [selectedAnschreiben, setSelectedAnschreiben] = useState<AnschreibenType | null>(null);

  // Form state for AI generation
  const [formData, setFormData] = useState<GenerateAnschreibenData>({
    companyName: '',
    positionTitle: '',
    jobDescription: '',
    applicantName: '',
    applicantQualifications: '',
    isTemplate: false,
  });

  useEffect(() => {
    loadAnschreiben();
  }, []);

  const loadAnschreiben = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AnschreibenService.getAll();
      setAnschreibenList(data);
    } catch (err: any) {
      console.error('Failed to load Anschreiben:', err);
      setError('Failed to load cover letters');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setGenerating(true);
      const generated = await AnschreibenService.generate(formData);
      setAnschreibenList([generated, ...anschreibenList]);
      setShowGenerateModal(false);
      setFormData({
        companyName: '',
        positionTitle: '',
        jobDescription: '',
        applicantName: '',
        applicantQualifications: '',
        isTemplate: false,
      });
    } catch (err: any) {
      console.error('Failed to generate Anschreiben:', err);
      alert('Failed to generate cover letter. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) return;

    try {
      await AnschreibenService.delete(id);
      setAnschreibenList(anschreibenList.filter(a => a.id !== id));
    } catch (err: any) {
      console.error('Failed to delete Anschreiben:', err);
      alert('Failed to delete cover letter');
    }
  };

  const handleDuplicate = async (anschreiben: AnschreibenType) => {
    const newTitle = prompt('Enter title for the duplicated cover letter:', `${anschreiben.title} (Copy)`);
    if (!newTitle) return;

    try {
      const duplicated = await AnschreibenService.duplicate(anschreiben.id, newTitle);
      setAnschreibenList([duplicated, ...anschreibenList]);
    } catch (err: any) {
      console.error('Failed to duplicate Anschreiben:', err);
      alert('Failed to duplicate cover letter');
    }
  };

  const filteredAnschreiben = anschreibenList.filter(a => {
    if (filterTemplate === 'TEMPLATES') return a.isTemplate;
    if (filterTemplate === 'LINKED') return a.applicationId;
    return true;
  });

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Anschreiben</h1>
            <p className="text-base-content/70">AI-powered German cover letters</p>
          </div>
          <div className="flex gap-2">
            <Link to="/anschreiben/new" className="btn btn-outline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Write Manually
            </Link>
            <button onClick={() => setShowGenerateModal(true)} className="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate with AI
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterTemplate('ALL')}
            className={`btn btn-sm ${filterTemplate === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
          >
            All ({anschreibenList.length})
          </button>
          <button
            onClick={() => setFilterTemplate('TEMPLATES')}
            className={`btn btn-sm ${filterTemplate === 'TEMPLATES' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Templates ({anschreibenList.filter(a => a.isTemplate).length})
          </button>
          <button
            onClick={() => setFilterTemplate('LINKED')}
            className={`btn btn-sm ${filterTemplate === 'LINKED' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Linked ({anschreibenList.filter(a => a.applicationId).length})
          </button>
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
        {!loading && filteredAnschreiben.length === 0 && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-xl font-bold mb-2">No cover letters yet</h3>
            <p className="text-base-content/70 mb-4">Generate your first AI-powered Anschreiben</p>
            <button onClick={() => setShowGenerateModal(true)} className="btn btn-primary">
              Generate with AI
            </button>
          </div>
        )}

        {/* Anschreiben Grid */}
        {!loading && filteredAnschreiben.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnschreiben.map(anschreiben => (
              <div key={anschreiben.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
                <div className="card-body">
                  {/* Badges */}
                  <div className="flex gap-2 mb-2">
                    {anschreiben.isTemplate && (
                      <div className="badge badge-info badge-sm">Template</div>
                    )}
                    {anschreiben.applicationId && (
                      <div className="badge badge-success badge-sm">Linked</div>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="card-title text-lg mb-2">{anschreiben.title}</h2>

                  {/* Application Info */}
                  {anschreiben.application && (
                    <div className="text-sm text-base-content/70 mb-2">
                      <p className="font-semibold">{anschreiben.application.job?.companyName}</p>
                      <p>{anschreiben.application.job?.positionTitle}</p>
                    </div>
                  )}

                  {/* Content Preview */}
                  <p className="text-sm text-base-content/60 line-clamp-3 mb-2">
                    {anschreiben.content}
                  </p>

                  {/* Updated Date */}
                  <p className="text-xs text-base-content/50">
                    Updated {format(new Date(anschreiben.updatedAt), 'MMM dd, yyyy')}
                  </p>

                  {/* Actions */}
                  <div className="card-actions justify-end mt-4">
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-sm btn-square">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </label>
                      <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-200 rounded-box w-52">
                        <li>
                          <Link to={`/anschreiben/${anschreiben.id}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                        </li>
                        <li>
                          <Link to={`/anschreiben/${anschreiben.id}/edit`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                        </li>
                        <li>
                          <button onClick={() => handleDuplicate(anschreiben)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Duplicate
                          </button>
                        </li>
                        <li className="menu-title">
                          <span className="text-error">Danger Zone</span>
                        </li>
                        <li>
                          <button onClick={() => handleDelete(anschreiben.id)} className="text-error">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                    <Link to={`/anschreiben/${anschreiben.id}`} className="btn btn-primary btn-sm">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI Generation Modal */}
        {showGenerateModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Generate Anschreiben with AI</h3>
              <form onSubmit={handleGenerate}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Company Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Position Title</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.positionTitle}
                    onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Job Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    value={formData.jobDescription}
                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Your Name</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.applicantName}
                    onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Your Qualifications</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-32"
                    placeholder="List your relevant skills, experience, and qualifications..."
                    value={formData.applicantQualifications}
                    onChange={(e) => setFormData({ ...formData, applicantQualifications: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.isTemplate}
                      onChange={(e) => setFormData({ ...formData, isTemplate: e.target.checked })}
                    />
                    <span className="label-text">Save as template</span>
                  </label>
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowGenerateModal(false)}
                    disabled={generating}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={generating}>
                    {generating ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate
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

export default Anschreiben;
