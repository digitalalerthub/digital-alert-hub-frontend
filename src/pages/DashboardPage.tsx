import React from 'react';

const DashboardPage: React.FC = () => {
  
  return (
    <div className="dashboard-background d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center text-white">
        <h1>Bienvenido al Dashboard</h1>
        <p>Solo los usuarios autenticados pueden ver esta página.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
