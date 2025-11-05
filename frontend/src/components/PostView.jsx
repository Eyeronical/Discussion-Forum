import React, { useEffect, useState } from 'react'
import { getPost, replyPost, upvote, markAnswered, summarize } from '../api'

export default function PostView({ postId }) {
  const [post, setPost] = useState(null)
  const [reply, setReply] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    if (postId) load()
    else setPost(null)
  }, [postId])

  async function load() {
    const p = await getPost(postId)
    setPost(p)
  }

  async function submitReply(e) {
    e.preventDefault()
    if (!reply) return
    const token = localStorage.getItem('learnato_token')
    await replyPost(postId, { content: reply, author: name }, token)
    setReply('')
    setName('')
    load()
  }

  if (!post) {
    return (
      <div className="text-center text-slate-500 dark:text-slate-400">
        Select a post to view details
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{post.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {post.author_name || post.author || 'Anonymous'} • {new Date(post.created_at || post.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right space-y-2">
          <div className="text-sm text-slate-500 dark:text-slate-300">Votes: {post.votes}</div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={async () => { await upvote(postId); load() }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all"
            >
              Upvote
            </button>
            <button
              onClick={async () => {
                const token = localStorage.getItem('learnato_token')
                await markAnswered(postId, token)
                load()
              }}
              className="px-3 py-1.5 bg-slate-500 hover:bg-slate-400 text-white rounded-lg text-sm font-medium transition-all"
            >
              Mark Answered
            </button>
          </div>
        </div>
      </div>

      <div className="text-base text-slate-800 dark:text-slate-100 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-3">
        {post.content}
      </div>

      <div>
        <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">Replies</h4>
        <div className="space-y-3">
          {post.replies && post.replies.map(r => (
            <div key={r.id} className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
              <p className="text-slate-800 dark:text-slate-100">{r.content}</p>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                — {r.author_name || r.author || 'Anonymous'} • {new Date(r.created_at || r.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={submitReply} className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <textarea
          className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Your reply"
          value={reply}
          onChange={e => setReply(e.target.value)}
        />
        <input
          className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Your name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="flex justify-end">
          <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all">
            Reply
          </button>
        </div>
      </form>

      <div className="text-right">
        <button
          onClick={async () => {
            const r = await summarize(postId)
            alert(r.summary || 'No summary or API key configured')
          }}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-all"
        >
          AI Summarize
        </button>
      </div>
    </div>
  )
}
