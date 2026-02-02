import React from 'react';

const AppLayout = ({ children, sidebar }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      {sidebar}
      
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;