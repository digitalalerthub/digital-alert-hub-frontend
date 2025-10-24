import RegisterForm from "../components/RegisterForm";

// Página de Registro (vista completa)
const RegisterPage = () => {
  return (
    <div>
      <h1>Registro</h1>
      {/* Inserta el formulario de registro */}
      <RegisterForm />
    </div>
  );
};

// Exporta la página para poder usarla en el router
export default RegisterPage;