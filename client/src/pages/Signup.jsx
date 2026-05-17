import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFoodStore } from '../store/foodStore';
import { AlertCircle } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading: authLoading, error: authError, clearError } = useAuthStore();
  const { schools, fetchSchools, isLoading: schoolsLoading } = useFoodStore();
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', username: '', firstName: '', lastName: '', schoolId: '',
  });
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLocalError(null);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.username) {
      setLocalError('Email, username, and password are required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    try {
      await signup(formData.email, formData.password, formData.username, formData.firstName, formData.lastName, formData.schoolId || null);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary-light/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-poppins font-bold text-primary mb-2">CafCal</h1>
            <p className="text-gray-600">Create your account</p>
          </div>
          {(authError || localError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{authError || localError}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" className="input-field" disabled={authLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-2">Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="username" className="input-field" disabled={authLoading} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" className="input-field" disabled={authLoading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-gray mb-2">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" className="input-field" disabled={authLoading} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-2">School</label>
              <select name="schoolId" value={formData.schoolId} onChange={handleChange} className="input-field" disabled={authLoading || schoolsLoading}>
                <option value="">Select your school</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>{school.name} - {school.state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="input-field" disabled={authLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-gray mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="input-field" disabled={authLoading} />
            </div>
            <button type="submit" disabled={authLoading || schoolsLoading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {authLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}