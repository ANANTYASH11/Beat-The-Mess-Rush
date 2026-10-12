# Beat the Mess Rush 🍛⚡
> **Next.js 14+ App Router • Prisma ORM • Framer Motion • Tailwind CSS • TypeScript**
> **"Midnight Canteen" Premium UI/UX & Motion Overhaul**

Built specifically for college hostel dining halls (~600 students, 1 main mess to start, multi-mess ready). Engineered around real-world campus constraints (patchy Wi-Fi/4G, busy non-tech-savvy mess staff, walk-in students, and zero special hardware), now styled as a food-tech product.

---

## 🎨 "Midnight Canteen" Design System & Motion System

### 1. Palette & Atmosphere
- **Midnight Canvas**: Deep navy & ink background (`#070A12` / `#0B0F19`) with ambient gradient mesh backdrop (`radial-gradient` highlights).
- **Food-Tech Accents**:
  - **Saffron Orange** (`#FF8A3D`): Primary brand highlight, glowing accents, and active buttons.
  - **Fresh Green** (`#22C55E`): Low crowd (Quiet), service active indicators, and savings highlights.
  - **Aqua Cyan** (`#22D3EE`): Service rate line throughput, staff terminal actions, and timeline connectors.
  - **Chilli Red** (`#FF4D4D`): High crowd (Busy), alert thresholds, and feedback loop reductions.
- **Glassmorphism**: Backdrop blur (`backdrop-blur-xl`), 1px translucent borders (`border-white/10`), inner light gradients, and rounded-2xl/3xl corners.
- **Typography**: Next.js Google Fonts with **Outfit** for headings, **Inter** for body text, and **JetBrains Mono** for live metrics and counters.

### 2. Motion System (`lib/motion.ts` & Framer Motion)
- **Spring Physics Transitions**: Natural spring stiffness and damping instead of mechanical linear easing.
- **Animated Number Counters (`StatCounter`)**: Count-up numbers for queue length, wait range, line rates, kg waste, and rupee savings.
- **Looping Illustrations**:
  - Animated "Mess Line": Live student dots moving along a curved track toward the serving counter with steam rising from food bowls (`components/home/MessLineHero.tsx`). Dot density reflects the live queue length.
  - Animated Flow Strip: Student Demand ➔ Queue Regulation ➔ Kitchen Optimization with traveling glowing particles.
- **Micro-Interactions**:
  - Button lift on hover, scale 0.97 tap compression, and ripple pulses on primary CTAs (`AnimatedButton.tsx`).
  - Animated heat strip slot pills with load fill bars and shimmering "Best time" badges (`SlotPill.tsx`).
  - 3D perforated ticket card with confetti burst on confirmation (`canvas-confetti`).
  - Visual student queue row in the staff terminal with student dots entering/leaving dynamically.
  - Sliding action toasts with 1-tap **Undo** (`Toast.tsx`).
- **Mobile First**: Fixed bottom navigation tab bar on phones (`sm:hidden`) with an animated active indicator pill.

---

## 🏗️ Architecture & Component Hierarchy

```
c:/Mess Rush App/
├── app/
│   ├── layout.tsx             # Fonts (Outfit, Inter, JetBrains Mono), Mesh BG, PWA
│   ├── globals.css            # Midnight Canteen theme variables, glass utilities
│   ├── page.tsx               # Landing page (renders MessLineHero)
│   ├── student/page.tsx       # Student Express (Heat strip, portion cards, 3D ticket)
│   ├── staff/page.tsx         # Staff Control Deck (Giant buttons, visual line, toasts)
│   ├── kitchen/page.tsx       # Kitchen & Waste (Bento forecast, 30s logger, reports)
│   ├── impact/page.tsx        # Impact Model (Sliders, before/after cards, pilot plan)
│   ├── admin/page.tsx         # Admin Settings (Live gauge preview, simulate rush)
│   ├── login/page.tsx         # 1-click evaluation profiles (Student, Staff, Kitchen)
│   └── api/                   # Route handlers (queue, bookings, forecast, waste, etc.)
├── components/
│   ├── Navbar.tsx             # Glass sticky navbar, theme toggle, mobile bottom bar
│   ├── TimeCurveChart.tsx     # Recharts area chart with saffron/amber gradients
│   ├── AttendanceChart.tsx    # Recharts predicted vs actual attendance
│   ├── home/
│   │   └── MessLineHero.tsx   # Animated mess line, flow strip, bento stats & tiles
│   └── ui/                    # Reusable Design System Components
│       ├── GlassCard.tsx      # Translucent card with inner glow & hover lift
│       ├── StatCounter.tsx    # Spring animated count-up numbers
│       ├── GaugeRing.tsx      # SVG animated circular radial progress gauge
│       ├── SlotPill.tsx       # Heat strip 15-min arrival slot with load bar
│       ├── AnimatedButton.tsx # Micro-interaction button with tap scale & glow
│       ├── FoodIcons.tsx      # Custom SVG illustrations (Thali, Steam, RiceBowl, etc.)
│       ├── Toast.tsx          # Action notifications with Undo support
│       └── Skeleton.tsx       # Shimmer loading skeleton
├── lib/
│   ├── motion.ts              # Framer Motion spring variants & transitions
│   ├── queue.ts               # Queue telemetry, service rate & drift math
│   ├── forecast.ts            # Pure TypeScript blended forecasting engine
│   ├── prisma.ts              # Singleton Prisma ORM database client
│   └── auth.ts                # Cookie session security helper
└── prisma/
    └── schema.prisma          # Database models (Student, Mess, SlotBooking, QueueEvent...)
```

---

## ⚡ Quick Start & Verification

### 1. Run the Production Server
```bash
# Starts the high-performance Next.js production server on port 3000
npm start
```
Open **`http://localhost:3000`** in your browser.

*(For local development with hot reload: `npm run dev`)*

---

## 🔑 Login & Demo Credentials

| Role | Access | Demo 1-Click Button |
|---|---|---|
| **Student** | Roll No: `22CS014` | "Demo Student (22CS014)" |
| **Mess Staff** | PIN: `1234` | "Demo Staff (1234)" |
| **Kitchen / Admin** | PIN: `5678` | "Demo Kitchen (5678)" |

---

## ⏱️ Evaluation Walkthrough

1. **Home / Hero (`http://localhost:3000/`)**:
   - Check the **headline with gradient text** and the **animated "mess line" illustration**: student dots walking along a curved track toward the steaming thali counter.
   - Note the **animated flow strip** connecting Student Staggering ➔ Queue Regulation ➔ Kitchen Optimization with traveling pulses.
   - Inspect the **Bento stats row** with live count-up numbers and radial crowd gauge.
   - Test the **Dark / Light mode toggle** in the navbar.
2. **Student Express (`http://localhost:3000/student`)**:
   - Scroll through the **horizontal heat strip** timeline of 15-min arrival slots (Quiet / Moderate / Busy) with load bars and shimmering "Best time" badge.
   - Pick a slot and choose an **illustrated portion plate** (Small, Regular, Large).
   - Click **"Confirm Slot"**: experience the **confetti burst** and inspect the **3D perforated ticket card** with the student QR code and 4-digit code.
   - Observe the **Off-Peak streak counter** (`🔥 Streak: 4 meals`).
3. **Staff Control Deck (`http://localhost:3000/staff`)**:
   - Experience the **dark high-contrast control deck**:
     - Tap **`+1 WALK-IN`**: the queue length increments with spring animation, and an action toast slides in with an **`[Undo]`** button!
     - Tap **`SERVED & EXIT`**: line advances and visual dots update.
     - Fast check-in: type the student's 4-digit code in the numeric box.
     - Manual drift correction: tap `+1 Count` or `-1 Count`.
4. **Live Rush Simulation**:
   - Click **`⚡ Simulate Rush`** in the top navigation bar from any page to pump arrivals and services into the queue live for 30 seconds!
5. **Kitchen & Waste Analytics (`http://localhost:3000/kitchen`)**:
   - Inspect the **Bento forecast hero card** with target plates count-up, confidence arc, and the automated **-6% recipe feedback note** on Rice.
   - Switch to **30s Waste Logger**: tap preset leftover chips (**1k, 2k, 5k, 10k**) per dish and enter plate return bin weight.
   - Trigger the **Surplus Food Notice** (>10kg) with NGO recipient contact field.
   - Switch to **Reports & CSV**: inspect the attendance chart, ranked wasted dishes, and download the CSV report.
6. **Impact Model (`http://localhost:3000/impact`)**:
   - Review the **Baseline vs. With System** cards labeled `SIMULATED`.
   - Drag the sliders (**Avg Food Cost**, **Plates per Day**, **Adoption %**) and watch rupee savings and waste cut percentages recalculate live with animated numbers.
   - Follow the **4-Week Collegiate Pilot Plan** roadmap.
7. **Mobile Responsiveness (375px - 414px)**:
   - On mobile screens, observe the sticky **glass bottom tab bar** with 1-tap thumb navigation and active animated indicator.
