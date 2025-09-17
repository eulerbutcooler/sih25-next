# 🌊 Ocean Watch (Apat-Sahay)

**Crowdsourced Ocean Hazard Detection & Reporting Platform**

> _Real-time analysis of ocean hazards using social media data and community reporting_

![Ocean Watch](https://img.shields.io/badge/Ocean-Watch-blue?style=for-the-badge&logo=waves&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)

---

## 🎯 Mission Statement

Ocean Watch is a comprehensive marine hazard monitoring platform that transforms ocean safety through community-driven reporting, real-time mapping, and intelligent data analysis. Built for Smart India Hackathon 2025, our platform empowers citizens, officials, and emergency responders to collectively protect our coastal communities.

## 🌟 Key Features

### 📱 **Social Media-Style Hazard Feed**

- **Real-time Community Posts**: Social media-inspired interface for hazard reports with likes, comments, and sharing
- **Advanced Filtering**: Filter by hazard type, severity, location, and verification status
- **User Profiles**: Complete user profiles with post history, contribution statistics, and community badges
- **Interactive Engagement**: Like, comment, and share hazard reports to increase visibility

### 🗺️ **Interactive Hazard Mapping**

- **Live Location Tracking**: Real-time user location with dynamic hazard overlay
- **PostGIS Spatial Queries**: Advanced geographic database queries for precise location-based data
- **Custom Hazard Markers**: Severity-based color coding with animated critical alerts
- **Proximity Detection**: Automatic detection of nearby hazards within configurable radius
- **Offline Map Support**: Cached map data for emergency situations

### 📊 **Comprehensive Hazard Types**

Our platform monitors **13 distinct ocean hazard categories**:

- 🌪️ **Cyclones & Hurricanes**: Severe weather tracking
- 🌊 **Tidal Flooding**: Coastal flood monitoring
- 🦠 **Red Tide & Algal Blooms**: Harmful algae detection
- 🪼 **Jellyfish Swarms**: Marine life hazard alerts
- ⛈️ **High Wave Conditions**: Dangerous surf warnings
- 🛢️ **Oil Spills**: Marine pollution incidents
- 🗑️ **Marine Debris**: Ocean waste and pollution
- 🏔️ **Coastal Erosion**: Shoreline degradation
- ⚠️ **General Ocean Hazards**: Catch-all category for emerging threats

### 👥 **Multi-Role Access System**

- **👤 Citizens**: Report hazards, access safety information, emergency contacts
- **🏛️ Government Officials**: Verify reports, coordinate responses, manage incidents
- **🚨 Emergency Responders**: Priority access, response coordination, resource allocation
- **👨‍🔬 Marine Scientists**: Data analysis, research access, trend monitoring
- **⚖️ Maritime Authorities**: Regulatory oversight, compliance monitoring, policy enforcement

### 🔧 **Advanced Administrative Tools**

- **📋 Report Management**: Comprehensive dashboard for report verification and status tracking
- **📈 Analytics Dashboard**: Real-time statistics, trends, and response metrics
- **🎯 Incident Coordination**: Multi-agency response coordination tools
- **📢 Emergency Broadcasting**: Mass alert system for critical situations

## 🏗️ Technical Architecture

### **Frontend Stack**

- **⚡ Next.js 15**: Latest App Router with Turbopack for lightning-fast development
- **🎨 TypeScript**: Full type safety with strict configuration
- **🌈 Tailwind CSS 4**: Modern styling with glassmorphic design elements
- **📱 Progressive Web App**: Native app experience with offline capabilities
- **🗺️ React Leaflet**: Interactive mapping with custom controls and markers

### **Backend Infrastructure**

- **🔐 Supabase Authentication**: Secure user management with role-based access
- **🗄️ PostgreSQL + PostGIS**: Advanced spatial database with geographic queries
- **⚙️ Drizzle ORM**: Type-safe database operations with schema migrations
- **🌐 Server Actions**: Modern server-side form handling and API routes
- **📊 Real-time Subscriptions**: Live data updates across connected clients

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ and npm/yarn
- PostgreSQL database with PostGIS extension
- Supabase account for authentication and real-time features

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/ocean-watch.git
   cd ocean-watch
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env.local` file:

   ```env
   SUPABASE_URL=
   SUPABASE_DB_URL=
   SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_KEY=
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Database Setup**

   ```bash
   # Run database migrations
   npx drizzle-kit migrate

   # Generate Drizzle types
   npx drizzle-kit generate
   ```

5. **Development Server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` to access the application.

## 📱 Core Application Features

### **🏠 Home Feed (`/home`)**

- Social media-style feed with infinite scroll
- Real-time hazard reports with rich media
- Advanced filtering and sorting options
- User engagement features (likes, comments, shares)

### **🗺️ Interactive Map (`/map`)**

- Full-screen interactive hazard map
- Real-time user location tracking
- Clustered markers for high-density areas
- Detailed hazard information popups

### **📝 Report Creation (`/create-post`)**

- Intuitive hazard reporting form
- Photo/video upload with compression
- Automatic location detection and reverse geocoding
- Severity level selection with visual indicators

### **👤 User Profiles (`/profile`)**

- Comprehensive user statistics
- Post history and contribution timeline
- Community badges and recognition system
- Privacy settings and preferences

### **💬 Communication Hub (`/messages`)**

- Direct messaging between users and officials
- Emergency contact integration
- Group coordination for response teams
- Automated alert notifications

### **⚙️ Admin Dashboard (`/admin`)**

- Report verification and management
- User role administration
- System analytics and monitoring
- Incident response coordination

## 🔧 API Endpoints

### **Core APIs**

- `GET /api/home` - Paginated home feed with filtering
- `GET /api/posts/nearby` - Location-based hazard discovery
- `GET /api/profile` - User profile data and statistics
- `POST /api/posts` - Create new hazard reports
- `PUT /api/posts/[id]` - Update report status/verification

## 🎨 User Experience Highlights

### **Mobile-First Design**

- Optimized for smartphones and tablets
- Touch-friendly interface elements
- Swipe gestures for navigation
- Offline-capable Progressive Web App

### **Accessibility Features**

- WCAG 2.1 AA compliance
- Screen reader compatibility
- High contrast mode support
- Keyboard navigation support

### **Real-time Updates**

- Live hazard feed updates
- Instant notification system
- Real-time map marker updates
- Collaborative editing features

## 🏆 Smart India Hackathon 2025

This project addresses the **Ocean Safety & Marine Conservation** problem statement by:

- **🎯 Problem Solving**: Real-time crowdsourced hazard detection and reporting
- **🌍 Social Impact**: Community-driven ocean safety and environmental protection
- **💡 Innovation**: Advanced spatial queries, real-time collaboration, and mobile-first design
- **🔧 Technical Excellence**: Modern full-stack architecture with cutting-edge technologies
- **📈 Scalability**: Designed to handle thousands of concurrent users and reports

## 🛡️ Security & Privacy

- **🔐 Authentication**: Secure JWT-based authentication with Supabase
- **🏛️ Authorization**: Role-based access control (RBAC) for different user types
- **🛡️ Data Protection**: GDPR-compliant data handling and user privacy controls
- **🚨 Content Moderation**: Automated and manual content verification systems
- **🔒 API Security**: Rate limiting, input validation, and SQL injection protection

## 🌐 Future Roadmap

- **🤖 AI Integration**: Machine learning for automatic hazard classification
- **📡 IoT Sensors**: Integration with marine sensor networks
- **🌍 Multi-language**: Internationalization for global deployment
- **📊 Advanced Analytics**: Predictive modeling for hazard forecasting
- **🔗 Government APIs**: Integration with official meteorological services

## 🤝 Contributing

We welcome contributions from developers, marine scientists, and safety experts!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Emergency Contacts

**In case of marine emergency:**

- 🚨 **Emergency Services**: 112
- 🌊 **Coast Guard**: 1554
- ⚓ **Marine Police**: Contact local authorities

## 👨‍💻 Development Team

Built with ❤️ for ocean safety and community protection.

**Tech Stack Credits:**

- Next.js & React for modern web development
- Supabase for backend infrastructure
- PostGIS for spatial database capabilities
- Leaflet for interactive mapping
- Tailwind CSS for beautiful UI design

---

_"Protecting our oceans, one report at a time." - Ocean Watch Team_

![Ocean Safety](https://img.shields.io/badge/Ocean-Safety-blue?style=for-the-badge&logo=shield&logoColor=white)
![Community Driven](https://img.shields.io/badge/Community-Driven-green?style=for-the-badge&logo=users&logoColor=white)
![Real-time](https://img.shields.io/badge/Real--time-Updates-orange?style=for-the-badge&logo=clock&logoColor=white)
