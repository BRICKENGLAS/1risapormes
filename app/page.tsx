'use client'

import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

interface Joke {
  id: string
  likes: number
  content: string
  is_joke_of_the_month: boolean
  username: string
}

export default function Home() {
  const [jokes, setJokes] = useState<Joke[]>([])
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState('')

  // --- Obtener usuario actual y escuchar cambios ---
  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user ?? null)
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // --- Obtener chistes ---
  useEffect(() => {
    async function fetchJokes() {
      // Traer todos los chistes
      const { data, error } = await supabase
        .from('jokes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.log('Error fetching jokes:', error)
        return
      }

      // Traer usernames de los usuarios
      const jokesWithUsernames = await Promise.all(
        (data || []).map(async (joke: any) => {
          if (!joke.user_id) return { ...joke, username: 'Anon' }
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', joke.user_id)
            .single()
          return { ...joke, username: profile?.username || 'Anon' }
        })
      )

      setJokes(jokesWithUsernames)
    }

    fetchJokes()
  }, [user])

  const jokeOfTheMonth = jokes.find(j => j.is_joke_of_the_month)
  const communityJokes = jokes.filter(j => !j.is_joke_of_the_month)

  // --- Funciones de autenticación ---
  async function handleLogin() {
    const email = prompt('Introduce tu email:')
    const password = prompt('Introduce tu contraseña:')
    if (!email || !password) return
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert('Error: ' + error.message)
  }

  async function handleRegister() {
    const email = prompt('Introduce tu email:')
    const password = prompt('Introduce tu contraseña:')
    const username = prompt('Elige tu nombre de usuario:')
    if (!email || !password || !username) return

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      alert('Error: ' + error.message)
      return
    }

    alert('¡Registro exitoso! Revisa tu correo para verificar tu cuenta antes de iniciar sesión.')

    // Crear perfil para guardar username
    if (data.user) {
      await supabase.from('profiles').insert([{ id: data.user.id, username }])
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  // --- Publicar chiste ---
  async function handlePublish() {
    if (!content) return
    if (!user) return alert('Debes iniciar sesión')
    const { error } = await supabase.from('jokes').insert([
      { content, user_id: user.id }
    ])
    if (error) alert('Error: ' + error.message)
    else {
      setContent('')
      // recargar chistes sin recargar toda la página
      const { data } = await supabase.from('jokes').select('*').order('created_at', { ascending: false })
      setJokes(data || [])
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-800 text-white shadow-md p-6 flex flex-col">
        <h1 className="text-3xl font-bold mb-8">1RXM</h1>
        <nav className="flex flex-col gap-4">
          <a href="#joke-of-month" className="hover:text-yellow-400">Chiste del Mes</a>
          <a href="#community" className="hover:text-yellow-400">Comunidad</a>
          {user && <a href="#publish" className="hover:text-yellow-400">Enviar Chiste</a>}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Top menu */}
        <header className="flex justify-end mb-8 gap-4">
          {!user ? (
            <>
              <button className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-300" onClick={handleRegister}>
                Registrarse
              </button>
              <button className="px-4 py-2 bg-gray-800 text-white rounded font-semibold hover:bg-gray-700" onClick={handleLogin}>
                Iniciar Sesión
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-gray-800 font-semibold">Hola, {user.email}</span>
              <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          )}
        </header>

        {/* Chiste del mes */}
        <section id="joke-of-month" className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Chiste del Mes</h2>
          <div className="p-6 bg-white shadow rounded text-gray-900">
            {jokeOfTheMonth ? (
              <p>{jokeOfTheMonth.content}</p>
            ) : (
              <p>No hay chiste del mes aún</p>
            )}
          </div>
        </section>

        {/* Comunidad */}
        <section id="community" className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Chistes de la Comunidad</h2>
          <div className="flex flex-col gap-4">
            {communityJokes.length === 0 ? (
              <p className="text-gray-600">No hay chistes todavía</p>
            ) : (
              communityJokes.map(j => (
                <div key={j.id} className="p-4 bg-gray-50 shadow rounded text-gray-900">
                  <p>{j.content}</p>
                  <p className="text-sm text-gray-500 mt-2">— {j.username}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Formulario para publicar chiste */}
        {user && (
          <section id="publish" className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Enviar Chiste</h2>
            <textarea
              className="w-full p-4 rounded shadow border border-gray-300 bg-gray-50 text-gray-900 resize-none"
              rows={4}
              placeholder="Escribe tu chiste aquí..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <button
              className="mt-2 px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-300"
              onClick={handlePublish}
            >
              Publicar
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
