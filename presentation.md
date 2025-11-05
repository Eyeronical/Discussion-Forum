# Learnato — Discussion Forum — Hackathon Submission

## Elevator pitch
A fast, clean discussion forum microservice focused on learning: learners post questions, instructors answer, and conversations evolve in realtime. Built as a microservice to plug into Learnato.

## Highlights
- React + Vite + Tailwind front end, polished UX (dark mode, keyboard shortcuts)
- Express + Knex + Postgres backend with full-text search
- Real-time updates with Socket.io
- Google OAuth + JWT, instructor role to mark answered
- AI endpoints: suggest similar threads & summarize discussions (OpenAI)
- Dockerized + docker-compose, CI workflow included

## How to run locally (short)
1. Start Postgres + services: `docker-compose up --build`
2. Backend will run migrations automatically (see docker-compose)
3. Open http://localhost:3000

## Screenshots
- screenshots/1_home.png
- screenshots/2_post_view.png
- screenshots/3_dark_mode.png

(Placeholders included in /screenshots)
