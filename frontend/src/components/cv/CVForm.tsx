import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CVService, type CreateCVData, type CV, type SkillLevel, type LanguageLevel } from '@/services/cvService';

interface CVFormProps {
  initialData?: CV;
  mode: 'create' | 'edit';
}

const skillLevels: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const languageLevels: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'];

const CVForm = ({ initialData, mode }: CVFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [formData, setFormData] = useState<CreateCVData>({
    title: initialData?.title || '',
    personalInfo: initialData?.personalInfo || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      linkedIn: '',
      github: '',
      portfolio: '',
      summary: '',
    },
    experience: initialData?.experience || [],
    education: initialData?.education || [],
    skills: initialData?.skills || [],
    languages: initialData?.languages || [],
    isDefault: initialData?.isDefault || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (mode === 'create') {
        await CVService.create(formData);
      } else if (initialData) {
        await CVService.update(initialData.id, formData);
      }
      navigate('/cv');
    } catch (err: any) {
      console.error('Failed to save CV:', err);
      alert('Failed to save CV. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Experience handlers
  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...(formData.experience || []), {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        location: '',
        achievements: [''],
      }],
    });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...(formData.experience || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, experience: updated });
  };

  const removeExperience = (index: number) => {
    setFormData({
      ...formData,
      experience: (formData.experience || []).filter((_: any, i: number) => i !== index),
    });
  };

  const addAchievement = (expIndex: number) => {
    const updated = [...(formData.experience || [])];
    updated[expIndex].achievements.push('');
    setFormData({ ...formData, experience: updated });
  };

  const updateAchievement = (expIndex: number, achIndex: number, value: string) => {
    const updated = [...(formData.experience || [])];
    updated[expIndex].achievements[achIndex] = value;
    setFormData({ ...formData, experience: updated });
  };

  const removeAchievement = (expIndex: number, achIndex: number) => {
    const updated = [...(formData.experience || [])];
    updated[expIndex].achievements = updated[expIndex].achievements.filter((_: any, i: number) => i !== achIndex);
    setFormData({ ...formData, experience: updated });
  };

  // Education handlers
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...(formData.education || []), {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false,
        grade: '',
      }],
    });
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...(formData.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, education: updated });
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: (formData.education || []).filter((_: any, i: number) => i !== index),
    });
  };

  // Skills handlers
  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...(formData.skills || []), { category: '', name: '', level: 'Intermediate' }],
    });
  };

  const updateSkill = (index: number, field: string, value: any) => {
    const updated = [...(formData.skills || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, skills: updated });
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: (formData.skills || []).filter((_: any, i: number) => i !== index),
    });
  };

  // Languages handlers
  const addLanguage = () => {
    setFormData({
      ...formData,
      languages: [...(formData.languages || []), { name: '', level: 'B2' }],
    });
  };

  const updateLanguage = (index: number, field: string, value: any) => {
    const updated = [...(formData.languages || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, languages: updated });
  };

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languages: (formData.languages || []).filter((_: any, i: number) => i !== index),
    });
  };

  const tabs = ['Personal Info', 'Experience', 'Education', 'Skills', 'Languages'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* CV Title */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">CV Title *</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Frontend Developer CV"
              required
            />
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                className="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <span className="label-text">Set as default CV</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-100 shadow-xl p-2">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`tab ${activeTab === index ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Personal Info Tab */}
          {activeTab === 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">First Name *</span></label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.personalInfo.firstName}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, firstName: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Last Name *</span></label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.personalInfo.lastName}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, lastName: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Email *</span></label>
                  <input
                    type="email"
                    className="input input-bordered"
                    value={formData.personalInfo.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, email: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Phone *</span></label>
                  <input
                    type="tel"
                    className="input input-bordered"
                    value={formData.personalInfo.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, phone: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">City</span></label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.personalInfo.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, city: e.target.value }
                    })}
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Postal Code</span></label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.personalInfo.postalCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, postalCode: e.target.value }
                    })}
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label"><span className="label-text">Address</span></label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.personalInfo.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, address: e.target.value }
                    })}
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Country</span></label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.personalInfo.country}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, country: e.target.value }
                    })}
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">LinkedIn</span></label>
                  <input
                    type="url"
                    className="input input-bordered"
                    value={formData.personalInfo.linkedIn}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, linkedIn: e.target.value }
                    })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">GitHub</span></label>
                  <input
                    type="url"
                    className="input input-bordered"
                    value={formData.personalInfo.github}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, github: e.target.value }
                    })}
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text">Portfolio</span></label>
                  <input
                    type="url"
                    className="input input-bordered"
                    value={formData.personalInfo.portfolio}
                    onChange={(e) => setFormData({
                      ...formData,
                      personalInfo: { ...formData.personalInfo, portfolio: e.target.value }
                    })}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text">Professional Summary</span></label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  value={formData.personalInfo.summary}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalInfo: { ...formData.personalInfo, summary: e.target.value }
                  })}
                  placeholder="Brief overview of your professional background and goals..."
                />
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Work Experience</h3>
                <button type="button" onClick={addExperience} className="btn btn-primary btn-sm">
                  Add Experience
                </button>
              </div>

              {(formData.experience || []).length === 0 && (
                <p className="text-base-content/60 text-center py-8">No experience added yet. Click "Add Experience" to get started.</p>
              )}

              {(formData.experience || []).map((exp, index) => (
                <div key={index} className="border border-base-300 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Experience #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="form-control">
                      <label className="label label-text-alt">Company *</label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">Position *</label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">Start Date *</label>
                      <input
                        type="month"
                        className="input input-bordered input-sm"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">End Date</label>
                      <input
                        type="month"
                        className="input input-bordered input-sm"
                        value={exp.endDate || ''}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                        disabled={exp.current}
                      />
                    </div>

                    <div className="form-control md:col-span-2">
                      <label className="label label-text-alt">Location</label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={exp.location || ''}
                        onChange={(e) => updateExperience(index, 'location', e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>

                    <div className="form-control md:col-span-2">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={exp.current || false}
                          onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                        />
                        <span className="label-text-alt">Currently working here</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="label-text-alt font-semibold">Achievements & Responsibilities</label>
                      <button
                        type="button"
                        onClick={() => addAchievement(index)}
                        className="btn btn-ghost btn-xs"
                      >
                        + Add
                      </button>
                    </div>
                    {exp.achievements.map((ach, achIndex) => (
                      <div key={achIndex} className="flex gap-2">
                        <input
                          type="text"
                          className="input input-bordered input-sm flex-1"
                          value={ach}
                          onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                          placeholder="Describe an achievement or responsibility..."
                        />
                        <button
                          type="button"
                          onClick={() => removeAchievement(index, achIndex)}
                          className="btn btn-ghost btn-sm btn-square text-error"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Education</h3>
                <button type="button" onClick={addEducation} className="btn btn-primary btn-sm">
                  Add Education
                </button>
              </div>

              {(formData.education || []).length === 0 && (
                <p className="text-base-content/60 text-center py-8">No education added yet. Click "Add Education" to get started.</p>
              )}

              {(formData.education || []).map((edu, index) => (
                <div key={index} className="border border-base-300 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Education #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="form-control md:col-span-2">
                      <label className="label label-text-alt">Institution *</label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">Degree *</label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        placeholder="e.g., Bachelor of Science"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">Field of Study *</label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={edu.field}
                        onChange={(e) => updateEducation(index, 'field', e.target.value)}
                        placeholder="e.g., Computer Science"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">Start Date *</label>
                      <input
                        type="month"
                        className="input input-bordered input-sm"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">End Date</label>
                      <input
                        type="month"
                        className="input input-bordered input-sm"
                        value={edu.endDate || ''}
                        onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                        disabled={edu.current}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">Grade/GPA</label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={edu.grade || ''}
                        onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                        placeholder="e.g., 3.8/4.0 or 1.5"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={edu.current || false}
                          onChange={(e) => updateEducation(index, 'current', e.target.checked)}
                        />
                        <span className="label-text-alt">Currently studying</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Skills</h3>
                <button type="button" onClick={addSkill} className="btn btn-primary btn-sm">
                  Add Skill
                </button>
              </div>

              {(formData.skills || []).length === 0 && (
                <p className="text-base-content/60 text-center py-8">No skills added yet. Click "Add Skill" to get started.</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(formData.skills || []).map((skill, index) => (
                  <div key={index} className="border border-base-300 rounded-lg p-3 space-y-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">Category</label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={skill.category}
                        onChange={(e) => updateSkill(index, 'category', e.target.value)}
                        placeholder="e.g., Frontend, Backend, Tools"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">Skill Name *</label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, 'name', e.target.value)}
                        placeholder="e.g., React, TypeScript"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">Proficiency Level *</label>
                      <select
                        className="select select-bordered select-sm"
                        value={skill.level}
                        onChange={(e) => updateSkill(index, 'level', e.target.value)}
                        required
                      >
                        {skillLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages Tab */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Languages</h3>
                <button type="button" onClick={addLanguage} className="btn btn-primary btn-sm">
                  Add Language
                </button>
              </div>

              {(formData.languages || []).length === 0 && (
                <p className="text-base-content/60 text-center py-8">No languages added yet. Click "Add Language" to get started.</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(formData.languages || []).map((lang, index) => (
                  <div key={index} className="border border-base-300 rounded-lg p-3 space-y-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">Language *</label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={lang.name}
                        onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                        placeholder="e.g., English, German"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label label-text-alt">Proficiency Level (CEFR) *</label>
                      <select
                        className="select select-bordered select-sm"
                        value={lang.level}
                        onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                        required
                      >
                        {languageLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => navigate('/cv')}
          className="btn btn-ghost"
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
            mode === 'create' ? 'Create CV' : 'Update CV'
          )}
        </button>
      </div>
    </form>
  );
};

export default CVForm;
