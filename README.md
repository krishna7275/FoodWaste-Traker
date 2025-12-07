# 🌱 FoodWaste Tracker - Hackathon Edition

A comprehensive food waste reduction platform that helps users track expiry dates, reduce waste, and make a positive environmental impact. Built with cutting-edge features designed to win hackathons!

## 🏆 Hackathon-Winning Features

### 📊 Advanced Analytics Dashboard
- **Real-time visualizations** with interactive charts (Line, Bar, Pie charts)
- **30-day trend analysis** showing consumption patterns
- **Category & status breakdowns** for better insights
- **Performance metrics** with waste reduction rates
- **Export & Share** functionality for reports

### 🎮 Gamification System
- **Achievement System** with 12+ unlockable achievements
- **Points & Levels** - Earn points for saving food, level up your profile
- **Streak Tracking** - Maintain daily tracking streaks
- **Badge Collection** - Unlock badges like "Eco Warrior", "Waste Warrior", "Recipe Master"
- **Progress Tracking** - Visual progress indicators

### 🌍 Environmental Impact Calculator
- **CO₂ Saved** - Track carbon footprint reduction (kg)
- **Water Saved** - Calculate water conservation (liters)
- **Meals Equivalent** - Show approximate meals saved
- **Trees Equivalent** - Visualize environmental impact
- **Shareable Impact Reports** - Share your achievements on social media

### 🤖 AI-Powered Features
- **Smart Insights** - AI-generated recommendations based on your data
- **Recipe Generation** - Get personalized recipes using expiring ingredients
- **Predictive Analytics** - Identify patterns and suggest improvements
- **Automated Alerts** - Smart notifications for expiring items

### 📱 Modern Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + MongoDB
- **Charts**: Recharts for beautiful visualizations
- **AI Integration**: Anthropic Claude for smart features
- **Real-time Updates**: Live dashboard updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd FoodWaste-Traker
```

2. **Backend Setup**
```bash
cd food-expiry-tracker/backend
npm install
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

4. **Environment Variables**

Create `.env` in the project root:
```env
MONGODB_URI=your_mongodb_connection_string
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

5. **Run the Application**

Terminal 1 (Backend):
```bash
cd food-expiry-tracker/backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd food-expiry-tracker/frontend
npm run dev
```

Visit `http://localhost:5173` to see the app!

## ✨ Key Features

### 📦 Item Management
- Add items with expiry dates
- Barcode scanning for quick entry
- OCR text recognition from receipts
- Category organization
- Price tracking

### 🔔 Smart Alerts
- Expiry reminders (customizable days)
- Push notifications
- Email alerts (coming soon)
- Dashboard notifications

### 🍳 Recipe Suggestions
- AI-generated recipes from expiring items
- Waste reduction score for each recipe
- Difficulty and time estimates
- Step-by-step instructions

### 📈 Analytics & Insights
- Daily/weekly/monthly trends
- Category distribution
- Consumption patterns
- Waste reduction metrics
- Exportable reports

### 🏅 Achievements
- **First Step** - Add your first item
- **Saver** - Save 10 items
- **Eco Hero** - Save 50 items
- **Waste Warrior** - Save 100 items
- **Week Warrior** - 7-day streak
- **Monthly Master** - 30-day streak
- **Zero Waste Week** - No waste for 7 days
- **Eco Warrior** - Save 1 ton of CO₂
- **Money Saver** - Save $100
- **Recipe Master** - Use 10 AI recipes
- **Early Bird** - Consume 5 items before expiry
- **Perfect Tracker** - 100% consumption rate

## 🎯 Why This Wins Hackathons

1. **Complete Solution** - Not just tracking, but gamification, analytics, and AI
2. **Social Impact** - Clear environmental metrics that resonate with judges
3. **User Engagement** - Gamification keeps users coming back
4. **Technical Excellence** - Modern stack, clean code, scalable architecture
5. **Beautiful UI** - Polished design with smooth animations
6. **Real-world Problem** - Addresses a critical global issue
7. **Data-Driven** - Comprehensive analytics and insights
8. **Shareable** - Users can share achievements and impact

## 📱 Screenshots

### Dashboard
- Overview of all items and stats
- Quick actions for common tasks
- Expiring items alert
- Environmental impact summary

### Analytics
- Interactive charts and graphs
- Trend analysis
- Category breakdowns
- Exportable reports

### Achievements
- Unlockable badges
- Points and levels
- Streak tracking
- Progress indicators

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- React Router
- Axios

**Backend:**
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- Node Cron (scheduled jobs)
- Anthropic AI SDK

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create item
- `GET /api/items/stats` - Get statistics
- `PATCH /api/items/:id/consume` - Mark as consumed

### Analytics
- `GET /api/analytics/overview` - Comprehensive analytics
- `GET /api/analytics/insights` - AI-powered insights

### Achievements
- `GET /api/achievements` - Get all achievements
- `POST /api/achievements/check` - Check and unlock
- `GET /api/achievements/stats` - Achievement statistics

## 🎨 Design Principles

- **Clean & Modern** - Minimalist design with focus on usability
- **Responsive** - Works perfectly on mobile, tablet, and desktop
- **Accessible** - WCAG compliant color contrasts and keyboard navigation
- **Fast** - Optimized performance with lazy loading
- **Intuitive** - User-friendly interface with clear navigation

## 🌟 Future Enhancements

- [ ] Social features (leaderboards, sharing)
- [ ] Mobile app (React Native)
- [ ] Integration with grocery stores
- [ ] Community challenges
- [ ] Donation tracking
- [ ] Meal planning calendar
- [ ] Shopping list generation

## 📝 License

MIT License - feel free to use this for your hackathon!

## 👥 Contributing

This is a hackathon project, but contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 🙏 Acknowledgments

- Built with ❤️ for hackathon success
- Inspired by the global food waste problem
- Powered by modern web technologies

---

**Ready to win that hackathon? 🏆**

Start tracking your food waste today and make a difference!
