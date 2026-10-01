<div align="center">

# 🎧 SONY WH-CH520
### Cinematic Scrollytelling Product Experience

[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-Canvas_2D-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Modern_Engine-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Performance](https://img.shields.io/badge/FPS-60FPS_Silky_Smooth-00F0FF?style=for-the-badge&logo=speedtest&logoColor=black)](https://github.com/)
[![License](https://img.shields.io/badge/License-MIT-2563EB?style=for-the-badge)](LICENSE)

<br/>

<p align="center">
  <b>An Apple-grade interactive keynote experience showcasing the Sony WH-CH520 Wireless Headphones.</b><br/>
  Featuring a 24 fps scroll-driven frame engine, interactive hardware anatomy radar, 3D orbit colorway showroom, and reactive acoustic audio aesthetics — built entirely with <b>pure Vanilla JavaScript, CSS, and HTML5 Canvas</b> (Zero heavy UI libraries).
</p>

---

</div>

<br/>

## ✨ Key Experience Highlights

<table>
  <tr>
    <td width="50%">
      <h3 align="center">🎬 24 FPS Scrollytelling Canvas</h3>
      <p>Scroll-synchronized 264-frame sequence loaded into a high-DPI HTML5 canvas engine. Translates continuous mouse or touch wheel velocity into liquid-smooth frame interpolation with zero lag.</p>
    </td>
    <td width="50%">
      <h3 align="center">🎯 Interactive Hardware Radar</h3>
      <p>Interactive anatomy explorer featuring dynamic SVG leader lines that real-time tether to pinpoint target dots on the headphones, revealing precision engineering specs on hover or click.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3 align="center">🎨 3D Orbit Colorway Showroom</h3>
      <p>Interactive color studio featuring 7 rich colorways (Matte Black, Clean White, Midnight Blue, Titanium Grey, Blush Pink, Crimson Red, Solar Yellow) on a continuous 3D elliptical orbit pedestal.</p>
    </td>
    <td width="50%">
      <h3 align="center">📊 Keynote Scroll-Triggered Stats</h3>
      <p>Dynamic scroll-triggered animations cascading into view with live cubic easing counters: <b>50 HRS</b>, <b>30 MM</b>, <b>2 DEVICES</b>, <b>1 TOUCH</b>, and <b>147 GRAMS</b>.</p>
    </td>
  </tr>
</table>

<br/>

---

## 💎 Design & Aesthetics

- **Deep Obsidian Theme**: Precision dark-mode palette (`#000000`, `#070709`) with Sony electric cyan (`#00f0ff`) and sapphire blue (`#2997ff`) ambient glow accents.
- **Acoustic Wave Preloader**: Sonar ripple waves expanding outward in sync with an animated neon shimmer progress track.
- **Micro-Interactions**: Hover glows, reactive tactile pills, floating idle levitation, and glassmorphism cards.
- **Responsive Architecture**: Fluid scaling from 4K ultrawide monitors down to mobile viewports using modern CSS `clamp()`, Flexbox, and CSS Grid.

<br/>

---

## 🛠️ Technology Stack

```
Frontend Architecture:
├── Core Engine:     Vanilla JavaScript (ES6+)
├── Visual Render:   HTML5 Canvas 2D Context (High-DPI scaled)
├── Vector Layer:    Dynamic SVG Leader-Line Canvas
├── Styling Engine:  Custom Modern CSS3 (Zero Tailwind / Zero Bootstrap)
└── Font Systems:    Plus Jakarta Sans & Space Grotesk
```

```
Local Development Server:
└── Zero-Config Node.js HTTP Streaming Server (server.js) with native MIME handling and immutable asset caching.
```

<br/>

---

## 📁 Repository Structure

```graphql
sony/
├── assets/
│   ├── colors/                     # 7 Signature colorway headphone assets
│   │   ├── black.png
│   │   ├── blue.png
│   │   ├── white.png
│   │   └── ...
│   ├── ezgif-299ea441f97edf5f-jpg/ # 264 Frame high-resolution scroll sequence
│   └── images/                     # Product detail cutouts and anatomy diagrams
│       ├── battery-black-pure.png
│       ├── interactive-hotspots.png
│       └── ...
├── app.js                          # Core scrollytelling, canvas, & interaction logic
├── index.html                      # Semantic HTML5 architecture & UI markup
├── styles.css                      # Complete styling, animations, & responsive rules
├── server.js                       # Lightweight Node.js local streaming server
├── package.json                    # Project configuration & npm dev scripts
└── README.md                       # Documentation
```

<br/>

---

## 🚀 Getting Started

Follow these simple steps to run the experience locally:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v14 or higher).

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/sony-wh-ch520-cinematic.git
cd sony-wh-ch520-cinematic
```

### 2. Start the Local Server
```bash
npm run dev
```

### 3. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

<br/>

---

## ⚡ Performance Optimization

- **Frame Preloading & Memory Management**: Frame images are asynchronously preloaded into an in-memory buffer before canvas rendering begins.
- **Immutable Asset Caching**: `server.js` serves sequence images with `Cache-Control: public, max-age=31536000, immutable` headers for instant frame scrubbing.
- **Zero Framework Overhead**: Built with 0 external UI dependencies for instantaneous initial loads and 60+ FPS scroll performance.

<br/>

---

## 📜 License

This project is licensed under the **MIT License** — feel free to use it for portfolio showcases, learning, or web design inspiration.

<br/>

<div align="center">
  <sub>Engineered with precision for audio enthusiasts and web crafters.</sub>
</div>
