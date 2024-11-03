export default function Home() {
  return (
      <div className="flex flex-col items-center justify-center p-8 gap-12 sm:p-16">
        <h1 className="text-4xl font-bold text-[#8B5E3C] text-center sm:text-left">
          Artesanías Bogotá Ltda.
        </h1>
        <p className="text-lg text-gray-700 text-center sm:text-left">
          Descubre la belleza de la artesanía colombiana
        </p>

          <ol className="text-[#8B5E3C] text-center sm:text-left space-y-4">
              <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-3 w-3 rounded-full bg-[#8B5E3C]"></span>
                  <span>Explora nuestra colección de <span
                      className="font-semibold">artesanías tradicionales</span></span>
              </li>
              <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-3 w-3 rounded-full bg-[#8B5E3C]"></span>
                  <span>Productos hechos a mano por artesanos locales</span>
              </li>
              <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-3 w-3 rounded-full bg-[#8B5E3C]"></span>
                  <span>Envíos a todo Colombia</span>
              </li>
          </ol>

          <div className="flex gap-4 flex-col sm:flex-row">
              <a
                  href="/login"
                  className="rounded-full bg-[#8B5E3C] text-white h-10 px-4 flex items-center justify-center transition-colors hover:bg-[#7A5333]"
              >
                  Iniciar Sesión
              </a>
              <a
                  href="/register"
                  className="rounded-full border border-[#8B5E3C]/20 text-[#8B5E3C] h-10 px-4 flex items-center justify-center transition-colors hover:bg-[#8B5E3C]/10 hover:border-transparent"
              >
                  Crear Cuenta
              </a>
          </div>
      </div>
  );
}
