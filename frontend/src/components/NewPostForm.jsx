import React, { useState } from 'react'
import { createPost } from '../api'

export default function NewPostForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title || !content) return
    const token = localStorage.getItem('learnato_token')
    const post = await createPost({ title, content, author }, token)
    onCreate(post)
    setTitle('')
    setContent('')
    setAuthor('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        id="new-post-title"
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 
                   bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                   placeholder-slate-400 dark:placeholder-slate-300 
                   focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 
                   bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                   placeholder-slate-400 dark:placeholder-slate-300 
                   focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-28 resize-none"
      />
      <input
        type="text"
        placeholder="Your name (optional)"
        value={author}
        onChange={e => setAuthor(e.target.value)}
        className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 
                   bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                   placeholder-slate-400 dark:placeholder-slate-300 
                   focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all"
        >
          Post
        </button>
      </div>
    </form>
  )
}
