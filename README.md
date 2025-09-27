# To-Do Task Web Application

<img width="1918" height="959" alt="image" src="https://github.com/user-attachments/assets/a28c26c0-065c-4eb2-ab82-970420cdb787" />


A full-stack To-Do Task management web application built with **Node.js (TypeScript), Prisma, PostgreSQL, and Vite (React)**. The application is fully Dockerized for easy setup and deployment.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Setup & Run](#setup--run)  
  - [Clone Repository](#1-clone-repository)  
  - [Environment Variables](#2-environment-variables)  
  - [Run with Docker (Development)](#3-run-with-docker-development)  
- [Access the Application](#access-the-application)  
- [Stop the Application](#stop-the-application)  
- [Project Structure](#project-structure)  
- [Bugs](#bugs)  


---

## Features

- User authentication and management  
- Task creation, update, deletion, and completion  
- Task history tracking  
- PostgreSQL database with Prisma migrations  
- Automatic seeding of initial data  
- Fully Dockerized backend and frontend  

---

## Tech Stack

- **Backend:** Node.js, TypeScript, Prisma, PostgreSQL
- **Authentication:** JWT
- **MailService:**Nodemailer with gmail
- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Containerization:** Docker, Docker Compose  

---

## Prerequisites

- Docker
- Docker Compose
- Git  

---

## Setup & Run

### 1. Clone Repository

git clone https://github.com/HansakaRatnayake/to-do-task-web-app.git
cd todo-task-web-app

### 2. Environment Variables

I already pushed the env files with testing keys (Not a good practise. Only for demostrataion purposes)

### 3. Run with Docker (Development / Fresh DB)

docker compose up --build

---

## Access the Application

Frontend (UI): http://localhost:5173
Backend API: http://localhost:5000/api/v1

---

## Stop the Application

docker compose down

---

## Stop the Application

docker compose down -v

## Project Structure
todo-task-web-app/
├── backend/           # Backend Node.js + TypeScript
│   ├── prisma/        # Prisma schema, migrations, seed
│   ├── src/           # Backend source code
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/          # Frontend React + Vite
│   ├── src/           # Frontend source code
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yaml
└── README.md

---

## Bugs / Notes

- **Reset Password:** The reset password functionality is currently **not working** due to deadline/time constraints.  
- **Email Registration:** Only **Gmail accounts** should be used for registration because the application uses **NodeMailer with Gmail SMTP**. Other email providers may not work.  
- **Environment Variables:** The `.env` file with testing keys is included for demonstration purposes. **Do not use these keys in production**.  







