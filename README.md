# GigFlow - Backend API

The backend for **GigFlow** is a robust RESTful API built with **Node.js** and **Express**, serving as the core engine for the freelancing marketplace. It manages user authentication, gig listings, bidding logic, and delivers real-time notifications via **Socket.io**.

## 🚀 Technologies Used

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens) in secure HttpOnly cookies
- **Real-time Engine**: [Socket.io](https://socket.io/)
- **Security**: [bcrypt](https://www.npmjs.com/package/bcrypt) (Hashing), [cors](https://www.npmjs.com/package/cors) (Cross-Origin Resource Sharing)
- **Utilities**: [Nodemailer](https://nodemailer.com/) (Emails), [Dotenv](https://www.npmjs.com/package/dotenv)

## ✨ Core Features

### 🔐 Secure Authentication

- **HttpOnly Cookies**: JWTs are stored in secure, HttpOnly cookies to prevent XSS attacks.
- **Session Management**: Persistent sessions with dedicated endpoints for checking auth status.
- **Middleware**: Custom `protect` middleware ensures routes are accessible only to authenticated users.

### 🏢 Gig Management

- **CRUD Operations**: Complete management of Gig posts.
- **Status Tracking**: Track gigs through their lifecycle (Open, In Progress, Completed).
- **Client Dashboard Support**: Endpoints tailored for client-specific views (e.g., "My Gigs").

### 🤝 Bidding System

- **Real-time Bidding**: Instant updates when a freelancer places a bid.
- **Atomic Hiring**: Transactional integrity when hiring a freelancer to prevent race conditions.
- **Validation**: Strict validation to ensure only eligible users can bid or hire.

### 🔔 Real-time Notifications

- **Event-Driven Architecture**: Powered by Socket.io.
- **Personalized Alerts**: Users join private socket rooms based on their User ID.
- **Events**:
  - `notification`: Triggered on new apps, hires, or status changes.

## 🛠️ API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint    | Description                                |
| :----- | :---------- | :----------------------------------------- |
| `POST` | `/register` | Register a new user (Client or Freelancer) |
| `POST` | `/login`    | Authenticate user and set HTTP-only cookie |
| `POST` | `/logout`   | Clear auth cookie                          |
| `GET`  | `/check`    | Verify current session status              |

### Gigs (`/api/gigs`)

| Method | Endpoint      | Description                           | Access     |
| :----- | :------------ | :------------------------------------ | :--------- |
| `POST` | `/`           | Create a new gig                      | 🔒 Private |
| `GET`  | `/`           | Get all available gigs                | 🌍 Public  |
| `GET`  | `/my`         | Get gigs posted by current user       | 🔒 Private |
| `GET`  | `/:id`        | Get specific gig details              | 🌍 Public  |
| `PUT`  | `/:id/status` | Update gig status (e.g., to 'Closed') | 🔒 Private |

### Bids (`/api/bids`)

| Method | Endpoint       | Description                       | Access     |
| :----- | :------------- | :-------------------------------- | :--------- |
| `POST` | `/`            | Place a bid on a gig              | 🔒 Private |
| `GET`  | `/my-bids`     | Get all bids made by current user | 🔒 Private |
| `GET`  | `/:gigId`      | Get all bids for a specific gig   | 🔒 Private |
| `POST` | `/:bidId/hire` | Hire a freelancer for a bid       | 🔒 Private |

### Notifications (`/api/notifications`)

| Method | Endpoint    | Description                          | Access     |
| :----- | :---------- | :----------------------------------- | :--------- |
| `GET`  | `/`         | Get user's notifications             | 🔒 Private |
| `PUT`  | `/read-all` | Mark all notifications as read       | 🔒 Private |
| `PUT`  | `/:id/read` | Mark a specific notification as read | 🔒 Private |

## ⚙️ Environment Config

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gigflow
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```

## 🚀 Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Production Start**
   ```bash
   npm start
   ```

## 📂 Project Structure

```bash
src/
├── config/         # DB connection configs
├── controllers/    # API request handlers
├── middleware/     # Auth and validation middleware
├── models/         # Mongoose schemas (Gig, User, Bid, Notification)
├── routes/         # Express route definitions
├── templates/      # Email HTML templates
└── index.js        # Server entry point
```

## 📄 License

This project is licensed under the ISC License.
