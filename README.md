# QR-Based Attendance System

An automated attendance system for universities that uses QR codes for marking student attendance in lectures.

## Features

- **Faculty Features**:
  - Generate QR codes for lectures (with subject, course, timing)
  - View attendance reports for lectures
  - Export attendance data as CSV
  - QR codes automatically expire after lecture ends

- **Student Features**:
  - Scan QR codes to mark attendance
  - View attendance percentage (overall and subject-wise)
  - View lecture history with date filtering

- **Authentication**:
  - Role-based authentication (Student/Faculty)
  - JWT-based secure authentication
  - Password hashing with bcrypt

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: React, TailwindCSS
- **Authentication**: JWT
- **QR Code**: qrcode npm library

## Project Structure

```
attendance-system/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   └── facultyRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   └── facultyController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Lecture.js
│   │   └── Attendance.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── utils/
│       └── qr.js
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── QRScanner.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── StudentDashboard.js
│   │   │   └── FacultyDashboard.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   └── context/
│   │       └── AuthContext.js
│   └── index.css
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd attendance-system/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/attendance-system
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd attendance-system/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Faculty

1. Register as a faculty member
2. Log in with your faculty ID and password
3. Create a new lecture with subject, course, and timing details
4. Display the generated QR code to students
5. View attendance records for the lecture
6. Generate and export attendance reports

### Student

1. Register as a student
2. Log in with your roll number and password
3. Scan the QR code displayed by the faculty
4. View your attendance percentage and history

## Error Handling

- Invalid QR codes will be rejected
- Expired lecture QR codes cannot be used for attendance
- Duplicate attendance entries are prevented
- Grace period for late attendance can be configured

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes based on user roles
- QR codes expire after lecture ends

## License

This project is licensed under the MIT License.