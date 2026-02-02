// src/components/settings/SimplePreferences.jsx
// Simplified version - Theme only
import React from 'react';
import { Moon, Sun, Monitor, Settings } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function SimplePreferences() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-sm text-gray-600">Customize your experience</p>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'light', icon: Sun, label: 'Light', desc: 'Bright and clear' },
                { value: 'dark', icon: Moon, label: 'Dark', desc: 'Easy on the eyes' },
                { value: 'auto', icon: Monitor, label: 'Auto', desc: 'Match system' }
              ].map(({ value, icon: Icon, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    theme === value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-3 ${
                    theme === value ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  <div className={`font-semibold mb-1 ${
                    theme === value ? 'text-indigo-600' : 'text-gray-800'
                  }`}>
                    {label}
                  </div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ✨ <strong>More settings coming soon!</strong> We're working on additional customization options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}