# Farm2Fork: Direct-to-Door Food Marketplace

![Farm2Fork Logo](https://i.imgur.com/8Lz6Yt3.png)

## 🌱 Project Overview

Farm2Fork is a modern e-commerce platform that connects local farmers directly with consumers. Our mission is to promote sustainable agriculture, support local farmers, and provide consumers with access to fresh, locally-sourced food.

The platform enables farmers to list their fresh produce, meats, and dairy products for sale, while consumers can browse, purchase, and arrange shipping directly from the producers. By eliminating middlemen, Farm2Fork ensures farmers receive fair compensation for their products and consumers get the freshest food possible.

## ✨ Key Features

- **Secure Authentication**: Role-based access for buyers, sellers, and administrators
- **Product Listings**: Detailed product descriptions, images, categories, and pricing
- **Shopping Cart**: Easy-to-use cart and checkout experience
- **Payment Processing**: Secure integration with Stripe for payment processing
- **Shipping Estimation**: Real-time shipping rates and delivery estimates via Shippo
- **Responsive Design**: Fully responsive interface for desktop and mobile users
- **Admin Control Panel**: Comprehensive tools for platform management and support

## 🖼️ Screenshots

### Homepage
![Homepage](https://i.imgur.com/JKYvpTF.png)

### Product Listing
![Product Listing](https://i.imgur.com/dGQULXp.png)

### Seller Dashboard
![Seller Dashboard](https://i.imgur.com/Nh9Rkxl.png)

### Buyer Checkout
![Buyer Checkout](https://i.imgur.com/oPFZMnv.png)

## 🏗️ Architecture

Farm2Fork is built using a modern, scalable architecture that separates concerns and allows for independent scaling of different components.

![Architecture Diagram](https://i.imgur.com/JwSm3R3.png)

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client Layer   │◄───►│  Service Layer  │◄───►│   Data Layer    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

For more detailed architecture information, please refer to the [_planning.md](./_planning.md) document.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js
- **State Management**: Redux
- **UI Library**: Material-UI
- **CSS Utility**: TailwindCSS
- **Form Handling**: Formik with Yup validation
- **HTTP Client**: Axios
- **Testing**: Jest and React Testing Library

### Backend
- **Framework**: Node.js with Express
- **API Documentation**: Swagger/OpenAPI
- **Authentication**: Passport.js with JWT
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Mocha and Chai

### Database
- **Primary Database**: MongoDB
- **ORM/ODM**: Mongoose
- **Caching**: Redis
- **Search**: Elasticsearch (for product search)

### External Services
- **Payment Processing**: Stripe
- **Shipping**: Shippo
- **Email**: SendGrid
- **File Storage**: AWS S3
- **Maps/Geolocation**: Google Maps API
- **Analytics**: Google Analytics

## 🆕 Recent Implementations

### Frontend Routing Components

Three routing components have been implemented to protect routes based on user authentication and roles:

- **PrivateRoute**: Protects routes that require authentication. Redirects to login page if user is not authenticated.
- **SellerRoute**: Protects routes that require seller privileges. Redirects to login page if user is not authenticated, or to home page with an error message if user is authenticated but not a seller.
- **AdminRoute**: Protects routes that require admin privileges. Redirects to login page if user is not authenticated, or to home page with an error message if user is authenticated but not an admin.

These components are used in the App.js file to protect routes that require authentication or specific roles.

### Shippo Integration for Shipping Calculations

The shipping service has been updated to use the Shippo API for shipping calculations, label creation, and tracking:

- **calculateRates**: Creates a shipment in Shippo and returns available shipping rates.
- **createLabel**: Creates a transaction (purchases a label) in Shippo and returns the label URL and tracking information.
- **trackShipment**: Gets tracking information from Shippo and formats it for the application.

The Shippo API is initialized with the API key from the configuration file.

### AWS S3 Integration for Product Image Storage

A utility for uploading images to AWS S3 has been implemented:

- **uploadToS3**: Configures multer to upload files to S3 (or local storage as a fallback).
- **deleteFileFromS3**: Deletes a file from S3 bucket.
- **getS3FileUrl**: Gets the URL of a file in S3.
- **isS3Configured**: Checks if S3 credentials are configured.

The product controller has been updated with an `uploadProductImage` method that uses this utility to handle image uploads.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Redis (optional, for caching)
- Docker (optional, for containerization)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/farm2fork.git
   cd farm2fork
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration

   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd ../frontend
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Docker Setup

Alternatively, you can use Docker to run the application:

```bash
docker-compose up
```

## 📝 API Documentation

API documentation is available at `/api/docs` when the server is running. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage

```bash
# Backend test coverage
cd backend
npm run test:coverage

# Frontend test coverage
cd frontend
npm run test:coverage
```

## 📦 Deployment

### Frontend Deployment (Netlify)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy to Netlify:
   ```bash
   npx netlify deploy --prod
   ```

### Backend Deployment (Vultr)

1. Set up a Vultr instance with Docker installed
2. Clone the repository on the server
3. Configure environment variables
4. Build and run the Docker containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

For questions or support, please contact us at support@farm2fork.com or open an issue in this repository.

## 📄 Project Documentation

- **README.md**: This file, containing project overview and setup instructions
- **_planning.md**: Comprehensive project planning document with requirements, personas, architecture, etc.
- **_prompts.md**: Examples of AI prompts used to build the project (convert to _prompts.pdf for submission)
- **docs/**: Additional documentation including user guides and deployment instructions

## 🙏 Acknowledgements

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Material-UI](https://material-ui.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Stripe](https://stripe.com/)
- [Shippo](https://goshippo.com/)
- [SendGrid](https://sendgrid.com/)
- [AWS](https://aws.amazon.com/)
