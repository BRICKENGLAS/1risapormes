'use client'
import { useState } from 'react'

export default function Home() {
  const [tab, setTab] = useState<'month' | 'community' | 'publish'>('month')

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-800 text-white shadow-md p-6 flex flex-col">
        <h1 className="text-3xl font-bold mb-8">1RXM</h1>
        <nav className="flex flex-col gap-4">
          <button onClick={() => setTab('month')} className="text-left hover:text-yellow-400">
            Chiste del Mes
          </button>
          <button onClick={() => setTab('community')} className="text-left hover:text-yellow-400">
            Comunidad
          </button>
          <button onClick={() => setTab('publish')} className="text-left hover:text-yellow-400">
            Enviar Chiste
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Mostrar solo la sección seleccionada */}
        {tab === 'month' && (
          <section id="joke-of-month">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Chiste del Mes</h2>
            <div className="p-8 bg-yellow-100 rounded-lg shadow-md text-gray-900">
              Aquí va el chiste del mes
            </div>
          </section>
        )}

        {tab === 'community' && (
          <section id="community">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Chistes de la Comunidad</h2>
            <div className="flex flex-col gap-4">
              {/* Aquí mapeas los chistes de la comunidad */}
              <div className="p-6 bg-gray-50 shadow rounded text-gray-900">
                Ejemplo chiste de la comunidad
              </div>
            </div>
          </section>
        )}

        {tab === 'publish' && (
          <section id="publish">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Enviar Chiste</h2>
            <textarea
              className="w-full p-4 rounded shadow border border-gray-300 bg-gray-50 text-gray-900 resize-none"
              rows={4}
              placeholder="Escribe tu chiste aquí..."
            />
            <button className="mt-2 px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-300">
              Publicar
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
