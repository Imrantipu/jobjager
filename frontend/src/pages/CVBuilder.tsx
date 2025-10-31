import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { CVService, type CV } from '@/services/cvService';
import { format } from 'date-fns';

const CVBuilder = () => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [showCreateModal, setShowCreateModal] = useState(false);
  // const [selectedCV, setSelectedCV] = useState<CV | null>(null);

  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CVService.getAll();
      setCvs(data);
    } catch (err: any) {
      console.error('Failed to load CVs:', err);
      setError('Failed to load CVs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CV?')) return;

    try {
      await CVService.delete(id);
      setCvs(cvs.filter(cv => cv.id !== id));
    } catch (err: any) {
      console.error('Failed to delete CV:', err);
      alert('Failed to delete CV');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await CVService.setAsDefault(id);
      setCvs(cvs.map(cv => ({
        ...cv,
        isDefault: cv.id === id,
      })));
    } catch (err: any) {
      console.error('Failed to set default CV:', err);
      alert('Failed to set default CV');
    }
  };

  const handleDuplicate = async (cv: CV) => {
    const newTitle = prompt('Enter title for the duplicated CV:', `${cv.title} (Copy)`);
    if (!newTitle) return;

    try {
      const duplicated = await CVService.duplicate(cv.id, newTitle);
      setCvs([duplicated, ...cvs]);
    } catch (err: any) {
      console.error('Failed to duplicate CV:', err);
      alert('Failed to duplicate CV');
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">CV Builder</h1>
            <p className="text-base-content/70">Create and manage your CVs</p>
          </div>
          <Link to="/cv/new" className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New CV
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

        {/* Empty State */}
        {!loading && cvs.length === 0 && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold mb-2">No CVs yet</h3>
            <p className="text-base-content/70 mb-4">Create your first CV to get started</p>
            <Link to="/cv/new" className="btn btn-primary">Create your first CV</Link>
          </div>
        )}

        {/* CVs Grid */}
        {!loading && cvs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cvs.map(cv => (
              <div key={cv.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition">
                <div className="card-body">
                  {/* Default Badge */}
                  {cv.isDefault && (
                    <div className="badge badge-primary badge-sm absolute top-4 right-4">
                      Default
                    </div>
                  )}

                  {/* CV Title */}
                  <h2 className="card-title text-lg mb-2">{cv.title}</h2>

                  {/* Personal Info */}
                  <div className="text-sm text-base-content/70 space-y-1">
                    <p className="font-semibold">
                      {cv.personalInfo.firstName} {cv.personalInfo.lastName}
                    </p>
                    <p>{cv.personalInfo.email}</p>
                    {cv.personalInfo.phone && <p>{cv.personalInfo.phone}</p>}
                  </div>

                  {/* Stats */}
                  <div className="divider my-2"></div>
                  <div className="flex gap-4 text-xs text-base-content/60">
                    <span>{cv.experience.length} Experience</span>
                    <span>{cv.education.length} Education</span>
                    <span>{cv.skills.length} Skills</span>
                  </div>

                  {/* Updated Date */}
                  <p className="text-xs text-base-content/50 mt-2">
                    Updated {format(new Date(cv.updatedAt), 'MMM dd, yyyy')}
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
                          <Link to={`/cv/${cv.id}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                        </li>
                        <li>
                          <Link to={`/cv/${cv.id}/edit`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                        </li>
                        <li>
                          <button onClick={() => handleDuplicate(cv)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Duplicate
                          </button>
                        </li>
                        {!cv.isDefault && (
                          <li>
                            <button onClick={() => handleSetDefault(cv.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Set as Default
                            </button>
                          </li>
                        )}
                        <li className="menu-title">
                          <span className="text-error">Danger Zone</span>
                        </li>
                        <li>
                          <button onClick={() => handleDelete(cv.id)} className="text-error">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                    <Link to={`/cv/${cv.id}/edit`} className="btn btn-primary btn-sm">
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CVBuilder;
