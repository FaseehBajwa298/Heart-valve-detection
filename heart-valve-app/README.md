# 🫀 Heart Valve Disease Predictor - React Application

A modern, high-performance web application built with React and Vite for the early detection and management of heart valve diseases using AI.

## 🚀 Project Overview

This application serves as the user interface for an AI-based system designed to analyze heart sounds and detect valve anomalies with high precision (98.25%). It provides a seamless experience for patients and medical professionals to access diagnostic tools, view services, and manage their accounts.

## ✨ Key Features

### 🖥️ User Interface
- **Responsive Design**: Fully responsive layout optimized for all devices (Mobile, Tablet, Desktop).
- **Modern Styling**: Built with **Tailwind CSS** for a clean, professional medical aesthetic.
- **Interactive Elements**: Smooth scrolling, hover effects, and intuitive navigation.

### 🔐 Authentication System
- **User Management**: Full Login and Registration functionality.
- **State Management**: Uses `AuthContext` for global user state persistence (Login/Logout).
- **Secure Forms**: Input validation and visual feedback.

### 📄 Core Pages & Components
- **Home**: Hero section with project overview and call-to-actions.
- **About Us**: Detailed information about the mission and technology.
- **Services**: Comprehensive list of medical services offered.
- **Contact**: Functional contact form for inquiries.
- **Footer**: Quick links, social media integration, and contact info.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/) (v18)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Icons**: Heroicons / SVG

## 💻 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd heart-valve-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**
   Visit `http://localhost:5173` to view the app.

## 📂 Project Structure

```
heart-valve-app/
├── public/              # Static assets (images, icons)
├── src/
│   ├── components/      # Reusable UI components (Navbar, Footer, etc.)
│   ├── context/         # React Context for state management (Auth)
│   ├── pages/           # Full page components (Home, Login, Register)
│   ├── App.jsx          # Main application layout and routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles & Tailwind directives
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.js       # Vite configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
