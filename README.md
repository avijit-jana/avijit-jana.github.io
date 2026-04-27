<div align="center">
  <h1>👋 Hi, I’m Avijit Jana</h1>
  <p>🚀 <strong>Data Scientist | ML Engineer | AI Builder</strong></p>
  <p>Crafting intelligent systems that merge <strong>data science, MLOps, and scalable engineering</strong>.</p>

  <p>
    <a href="https://avijit-jana.github.io"><strong>🌐 Live Portfolio</strong></a> |
    <a href="https://linkedin.com/in/avijit-jana"><strong>💼 LinkedIn</strong></a> |
    <a href="https://github.com/avijit-jana"><strong>💻 GitHub</strong></a>
  </p>
</div>

---

## 🛠️ Project Overview

This repository is my **digital identity** and professional portfolio. It is a full-stack application designed for high performance, modern aesthetics, and seamless communication.

### 🌟 Key Features
- **Dynamic Project Grid**: Filterable and searchable portfolio projects loaded via JSON.
- **Automated Blog Teasers**: Latest insights fetched dynamically from blog metadata.
- **Serverless Contact Form**: A Flask-powered backend that validates visitor emails (MX record check) and delivers messages securely to my inbox.
- **Interactive Hero Section**: High-performance Three.js particle animation symbolizing neural networks.
- **Premium Aesthetics**: Dark-mode first design with glassmorphism, smooth transitions, and a mobile-responsive layout.
- **SEO Optimized**: Optimized for search engines with semantic HTML, metadata, and structured data.

---

## 📂 Repository Structure

```text
├── assets/             # Frontend assets (CSS, JS, Images, JSON data)
│   ├── js/             # Main logic, Three.js animations, and project data
│   └── css/            # Modern, modular styling (Vanilla CSS)
├── backend/            # Flask API for contact form handling
│   ├── app.py          # Flask application logic
│   ├── requirements.txt # Python dependencies
│   └── .env.example    # Template for environment variables
├── index.html          # Main portfolio entry point
├── blog.html           # Blog listing page
├── vercel.json         # Full-stack deployment configuration for Vercel
└── README.md           # You are here!
```

---

## 🚀 Local Development

### 1. Frontend
Simply open `index.html` in any modern browser. For the best experience, use a local server (like Live Server in VS Code).

### 2. Backend (Flask)
The backend handles the contact form and requires Python 3.8+.

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your SMTP credentials

# Run the server
python app.py
```
*The frontend will automatically connect to `localhost:5000` when running locally.*

---

## ☁️ Deployment

### **Vercel (Recommended)**
This project is configured for **automatic full-stack deployment** on Vercel. 
- **Frontend**: Served as static files.
- **Backend**: Deployed as a Serverless Function via the `backend/app.py`.
- **Setup**: Link your GitHub repo to Vercel and add your `.env` variables in the Vercel Dashboard (**Settings > Environment Variables**).

### **GitHub Pages**
The frontend can be hosted on GitHub Pages, but note that **GitHub Pages does not support Python/Flask**. You will need to host the backend separately (e.g., on Vercel or Render) and update the `API_URL` in `assets/js/main.js`.

---

## 📬 Let's Connect

I'm always open to collaborating on data science challenges, AI agent building, or MLOps projects.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/avijit-jana)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/avijit-jana)
[![Kaggle](https://img.shields.io/badge/Kaggle-20BEFF?style=for-the-badge&logo=Kaggle&logoColor=white)](https://www.kaggle.com/avijitjana101)

⭐ *This repo isn’t just code — it’s my story, my brand, and my way of connecting with the world.*

<div align="middle">

![Badge](https://img.shields.io/badge/Developed%20By-Avijit_Jana-navy?style=for-the-badge)

</div>
