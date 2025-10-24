// Esta será la página protegida que se ve solo si el usuario está logueado

const DashboardPage = () => {
  return (
    <div className="container mt-5">
      <h1>Bienvenido al Dashboard</h1>
      <p>Solo los usuarios autenticados pueden ver esta página.</p>
    </div>
  );
};


export default DashboardPage;
