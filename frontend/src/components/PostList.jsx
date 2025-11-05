import React from 'react'
import { upvote } from '../api'

export default function PostList({ posts, onSelect }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Posts</h2>
      <div className="space-y-4">
        {posts.map(p => (
          <div
            key={p.id}
            className={`p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 hover:shadow-md transition-all ${p.answered ? 'opacity-80' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3
                  onClick={() => onSelect(p.id)}
                  className="text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {p.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {p.author_name || p.author || 'Anonymous'} • {new Date(p.created_at || p.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600 dark:text-slate-300">Votes: {p.votes}</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Replies: {p.replies?.length || 0}</div>
                <button
                  onClick={async () => { await upvote(p.id) }}
                  className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Upvote
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
