'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Joke {
  id: string
  content: string
  is_joke_of_the_month: boolean
  user_id: string
  username?: string
}

export default function Home() {
  const [tab, setTab] = useState<'month' | 'community' | 'publish'>('month')
  const [user, setUser] = useState<any>(null)
  const [jokes, setJokes] = useState<Joke[]>([])
  const [content, setContent] = useState('')

  // Obtener usuario actual
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

  // Obtener chistes de Supabase
  useEffect(() => {
    async function fetchJokes() {
      const { data } = await supabase.from('jokes').select('*').order('created_at', { ascending: false })
      if (!data) return
      const jokesWithUsernames = await Promise.all(
        data.map(async (joke: any) => {
          if (!joke.user_id) return { ...joke, username: 'Anon' }
          const { data: profile } = await supabase.from('profiles').select('username').eq('id', joke.user_id).single()
          return { ...joke, username: profile?.username || 'Anon' }
        })
      )
      setJokes(jokesWithUsernames)
    }
    fetchJokes()
  }, [user])

  const jokeOfTheMonth = jokes.find(j => j.is_joke_of_the_month)
  const communityJokes = jokes.filter(j => !j.is_joke_of_the_month)

  // Enviar chiste
  const publishJoke = async () => {
    if (!content || !user) return
    await supabase.from('jokes').insert([{ content, user_id: user.id, is_joke_of_the_month: false }])
    setContent('')
    alert('Chiste enviado!') // opcional: mejor notificación
  }

  // Login rápido (puedes personalizar formularios)
  const signIn = async () => {
    const email = prompt('Introduce tu email')
    if (!email) return
    await supabase.auth.signInWithOtp({ email })
    alert('Revisa tu correo para iniciar sesión')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

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
          {user && (
            <button onClick={() => setTab('publish')} className="text-left hover:text-yellow-400">
              Enviar Chiste
            </button>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Top menu */}
        <header className="flex justify-end mb-8 gap-4">
          {!user ? (
            <div className="flex gap-4">
              <button
                onClick={() => setTab('login')}
                className="px-4 py-2 bg-gray-800 text-white rounded font-semibold hover:bg-gray-700"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setTab('register')}
                className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-300"
              >
                Registrarse
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-gray-800 font-semibold">Hola, {user.email}</span>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-400"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </header>


        {/* Secciones */}
        {tab === 'month' && (
          <section id="joke-of-month">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Chiste del Mes</h2>
            <div className="p-8 bg-yellow-100 rounded-lg shadow-md text-gray-900">
              {jokeOfTheMonth ? jokeOfTheMonth.content : 'No hay chiste del mes aún'}
            </div>
          </section>
        )}

        {tab === 'community' && (
          <section id="community">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Chistes de la Comunidad</h2>
            <div className="flex flex-col gap-4">
              {communityJokes.length === 0 ? (
                <p className="text-gray-600">No hay chistes todavía</p>
              ) : (
                communityJokes.map(j => (
                  <div key={j.id} className="p-6 bg-gray-50 shadow rounded text-gray-900">
                    <p>{j.content}</p>
                    <p className="text-sm text-gray-500 mt-2">— {j.username}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {tab === 'publish' && user && (
          <section id="publish">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Enviar Chiste</h2>
            <textarea
              className="w-full p-4 rounded shadow border border-gray-300 bg-gray-50 text-gray-900 resize-none"
              rows={4}
              placeholder="Escribe tu chiste aquí..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <button
              onClick={publishJoke}
              className="mt-2 px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-300"
            >
              Publicar
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
