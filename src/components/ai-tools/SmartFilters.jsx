import React, { useState, useEffect } from 'react';
import { 
  Filter, Plus, X, Trash2, Save, Sparkles, Mail, User, Tag, Search, 
  Zap, Archive, Star, AlertCircle, Cloud, CloudOff, RefreshCw, Play
} from 'lucide-react';

export default function SmartFilters({ emails, onApplyFilter }) {
  const [filters, setFilters] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [syncing, setSyncing] = useState(null);
  const [applying, setApplying] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [newFilter, setNewFilter] = useState({
    name: '',
    enabled: true,
    conditions: [{ field: 'sender', operator: 'contains', value: '' }],
    actions: [{ type: 'label', value: '' }],
    gmailFilterId: null,
    syncedToGmail: false
  });

  // ✅ ADD THIS: Validation helper function
  const validateLabelName = (name) => {
    if (!name || !name.trim()) {
      return { valid: false, error: 'Label name cannot be empty' };
    }
    
    const trimmed = name.trim();
    
    if (trimmed.length > 225) {
      return { valid: false, error: 'Label name too long (max 225 characters)' };
    }
    
    if (trimmed.includes('/')) {
      return { valid: false, error: 'Label name cannot contain "/" character' };
    }
    
    return { valid: true, name: trimmed };
  };

  // Load filters from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('smartFilters');
    if (saved) {
      setFilters(JSON.parse(saved));
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (filters.length > 0) {
      localStorage.setItem('smartFilters', JSON.stringify(filters));
    }
  }, [filters]);

  const fieldOptions = [
    { value: 'sender', label: 'Sender', icon: User },
    { value: 'subject', label: 'Subject', icon: Mail },
    { value: 'body', label: 'Body', icon: Search },
    { value: 'category', label: 'Category', icon: Tag }
  ];

  const operatorOptions = {
    sender: ['contains', 'equals', 'not contains', 'ends with'],
    subject: ['contains', 'equals', 'starts with', 'not contains'],
    body: ['contains', 'not contains'],
    category: ['is', 'is not']
  };

  const actionOptions = [
    { value: 'label', label: 'Add Label', icon: Tag },
    { value: 'archive', label: 'Archive', icon: Archive },
    { value: 'star', label: 'Star', icon: Star },
    { value: 'category', label: 'Set Category', icon: Tag }
  ];

  // Apply filter logic
  const matchesCondition = (email, condition) => {
    const emailValue = (email[condition.field] || '').toLowerCase();
    const conditionValue = condition.value.toLowerCase();

    switch (condition.operator) {
      case 'contains':
        return emailValue.includes(conditionValue);
      case 'equals':
        return emailValue === conditionValue;
      case 'not contains':
        return !emailValue.includes(conditionValue);
      case 'starts with':
        return emailValue.startsWith(conditionValue);
      case 'ends with':
        return emailValue.endsWith(conditionValue);
      case 'is':
        return emailValue === conditionValue;
      case 'is not':
        return emailValue !== conditionValue;
      default:
        return false;
    }
  };

  const applyFilterToEmails = (filter) => {
    if (!emails) return [];
    
    return emails.filter(email => {
      return filter.conditions.every(condition => matchesCondition(email, condition));
    });
  };

  const addCondition = () => {
    setNewFilter({
      ...newFilter,
      conditions: [...newFilter.conditions, { field: 'sender', operator: 'contains', value: '' }]
    });
  };

  const removeCondition = (index) => {
    setNewFilter({
      ...newFilter,
      conditions: newFilter.conditions.filter((_, i) => i !== index)
    });
  };

  const updateCondition = (index, field, value) => {
    const updated = [...newFilter.conditions];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'field') {
      updated[index].operator = operatorOptions[value][0];
    }
    
    setNewFilter({ ...newFilter, conditions: updated });
  };

  const addAction = () => {
    setNewFilter({
      ...newFilter,
      actions: [...newFilter.actions, { type: 'label', value: '' }]
    });
  };

  const removeAction = (index) => {
    setNewFilter({
      ...newFilter,
      actions: newFilter.actions.filter((_, i) => i !== index)
    });
  };

  const updateAction = (index, field, value) => {
    const updated = [...newFilter.actions];
    updated[index] = { ...updated[index], [field]: value };
    setNewFilter({ ...newFilter, actions: updated });
  };

 const saveFilter = () => {
  if (!newFilter.name.trim()) {
    alert('Please enter a filter name');
    return;
  }
  
  if (!newFilter.conditions[0].value.trim()) {
    alert('Please enter a condition value');
    return;
  }
  
  // ✅ UPDATED: Validate all actions with proper label checking
  for (const action of newFilter.actions) {
    if (!action.value.trim()) {
      alert(`❌ Please enter a value for "${action.type}"`);
      return;
    }
    
    // ✅ Validate label names specifically
    if (action.type === 'label') {
      const validation = validateLabelName(action.value);
      if (!validation.valid) {
        alert(`❌ ${validation.error}\n\nPlease fix the label name.`);
        return;
      }
    }
  }

  const filterToSave = {
    ...newFilter,
    id: Date.now(),
    created: new Date().toISOString()
  };

  setFilters([...filters, filterToSave]);
  
  setNewFilter({
    name: '',
    enabled: true,
    conditions: [{ field: 'sender', operator: 'contains', value: '' }],
    actions: [{ type: 'label', value: '' }],
    gmailFilterId: null,
    syncedToGmail: false
  });
  
  setShowCreateModal(false);
  alert('✅ Filter created!\n\nClick "Sync to Gmail" to make it permanent.');
};

const toggleFilter = (id) => {
  setFilters(filters.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
};

const deleteFilter = (id) => {
  setDeleteConfirm(id);
};

const confirmDelete = async () => {
  const filter = filters.find(f => f.id === deleteConfirm);
    
    // If synced to Gmail, delete from Gmail too
    if (filter.syncedToGmail && filter.gmailFilterId) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/filters/${filter.gmailFilterId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          console.log('✅ Deleted from Gmail');
        }
      } catch (error) {
        console.error('❌ Error deleting from Gmail:', error);
      }
    }
    
    setFilters(filters.filter(f => f.id !== deleteConfirm));
    setDeleteConfirm(null);
  };

  const testFilter = async (filter) => {
    try {
      setTestResults({ loading: true, filter: filter, emails: [], count: 0 });

      const response = await fetch('${process.env.REACT_APP_API_URL}/api/filters/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ filter })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to test filter');
      }

      const data = await response.json();
      setTestResults({ loading: false, filter: filter, emails: data.emails, count: data.count, query: data.query });

    } catch (error) {
      console.error('❌ Error testing filter:', error);
      setTestResults({ loading: false, filter: filter, emails: [], count: 0, error: error.message });
    }
  };

  // ==========================================
  // ✅ SYNC FILTER TO GMAIL
  // ==========================================
  
  const syncToGmail = async (filter) => {
  setSyncing(filter.id);
  
  try {
    console.log('☁️ Syncing filter to Gmail:', filter.name);
    
    // ✅ ADD: Validate label names before sending to backend
    for (const action of filter.actions) {
      if (action.type === 'label') {
        const validation = validateLabelName(action.value);
        if (!validation.valid) {
          alert(`❌ ${validation.error}\n\nPlease edit the filter and fix the label name.`);
          setSyncing(null);
          return;
        }
      }
    }
    
    const response = await fetch('${process.env.REACT_APP_API_URL}/api/filters/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ filter })
    });
    
    // ✅ Handle permission errors with re-authentication
    if (response.status === 403) {
      const errorData = await response.json();
      
      if (errorData.needsReauth) {
        const confirmed = window.confirm(
          '🔐 Gmail Permission Required!\n\n' +
          'Your account needs to be re-authenticated with Gmail filter permissions.\n\n' +
          'Click OK to sign in again (you\'ll be redirected to Google).'
        );
        
        if (confirmed) {
           window.location.href = '/api/auth/reauth';
        }
        
        setSyncing(null);
        return;
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sync filter');
    }
    
    const data = await response.json();
    console.log('✅ Gmail filter created:', data);
    
    // Update filter with Gmail ID
    setFilters(filters.map(f => 
      f.id === filter.id 
        ? { ...f, gmailFilterId: data.filterId, syncedToGmail: true }
        : f
    ));
    
    alert(
      `✅ Filter "${filter.name}" synced to Gmail!\n\n` +
      `It will now automatically apply to all incoming emails.`
    );
    
  } catch (error) {
    console.error('❌ Error syncing to Gmail:', error);
    
    // ✅ Better error messages
    let errorMessage = error.message;
    
    if (error.message.includes('Invalid label')) {
      errorMessage = 'Invalid label name!\n\n• Label cannot be empty\n• Cannot contain "/" character\n• Must be 1-225 characters';
    } else if (error.message.includes('Insufficient Permission')) {
      errorMessage = 'Gmail permission required. Please re-authenticate.';
    }
    
    alert(`❌ Error: ${errorMessage}`);
  } finally {
    setSyncing(null);
  }
};

  // ==========================================
  // ✅ APPLY FILTER TO EXISTING EMAILS
  // ==========================================
  
  const applyNow = async (filter) => {
    setApplying(filter.id);
    
    try {
      console.log('⚡ Applying filter to existing emails:', filter.name);
      
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/filters/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ filter })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply filter');
      }
      
      const data = await response.json();
      console.log('✅ Filter applied:', data);
      
      alert(
        `✅ Filter applied!\n\n` +
        `${data.count} email(s) matched and updated.`
      );
      
    } catch (error) {
      console.error('❌ Error applying filter:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Smart Filters
            </h1>
            <p className="text-gray-600 mt-1">Create permanent Gmail filters with AI assistance</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Filters</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {filters.filter(f => f.enabled).length}
              </p>
            </div>
            <Zap className="w-12 h-12 text-purple-400" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Filters</p>
              <p className="text-3xl font-bold text-pink-600 mt-1">{filters.length}</p>
            </div>
            <Filter className="w-12 h-12 text-pink-400" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Synced to Gmail</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {filters.filter(f => f.syncedToGmail).length}
              </p>
            </div>
            <Cloud className="w-12 h-12 text-blue-400" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Emails Matched</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {filters.reduce((sum, f) => sum + applyFilterToEmails(f).length, 0)}
              </p>
            </div>
            <Mail className="w-12 h-12 text-green-400" />
          </div>
        </div>
      </div>

      {filters.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Filters Yet</h3>
          <p className="text-gray-600 mb-6">Create your first smart filter to automate email organization</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Create First Filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:border-purple-200 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => toggleFilter(filter.id)}
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      filter.enabled ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transition-all absolute top-0.5 ${
                        filter.enabled ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-800">{filter.name}</h3>
                      {filter.syncedToGmail ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
                          <Cloud className="w-3 h-3" />
                          GMAIL SYNCED
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full flex items-center gap-1">
                          <CloudOff className="w-3 h-3" />
                          LOCAL ONLY
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {filter.enabled ? '✅ Active' : '⏸️ Paused'} • Matches {applyFilterToEmails(filter).length} emails
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => testFilter(filter)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Test filter"
                  >
                    <Zap className="w-5 h-5" />
                  </button>
                  
                  {!filter.syncedToGmail && (
                    <button
                      onClick={() => syncToGmail(filter)}
                      disabled={syncing === filter.id}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                      title="Sync to Gmail"
                    >
                      {syncing === filter.id ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Cloud className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => applyNow(filter)}
                    disabled={applying === filter.id}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all disabled:opacity-50"
                    title="Apply to existing emails"
                  >
                    {applying === filter.id ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => deleteFilter(filter.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">📋 Conditions:</p>
                  {filter.conditions.map((cond, i) => (
                    <div key={i} className="bg-purple-50 rounded-lg p-3 mb-2">
                      <p className="text-sm text-gray-700">
                        When <span className="font-semibold text-purple-700">{cond.field}</span>{' '}
                        <span className="font-semibold text-pink-700">{cond.operator}</span>{' '}
                        <span className="font-semibold text-blue-700">"{cond.value}"</span>
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">⚡ Actions:</p>
                  {filter.actions.map((action, i) => (
                    <div key={i} className="bg-green-50 rounded-lg p-3 mb-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-green-700">{action.type}</span>:{' '}
                        <span className="text-gray-900">"{action.value}"</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create Smart Filter</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Name *</label>
                <input
                  type="text"
                  value={newFilter.name}
                  onChange={(e) => setNewFilter({ ...newFilter, name: e.target.value })}
                  placeholder="e.g., Important Clients"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">Conditions *</label>
                  <button
                    onClick={addCondition}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Condition
                  </button>
                </div>
                {newFilter.conditions.map((cond, index) => (
                  <div key={index} className="flex gap-2 mb-3 items-start">
                    <select
                      value={cond.field}
                      onChange={(e) => updateCondition(index, 'field', e.target.value)}
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      {fieldOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <select
                      value={cond.operator}
                      onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      {operatorOptions[cond.field]?.map(op => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={cond.value}
                      onChange={(e) => updateCondition(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    {newFilter.conditions.length > 1 && (
                      <button
                        onClick={() => removeCondition(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">Actions *</label>
                  <button
                    onClick={addAction}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Action
                  </button>
                </div>
                {newFilter.actions.map((action, index) => (
                  <div key={index} className="flex gap-2 mb-3 items-start">
                    <select
                      value={action.type}
                      onChange={(e) => updateAction(index, 'type', e.target.value)}
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      {actionOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={action.value}
                      onChange={(e) => updateAction(index, 'value', e.target.value)}
                      placeholder="Value (e.g., VIP, Work)"
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    {newFilter.actions.length > 1 && (
                      <button
                        onClick={() => removeAction(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={saveFilter}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Delete Filter?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this filter? 
              {filters.find(f => f.id === deleteConfirm)?.syncedToGmail && (
                <span className="block mt-2 text-red-600 font-semibold">
                  ⚠️ This will also delete the filter from Gmail!
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
              >
                Delete
              </button>

            </div>
          </div>
        </div>

      )}
{testResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">🧪 Test Results</h2>
                  <p className="text-blue-100 text-sm mt-1">Filter: {testResults.filter?.name}</p>
                </div>
                <button
                  onClick={() => setTestResults(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {testResults.loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Searching Gmail...</p>
                </div>
              ) : testResults.error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-700 font-semibold">Error</p>
                  <p className="text-red-600 text-sm">{testResults.error}</p>
                </div>
              ) : (
                <>
                  {testResults.query && (
                    <div className="bg-gray-50 rounded-lg px-4 py-2 mb-4">
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Gmail query:</span> {testResults.query}
                      </p>
                    </div>
                  )}

                  <div className={`rounded-xl p-4 mb-5 text-center ${testResults.count > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <p className={`text-4xl font-bold ${testResults.count > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {testResults.count}
                    </p>
                    <p className={`text-sm font-medium ${testResults.count > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {testResults.count === 1 ? 'email matched' : 'emails matched'}
                    </p>
                  </div>

                  {testResults.emails.length === 0 ? (
                    <div className="text-center py-6">
                      <Mail className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No emails match this filter</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {testResults.emails.map((email) => (
                        <div key={email.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 truncate">{email.subject || '(no subject)'}</p>
                              <p className="text-sm text-gray-500 mt-0.5 truncate">{email.sender}</p>
                            </div>
                            <p className="text-xs text-gray-400 whitespace-nowrap">{email.date ? new Date(email.date).toLocaleDateString() : ''}</p>
                          </div>
                          {email.snippet && (
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{email.snippet}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}