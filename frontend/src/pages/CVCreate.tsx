import MainLayout from '@/components/layout/MainLayout';
import CVForm from '@/components/cv/CVForm';

const CVCreate = () => {
  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New CV</h1>
          <p className="text-base-content/70">Fill in your information to create a professional CV</p>
        </div>

        <CVForm mode="create" />
      </div>
    </MainLayout>
  );
};

export default CVCreate;
