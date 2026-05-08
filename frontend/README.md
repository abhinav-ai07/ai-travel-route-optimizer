# AI Travel Route Optimizer - Frontend

A premium, modern frontend built with React, Next.js, and Tailwind CSS for the AI Travel Route Optimizer project.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Features

✨ **Modern UI/UX**
- Premium glassmorphism design
- Responsive layouts (mobile-first)
- Smooth animations and transitions
- Travel-themed color palette

🎯 **Smart Search**
- Source and destination input
- Date picker with validation
- Budget filter
- Travel preference selector
- Real-time error validation

🛫 **Route Results**
- Beautiful route cards with multiple options
- 4 route types: Direct Flight, Direct Train, Flight+Train, Train+Flight
- AI recommendation tags (Cheapest, Fastest, Recommended, Budget Friendly)
- Route details: airports/stations, costs, distances
- Loading animations while fetching

🔗 **Backend Integration**
- Automatic connection to FastAPI backend
- Real-time route fetching
- Error handling with user-friendly messages
- Toast notifications for user feedback

📱 **Fully Responsive**
- Desktop, tablet, and mobile optimized
- Touch-friendly interfaces
- Performance optimized

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS 3
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📁 Project Structure

```
frontend/
├── pages/
│   ├── _app.tsx           # App wrapper with Toaster
│   ├── _document.tsx      # Document setup
│   └── index.tsx          # Main page
├── components/
│   ├── SearchForm.tsx     # Search input component
│   ├── RouteCard.tsx      # Route display card
│   ├── HeroSection.tsx    # Landing hero
│   ├── LoadingState.tsx   # Loading skeleton
│   └── BackgroundGradient.tsx # Animated background
├── lib/
│   └── api.ts             # API client & types
├── styles/
│   └── globals.css        # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

## 🔌 API Configuration

The frontend connects to the backend at `http://localhost:8000` by default.

To change the API URL, update the environment variable:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://your-backend-url:8000
```

## 📡 Expected Backend Endpoints

The frontend expects the backend to provide:

```
POST /routes
{
  "source": string,
  "destination": string,
  "travel_date": string (YYYY-MM-DD),
  "booking_date": string (YYYY-MM-DD)
}

Response: Array of routes with structure:
[
  {
    "route_type": "direct_flight|direct_train|flight_train|train_flight",
    "from_airport/station": string,
    "to_airport/station": string,
    "airport/station_distance_to_destination": number,
    "total_cost": number,
    "travel_time": string (optional),
    "recommendation": string (optional)
  },
  ...
]
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the color palette. The app uses a premium blue-cyan-purple gradient theme.

### Animations
Global animations are defined in `tailwind.config.js` and can be customized:
- `animate-float`: Floating element animation
- `animate-fadeIn`: Fade in on load
- `animate-slideInUp`: Slide in from bottom
- `animate-pulse`, `animate-shimmer`, `animate-glow`: Various effects

### Components
All components are in `components/` folder and can be easily extended:
- Add new route filters in `SearchForm.tsx`
- Enhance route details in `RouteCard.tsx`
- Customize hero section in `HeroSection.tsx`

## 🚀 Build for Production

```bash
npm run build
npm run start
```

## 📚 Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## 🐛 Troubleshooting

**Backend not connecting?**
- Ensure backend is running on `http://localhost:8000`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for API errors

**Styles not loading?**
- Ensure Tailwind CSS is properly configured
- Run `npm install` again if styles missing
- Check `tailwind.config.js` content paths

**Date picker not working?**
- Ensure modern browser with date input support
- Check console for date validation errors

## 📄 License

Part of the AI Travel Route Optimizer project.

## 🎯 Next Steps

- Integrate user authentication
- Add saved routes/favorites
- Implement booking functionality
- Add user preferences storage
- Expand route filtering options
- Mobile app version

---

**Built with ❤️ for travelers & hackathon enthusiasts**
