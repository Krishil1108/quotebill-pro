# QuoteBill Pro

A modern quote and bill management application built with React and Node.js.

## Features

- 📋 Create and manage quotes and bills
- 🏢 Customizable letterhead with logo upload
- 📊 Beautiful PDF generation
- 💾 MongoDB Atlas integration
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- PDFKit
- Multer (file uploads)

### Frontend
- React
- Tailwind CSS
- Lucide Icons

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   MONGO_URI=mongodb+srv://shahkrishil1108:Pops%23100@cluster0.mongodb.net/quotebill-pro?retryWrites=true&w=majority
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/quote-bill-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add your IP to the whitelist (Network Access)
4. Create a database user (Database Access)
5. Get your connection string and update the `.env` file

For detailed troubleshooting, see `backend/MONGODB_TROUBLESHOOTING.md`

## Usage

1. Access the application at `http://localhost:3000`
2. Configure your letterhead in settings
3. Create quotes and bills
4. Generate professional PDFs

## Project Structure

```
├── backend/
│   ├── server.js          # Main server file
│   ├── initDb.js          # Database initialization
│   ├── start.js           # Startup script
│   ├── package.json       # Backend dependencies
│   └── uploads/           # File uploads directory
└── frontend/
    └── quote-bill-app/
        ├── src/
        │   ├── App.js     # Main React component
        │   └── ...
        ├── public/
        └── package.json   # Frontend dependencies
```

## Environment Variables

### Backend (.env)
- `MONGO_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)

### Frontend (.env)
- `REACT_APP_API_BASE_URL` - API base URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Krishil Shah
