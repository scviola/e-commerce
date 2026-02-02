# E-Commerce Backend
A robust Node.js/Express.js backend API for an e-commerce application with MongoDB database, featuring authentication, product management, shopping cart, order processing, and M-Pesa payment integration for Kenyan mobile payments.


## Features
### Authentication & Authorization
- **JWT-based authentication** - Secure token-based authentication using JSON Web Tokens
- **Role-based access control** - User roles: `customer` and `admin`
- **Password hashing** - Secure password storage using bcrypt
- **Password reset** - Token-based password reset functionality

### Product Management
- Full CRUD operations for products
- Category-based organization
- Automatic slug generation for SEO-friendly URLs
- Stock quantity tracking with virtual "in stock" status
- Text search and category filtering
- Sales count tracking for popular products


### Shopping Cart
- User-specific shopping carts
- Add/remove products
- Quantity management
- Real-time total calculation


### Order Management
- Complete order lifecycle with status tracking:
  - `Pending` → `Paid` → `Processing` → `Shipped`/`ReadyForPickup` → `Delivered`/`Completed` → `Cancelled`
- Support for both **shipping** and **pickup** delivery methods
- Order number generation
- Order history for customers


### Payment Integration
- **M-Pesa STK Push** - Mobile payment integration for Kenyan market
- Sandbox testing environment (easily switchable to production)
- Callback handling for payment confirmation


### Email Notifications
- **Mailgun integration** - Transactional email service
- Email templates support (text and HTML)


### Delivery Options
- **Shipping** - Home delivery with address collection
- **Pickup** - In-store pickup with multiple pickup location management


## Technology Stack
| Category | Technology |
|----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JSON Web Token (JWT) |
| Password Hashing | bcrypt |
| HTTP Client | Axios |
| Email Service | Mailgun |
| Payment Gateway | M-Pesa (Safaricom) Daraja API - (WIP)|

## Project Structure
```
e-commerce-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── cartController.js      # Cart operations
│   ├── categoryController.js  # Category management
│   ├── orderController.js     # Order processing
│   ├── paymentController.js   # Payment handling
│   ├── pickupLocationController.js
│   ├── productController.js   # Product management
│   └── userController.js      # User management
├── middleware/
│   ├── authMiddleware.js      # JWT verification
│   ├── errorHandlingMiddleware.js
│   ├── forgotPasswordLimiter.js
│   ├── roleMiddleware.js      # Role-based access
│   └── validateRequest.js     # Input validation
├── models/
│   ├── Cart.js
│   ├── Category.js
│   ├── Order.js
│   ├── Payment.js
│   ├── PickupLocation.js
│   ├── Product.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── categoryRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── pickupLocationRoutes.js
│   ├── productRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── mpesa.js               # M-Pesa API utilities
│   └── sendEmail.js           # Email sending utility
├── validators/
│   ├── authValidation.js
│   └── productValidation.js
├── webhooks/
│   └── mpesaWebhook.js        # M-Pesa callback handler
├── server.js                  # Entry point
├── package.json
└── README.md
```

## API Endpoints
### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| PUT | `/update-password` | Update password | Public |
| POST | `/forgot-password` | Request password reset | Public |
| PUT | `/reset-password/:token` | Reset password with token | Public |


### Users (`/api/users`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/me` | Get current user profile | User |
| PUT | `/me` | Update user profile | User |
| GET | `/` | Get all users | Admin |
| GET | `/:id` | Get user by id | Admin |
| PUT | `/:id` | Update user by id | Admin |
| DELETE | `/:id` | Delete user | Admin |


### Products (`/api/products`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all products | Public |
| GET | `/:id` | Get single product | Public |
| POST | `/` | Create product | Admin |
| PUT | `/:id` | Update product | Admin |
| DELETE | `/:id` | Delete product | Admin |


### Categories (`/api/categories`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all categories | Public |
| GET | `/:id` | Get category by id | Public |
| POST | `/` | Create category | Admin |
| PUT | `/:id` | Update category | Admin |
| DELETE | `/:id` | Delete category | Admin |


### Cart (`/api/cart`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get current user's cart | User |
| POST | `/` | Add product to cart | User |
| PUT | `/:productId` | Update cart item quantity | User |
| DELETE | `/:productId` | Remove item from cart | User |
| DELETE | `/` | Clear cart | User |


### Orders (`/api/orders`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all users orders | Admin |
| GET | `/me` | Get current user's orders | User |
| GET | `/:id` | Get order by ID | User |
| POST | `/` | Create new order | Admin/User |
| PUT | `/:id/status` | Update order status | Admin |


### Pickup Locations (`/api/pickup-locations`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all pickup locations | Public |
| GET | `/:id` | Get pickup location by id | Public |
| POST | `/` | Create pickup location | Admin |
| PUT | `/:id` | Update pickup location | Admin |
| DELETE | `/:id` | Delete pickup location | Admin |


### Payments (`/api/payments`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/mpesa/callback` | M-Pesa payment callback | Webhook |
| POST | `/` | Create payment | User |
| GET  | `/` | Get all payments | Admin |
| GET  | `/me` | Get user's payments | User |
| GET | `/order/:orderId` | Get an order's payment | Admin/User |
| PATCH | `/:id/status` | Update payment status | Webhoo |


## Getting Started
### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas cloud)
- pnpm (or npm/yarn)


### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-commerce-backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   pnpm run dev
   ```

5. **Or start for production**
   ```bash
   pnpm start
   ```

### Environment Variables
Create a `.env` file in the root directory:


## M-Pesa Setup
### Sandbox Testing
1. Create a developer account at [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Create an app in the sandbox environment
3. Copy the Consumer Key and Consumer Secret to your `.env`
4. Use the test shortcode and passkey


### Production
1. Create a M-Pesa shortcode (Paybill or Till Number)
2. Apply for M-Pesa API access
3. Switch from sandbox to production URLs:
   - OAuth
   - STK Push

## Mailgun Setup
1. Create a Mailgun account at [mailgun.com](https://www.mailgun.com/)
2. Add your domain or use the sandbox domain for testing
3. Copy the API key and domain to your `.env`


## Development
| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server with nodemon |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests (currently not configured) |

### Error Handling
The project includes a centralized error handling middleware that catches and formats errors consistently across all routes.


### Rate Limiting
Password reset requests are rate-limited to prevent abuse.


## Security Considerations
- JWT tokens expire after 24 hours (configurable)
- Passwords are hashed with bcrypt (cost factor: 10)
- MongoDB injection prevention through Mongoose
- CORS configured to allow only specified origin
- Rate limiting on sensitive endpoints
- Environment variables for all secrets

---
>Copyright (c) 2026. All rights reserved.

