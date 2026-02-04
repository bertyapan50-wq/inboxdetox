import React, { useState, useEffect } from 'react';
import { 
  Folder,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Tag,
  Inbox,
  Mail,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp
} from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#6366f1', icon: 'folder' });
  const [message, setMessage] = useState(null);

  // Available colors for categories
  const colors = [
    { value: '#6366f1', name: 'Indigo' },
    { value: '#8b5cf6', name: 'Purple' },
    { value: '#ec4899', name: 'Pink' },
    { value: '#f43f5e', name: 'Rose' },
    { value: '#ef4444', name: 'Red' },
    { value: '#f97316', name: 'Orange' },
    { value: '#eab308', name: 'Yellow' },
    { value: '#84cc16', name: 'Lime' },
    { value: '#22c55e', name: 'Green' },
    { value: '#10b981', name: 'Emerald' },
    { value: '#14b8a6', name: 'Teal' },
    { value: '#06b6d4', name: 'Cyan' },
    { value: '#0ea5e9', name: 'Sky' },
    { value: '#3b82f6', name: 'Blue' }
  ];

  // Available icons
  const icons = ['folder', 'tag', 'mail', 'inbox', 'sparkles'];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/categories', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories || []);
      } else {
        // Demo data if API not available
        setCategories([
          { id: '1', name: 'Work', color: '#6366f1', icon: 'folder', emailCount: 342 },
          { id: '2', name: 'Personal', color: '#ec4899', icon: 'mail', emailCount: 128 },
          { id: '3', name: 'Shopping', color: '#eab308', icon: 'tag', emailCount: 89 },
          { id: '4', name: 'Newsletter', color: '#8b5cf6', icon: 'sparkles', emailCount: 267 }
        ]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set demo data on error
      setCategories([
        { id: '1', name: 'Work', color: '#6366f1', icon: 'folder', emailCount: 342 },
        { id: '2', name: 'Personal', color: '#ec4899', icon: 'mail', emailCount: 128 },
        { id: '3', name: 'Shopping', color: '#eab308', icon: 'tag', emailCount: 89 },
        { id: '4', name: 'Newsletter', color: '#8b5cf6', icon: 'sparkles', emailCount: 267 }
      ]);
      showMessage('Using demo data. Connect to API for real categories.', 'info');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      showMessage('Please enter a category name', 'error');
      return;
    }

    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newCategory)
      });
      const data = await response.json();

      if (data.success) {
        setCategories([...categories, data.category]);
        showMessage('Category created successfully', 'success');
        setIsCreating(false);
        setNewCategory({ name: '', color: '#6366f1', icon: 'folder' });
      } else {
        // Demo mode - create locally
        const demoCategory = {
          id: Date.now().toString(),
          ...newCategory,
          emailCount: 0
        };
        setCategories([...categories, demoCategory]);
        showMessage('Category created (demo mode)', 'success');
        setIsCreating(false);
        setNewCategory({ name: '', color: '#6366f1', icon: 'folder' });
      }
    } catch (error) {
      console.error('Error creating category:', error);
      // Demo mode - create locally
      const demoCategory = {
        id: Date.now().toString(),
        ...newCategory,
        emailCount: 0
      };
      setCategories([...categories, demoCategory]);
      showMessage('Category created (demo mode)', 'success');
      setIsCreating(false);
      setNewCategory({ name: '', color: '#6366f1', icon: 'folder' });
    }
  };

  const updateCategory = async (id, updates) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      const data = await response.json();

      if (data.success) {
        setCategories(categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
        showMessage('Category updated', 'success');
        setEditingId(null);
      } else {
        // Demo mode
        setCategories(categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
        showMessage('Category updated (demo mode)', 'success');
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      // Demo mode
      setCategories(categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
      showMessage('Category updated (demo mode)', 'success');
      setEditingId(null);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Emails will not be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setCategories(categories.filter(cat => cat.id !== id));
        showMessage('Category deleted', 'success');
      } else {
        // Demo mode
        setCategories(categories.filter(cat => cat.id !== id));
        showMessage('Category deleted (demo mode)', 'success');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      // Demo mode
      setCategories(categories.filter(cat => cat.id !== id));
      showMessage('Category deleted (demo mode)', 'success');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const getIcon = (iconName) => {
    const iconMap = {
      folder: Folder,
      tag: Tag,
      mail: Mail,
      inbox: Inbox,
      sparkles: Sparkles
    };
    return iconMap[iconName] || Folder;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <span className="text-lg text-slate-600 font-medium">Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg shadow-indigo-500/50">
                  <Folder className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Email Categories
                  </h1>
                  <p className="text-slate-600 mt-1">Organize your emails with custom categories</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsCreating(true)}
                className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/70 hover:scale-105"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                New Category
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-2xl p-5 flex items-center gap-3 animate-in slide-in-from-top duration-300 backdrop-blur-xl border ${
            message.type === 'success' 
              ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/50 shadow-lg shadow-emerald-500/20' 
              : message.type === 'error'
              ? 'bg-red-50/80 text-red-800 border-red-200/50 shadow-lg shadow-red-500/20'
              : 'bg-blue-50/80 text-blue-800 border-blue-200/50 shadow-lg shadow-blue-500/20'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Create New Category Form */}
        {isCreating && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Create New Category</h3>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewCategory({ name: '', color: '#6366f1', icon: 'folder' });
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g., Work, Personal, Shopping"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Color</label>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                        className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                          newCategory.color === color.value 
                            ? 'scale-110 ring-4 ring-offset-2' 
                            : 'hover:scale-105'
                        }`}
                        style={{ 
                          backgroundColor: color.value,
                          ringColor: color.value
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Icon</label>
                  <div className="flex gap-3">
                    {icons.map((iconName) => {
                      const IconComponent = getIcon(iconName);
                      return (
                        <button
                          key={iconName}
                          onClick={() => setNewCategory({ ...newCategory, icon: iconName })}
                          className={`p-4 rounded-xl transition-all duration-200 ${
                            newCategory.icon === iconName
                              ? 'bg-indigo-100 text-indigo-600 scale-110'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createCategory}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    Create Category
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewCategory({ name: '', color: '#6366f1', icon: 'folder' });
                    }}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-16 text-center">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Folder className="w-16 h-16 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">No Categories Yet</h3>
              <p className="text-slate-600 mb-8 text-lg">Create your first category to organize emails</p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 inline-flex items-center gap-3 shadow-xl shadow-indigo-500/50 hover:shadow-2xl hover:scale-105 font-semibold text-lg"
              >
                <Plus className="w-6 h-6" />
                Create Category
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = getIcon(category.icon);
              const isEditing = editingId === category.id;

              return (
                <div key={category.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 overflow-hidden p-6">
                    {/* Color bar */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-2"
                      style={{ backgroundColor: category.color }}
                    ></div>

                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="p-4 rounded-xl shadow-lg"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <IconComponent 
                          className="w-8 h-8" 
                          style={{ color: category.color }}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(isEditing ? null : category.id)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-2">{category.name}</h3>
                    
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {category.emailCount || 0} emails
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border border-blue-200/50 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
            <div className="flex gap-5">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl h-fit shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-3 text-lg">About Categories</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>Organize emails by topic, sender, or importance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>Automatically categorize new emails with AI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>Custom colors and icons for visual organization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>Filter and search emails by category</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-from-top {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}