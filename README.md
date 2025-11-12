# 🫀 AI Heart Valve Disorder Detection - Web Application

A modern, responsive web application for **AI-based Heart Valve Disorder Detection**. This project currently provides a polished front-end authentication portal and foundation UI for an advanced AI-powered cardiac analysis system.

## 🎯 Project Overview

This web application is part of a Final Year Project (FYP) focused on developing an AI system for detecting heart valve disorders through advanced machine learning algorithms and echocardiogram analysis.

## ✨ Features

### 🔐 Authentication System
- **Dual Forms**: Login and Sign Up with seamless toggling via in-page links
- **Default View**: Login opens by default; link switches to Sign Up
- **Live Validation**: Email, password, and optional phone number validation
- **Password Strength Meter**: Real-time meter (weak/medium/strong) on Sign Up
- **Robust Toggles**: Defensive JavaScript prevents null reference errors
- **Clean Transitions**: Hidden forms use `display: none` to avoid overlap

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Heart-themed Design**: Medical red color scheme with cardiac iconography
- **Smooth Animations**: Pulse animations for heart icons and form transitions
- **Professional Layout**: Clean, medical-grade interface suitable for healthcare

### 💓 Medical Focus
- **AI-Powered Detection**: Branding focused on artificial intelligence in cardiology
- **Heart Valve Analysis**: Specialized for cardiac valve disorder detection
- **Clinical Features**: 
  - Echocardiogram analysis
  - AI-driven diagnostics
  - Valve function assessment
  - Clinical decision support

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern styling with animations and responsive design
- **JavaScript**: Interactive functionality and form validation
- **Font Awesome**: Medical and UI icons
- **Google Fonts**: Poppins font family for professional typography

## 🚀 Getting Started

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/FaseehBajwa298/Heart-valve-detection.git
   cd Heart-valve-detection
   ```

2. **Start a local server (recommended)**
   ```bash
   # Using Python (cross-platform)
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Access the application**
   - Local server: `http://localhost:8000`
   - Or open `index.html` directly in your browser

4. **Open in Chrome**
   - Visit `http://localhost:8000/` in Google Chrome
   - The Login page loads by default; use the link to switch to Sign Up

## 📁 Project Structure

```
ai-heart-valve-detection/
├── index.html          # Main HTML file with dual authentication forms
├── styles.css          # Styling, responsive design, animations, strength meter styles
├── script.js           # Form toggles, validation, password strength logic
├── .gitignore          # Git ignore file
└── README.md           # Project documentation
```

## 🎨 Design Features

### Color Scheme
- **Primary**: Medical Red (#e74c3c, #c0392b)
- **Background**: Gradient red theme
- **Accents**: White and subtle grays
- **Focus**: Consistent red highlighting

### Animations
- **Pulse Effect**: Heart icons with synchronized pumping animation
- **Form Transitions**: Smooth switching between login/signup
- **Background**: Floating shapes with gentle movement
- **Hover Effects**: Interactive button and link animations

### Icons
- **Main Logo**: Heartbeat icon (fa-heartbeat)
- **Feature Icon**: Heart pulse icon (fa-heart-pulse)
- **Form Icons**: Medical and UI-appropriate iconography

## 🔧 Customization

### Changing Colors
Edit the CSS variables in `styles.css`:
```css
:root {
  --primary-color: #e74c3c;
  --secondary-color: #c0392b;
  /* Add more custom properties */
}
```

### Adding Features
- Extend `script.js` for additional functionality (validation, toggles, UI logic)
- Modify `index.html` for new form fields or content
- Update `styles.css` for styling changes, themes, and animations

## 📝 Recent Changes

- Default view set to Login; in-page links toggle between forms
- Added live password strength meter to Sign Up (weak/medium/strong)
- Hardened form toggle functions with defensive checks and error handling
- Prevented overlapping forms by adding `display: none` to hidden wrappers
- Verified UI in Chrome and local server at `http://localhost:8000/`

## 🚀 Future Enhancements

- [ ] Backend API integration
- [ ] Real authentication system
- [ ] Dashboard for AI analysis results
- [ ] Patient data management
- [ ] Echocardiogram upload functionality
- [ ] AI model integration
- [ ] Reporting and analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m "Add some AmazingFeature"`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is part of an academic Final Year Project (FYP) for AI-based Heart Valve Disorder Detection.

## 👨‍💻 Author

**Faseeh Bajwa**  
Heart Valve Detection — FYP

## 🙏 Acknowledgments

- Font Awesome for medical icons
- Google Fonts for typography
- Modern web development best practices
- Medical AI research community

---

**Note**: This is a front-end demonstration for an AI-based heart valve disorder detection system. For the complete AI functionality, additional backend services and machine learning models are required.