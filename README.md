<div align="center">
  <h1>👋 Welcome to My Digital Home!</h1>
  <p>🚀 <strong>Data Scientist | ML Engineer | AI Builder</strong></p>
  <p>Crafting intelligent systems that merge <strong>data science, MLOps, and scalable engineering</strong>.</p>

  <p>
    <a href="https://avijit-jana.github.io"><strong>🌐 Live Portfolio</strong></a> |
    <a href="https://linkedin.com/in/avijit-jana"><strong>💼 LinkedIn</strong></a> |
    <a href="https://github.com/avijit-jana"><strong>💻 GitHub</strong></a>
  </p>
</div>

<style>
  a:hover {
    opacity: 0.85;
    transform: scale(1.05);
  }
</style>

---

Thanks for stopping by! This repository is essentially my **"digital identity."** It’s a central hub where I showcase everything I’ve been working on, specifically at the intersection of Data Science, Machine Learning, and MLOps. I built this space to be more than just a resume; it's a fast, good-looking, and high-performance home designed to give you a real feel for my professional journey and technical style.

## 🌌 What's Inside?

I wanted this site to be a truly interactive experience rather than just a static page, so I’ve packed it with some pretty neat features that reflect my background in AI:

- **A Cool Neural Network Visual**: Right at the top, you'll encounter a 3D immersive animation I built using **Three.js**. It features a cloud of particles that simulate a living neural network. The best part? It's fully interactive—the nodes react and shift as you move your mouse, symbolizing the interconnected and responsive nature of modern AI systems. It’s my way of making high-level concepts feel tangible and fun!
- **Easy-to-Browse Projects**: I’m not a fan of messy lists, so I engineered a project grid that is both filterable and searchable in real-time. Everything is driven by a central JSON file, which means I can add new projects or update existing ones in seconds without ever touching the HTML structure. This "data-driven" approach ensures the site grows just as fast as my portfolio does.
- **A "Smart" Contact Form**: Communication should be seamless but secure. When you send me a message, a custom Python script (built with Flask) performs a real-time **MX record validation**. This means it checks if your email domain actually exists before the message even leaves the page. It’s a great way to filter out typos and bots, ensuring that I only receive high-quality inquiries in my inbox.
- **Auto-Updating Blog**: Learning in public is a big part of what I do. Whenever I publish a new technical write-up, the site automatically parses the metadata to show a fresh preview. It keeps the "Insights" section alive and ensures you're always seeing my most recent thoughts on LLMs, MLOps, or Data Engineering.

## 🛠️ The Tech Stuff

Building a full-stack portfolio requires a mix of creative design and solid engineering. Here’s a breakdown of the tools I chose to get the job done:

|                |                   |                                                                               |
| -------------- | ----------------- | ----------------------------------------------------------------------------- |
| **Layer**      | **What I Used**   | **Why I Chose It**                                                            |
| **The Look**   | HTML, CSS, and JS | For that modern "glassmorphism" aesthetic and smooth transitions.             |
| **The Brains** | Python and Flask  | To handle complex tasks like email verification and API routing.              |
| **Storage**    | Simple JSON files | Keeps things lightweight and lightning-fast without needing a heavy database. |
| **Hosting**    | Vercel and GitHub | Vercel handles my backend "Serverless Functions" while GitHub manages the UI. |

## 📂 How It's Organized

To keep things modular and easy to maintain, I’ve organized the code into a clear structure:

```
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

## ⚡ Want to Run It Yourself?

If you want to play around with the code or see how it works locally, getting started is easy:

### **1. The Website Part**

The frontend is purely client-side. Simply open `index.html` in your favorite browser! If you use VS Code, I highly recommend the **"Live Server"** extension—it’ll refresh the page automatically every time you save a change. Want to see your own work here? Just head to `assets/data/projects.json` and add your project details to the list.

### **2. The Backend Part**

To test the contact form logic, you'll need Python 3.8 or newer. Since we’re dealing with email and DNS checks, here is the setup:

```
cd backend
python -m venv venv
source venv/bin/activate  # Or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

_Tip: Make sure to set up your `.env` file with your own SMTP details so the emails have somewhere to go!_

## ☁️ Getting It Online

Bringing this project to life on the web involves a few clever hosting tricks:

- **Vercel (The Powerhouse)**: This is my preferred way to host the site. Because Vercel supports Python runtimes, it treats my Flask backend as a set of "Serverless Functions." This means the backend only runs when someone uses the contact form, which is incredibly efficient and cost-effective.
- **GitHub Pages (The Classic)**: You can definitely host the front page here for free. Just keep in mind that GitHub Pages is for static files only, so you’d need to host the Flask API separately (on a service like Render or AWS) and point your JavaScript to that new URL.
- **SEO & Visibility**: I’ve also spent time making the site "Google-Friendly." By using semantic HTML tags and a proper `sitemap.xml`, I've made sure that when people search for Data Scientists or specific AI projects, this site shows up exactly where it should!

---

<div align="middle">

![Badge](https://img.shields.io/badge/Developed%20By-Avijit_Jana-navy?style=for-the-badge)

</div>
