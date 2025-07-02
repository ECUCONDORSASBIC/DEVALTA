import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";

export default function DoctorsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-6">
            ALTAMEDICA Doctors Management
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Plataforma de gestión para profesionales médicos
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Mi Perfil</h2>
              <p className="text-gray-600">
                Gestiona tu información profesional y credenciales
              </p>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Citas</h2>
              <p className="text-gray-600">
                Administra tu calendario y citas con pacientes
              </p>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Pacientes</h2>
              <p className="text-gray-600">
                Accede al historial clínico de tus pacientes
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
