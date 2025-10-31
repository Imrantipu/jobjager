import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import CVForm from '@/components/cv/CVForm';
import { CVService, type CV } from '@/services/cvService';

const CVEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cv, setCV] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/cv');
      return;
    }

    loadCV();
  }, [id]);

  const loadCV = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CVService.getById(id!);
      setCV(data);
    } catch (err: any) {
      console.error('Failed to load CV:', err);
      setError('Failed to load CV');
    } finally {
      setLoading(false);
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

  if (error || !cv) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="alert alert-error">
            <span>{error || 'CV not found'}</span>
          </div>
          <button onClick={() => navigate('/cv')} className="btn btn-ghost mt-4">
            Back to CVs
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit CV</h1>
          <p className="text-base-content/70">Update your CV information</p>
        </div>

        <CVForm mode="edit" initialData={cv} />
      </div>
    </MainLayout>
  );
};

export default CVEdit;
