Media Gallery Application

A web-based media gallery application built with React for the frontend, Node.js/Express for the backend, and MongoDB as the database. This application allows users to upload, view, edit, and delete media files, download selected files as a ZIP, and prepares the groundwork for future features like a contact form and user management.

Features

Completed Features





User Authentication: Secure login and token-based authentication using JWT.



Media Gallery:





Upload multiple images with titles, descriptions, tags, and sharing options.



View personal and shared galleries.



Search media by title or tags.



Edit and delete own media items.



Display images in a responsive grid with a slider for viewing.



ZIP Download:





Select multiple media items and download them as a ZIP file.



Images are now included at the root level of the ZIP (fixed folder issue).

Upcoming Features





Contact Form:





Submit messages with name, email, subject, and message.



Edit and delete own messages.



Admin view and delete all messages.



User Management (Admin Only):





View and edit user profiles (name, email, role).



Soft-delete/deactivate users.

Prerequisites





Node.js (v14.x or later)



npm (v6.x or later)



MongoDB (local or remote instance)

Installation

Backend





Navigate to the backend directory:

cd backend



Install dependencies:

npm install



Set up environment variables:





Create a .env file in the backend directory with:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key



Start the backend server:

npm run dev

Frontend





Navigate to the frontend directory:

cd frontend



Install dependencies:

npm install



Set up environment variables:





Create a .env file in the frontend directory with:

VITE_API_URL=http://localhost:5000



Start the frontend development server:

npm run dev

Usage





Register/Login: Access the application and log in with your credentials.



Media Gallery:





Navigate to /gallery to view your personal or shared media.



Upload new images via the "Upload New Image" button.



Search for media using the search bar.



Select items with checkboxes and download them as a ZIP using the "Download ZIP" button.



Edit or delete your media items using the respective buttons.



Test the ZIP Download: Ensure images are downloaded at the root level of the ZIP file.

Project Structure

project/
├── backend/
│   ├── models/          # Mongoose models (e.g., Media.js, User.js)
│   ├── routes/         # API routes (e.g., mediaRoutes.js)
│   ├── middleware/     # Authentication middleware
│   ├── utils/          # Utility functions (e.g., fileUpload.js)
│   ├── package.json    # Backend dependencies
│   └── .env            # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/      # React pages (e.g., MediaGallery.jsx)
│   │   ├── components/ # Reusable components
│   │   ├── App.jsx     # Main app component
│   │   └── main.jsx    # Entry point
│   ├── package.json    # Frontend dependencies
│   └── .env            # Environment variables
└── README.md           # This file

Technologies Used





Frontend: React, Axios, Tailwind CSS



Backend: Node.js, Express, MongoDB, Mongoose, Archiver



Authentication: JWT



Deployment: Git, (e.g., Heroku, Vercel)

Contributing





Fork the repository.



Create a new branch: git checkout -b feature-branch.



Make your changes and commit: git commit -m "Add new feature".



Push to the branch: git push origin feature-branch.



Submit a pull request.

Roadmap





Contact Form: Implement message submission, editing, deletion, and admin management.



User Management: Add admin-only features for viewing, editing, and deactivating users.



Enhancements: Add image previews during upload, pagination for large galleries, and user notifications.

License

MIT License - Feel free to modify and distribute.

Acknowledgments





Built with guidance from xAI's Grok 3.



Inspired by modern web development practices.
