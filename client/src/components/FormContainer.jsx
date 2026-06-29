import React from 'react';

export const FormContainer = ({
  children,
  title,
  subtitle,
  onSubmit,
  className = '',
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-md ${className}`}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">📚</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-500 text-sm mt-2">{subtitle}</p>}
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {children}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 relative">
          <p className="text-gray-600 text-sm">
            StudentHub &copy; 2024 • For Students, By Students
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormContainer;
