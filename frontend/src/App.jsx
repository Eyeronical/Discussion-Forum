import React, { useEffect, useState } from 'react'
import NewPostForm from './components/NewPostForm'
import PostList from './components/PostList'
import PostView from './components/PostView'
import { fetchPosts } from './api'
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000')

export default function App() {
  const [posts, setPosts] = useState([])
  const [selected, setSelected] = useState(null)
  const [dark, setDark] = useState(false)

  useEffect(() => { load() }, [])
  useEffect(() => {
    socket.on('new_post', p => setPosts(prev => [p, ...prev]))
    socket.on('new_reply', ({ postId, reply }) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: [...p.replies, reply] } : p)))
    socket.on('upvote', ({ postId, votes }) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, votes } : p)))
    socket.on('answered', ({ postId }) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, answered: true } : p)))
    return () => { socket.off('new_post'); socket.off('new_reply'); socket.off('upvote'); socket.off('answered') }
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'n') document.querySelector('#new-post-title')?.focus()
      if (e.key === '/') { e.preventDefault(); document.querySelector('#search-input')?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function load() { const data = await fetchPosts(); setPosts(data) }

  const totalPosts = posts.length
  const totalReplies = posts.reduce((s, p) => s + (p.replies?.length || 0), 0)
  const topPost = posts.slice().sort((a, b) => (b.votes || 0) - (a.votes || 0))[0]

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-all duration-300 text-slate-900 dark:text-slate-100">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          <header className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Learnato <span className="text-indigo-500">— Discussion Forum</span>
            </h1>
            <button
              onClick={() => setDark(d => !d)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
            >
              Toggle Dark
            </button>
          </header>

          <main className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                <NewPostForm onCreate={(p) => setPosts(prev => [p, ...prev])} />
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between text-center">
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total posts</div>
                    <div className="text-2xl font-semibold">{totalPosts}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total replies</div>
                    <div className="text-2xl font-semibold">{totalReplies}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Top post</div>
                    <div className="text-lg">{topPost ? topPost.title : '—'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                <input
                  id="search-input"
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Search posts (press / to focus)"
                />
                <PostList posts={posts} onSelect={setSelected} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
              <PostView postId={selected} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
