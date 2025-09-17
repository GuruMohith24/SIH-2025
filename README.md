# SIH-2025: Automated Attendance System for Rural Schools

This is a web application built for the Smart India Hackathon 2025. It is an Automated Attendance System for Rural Schools.

## Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/en/) (v18 or later)
*   [npm](https://www.npmjs.com/) (or [yarn](https://yarnpkg.com/))
*   A MongoDB database (you can use a local installation or a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/GuruMohith24/SIH-2025.git
    cd SIH-2025
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    *   Create a copy of the `.env.example` file and rename it to `.env.local`.
    *   Open the `.env.local` file and fill in the required values:
        *   `NEXTAUTH_SECRET`: A secret key for NextAuth.js. You can generate one using `openssl rand -base64 32` in your terminal.
        *   `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Your Google OAuth credentials. You can get these from the [Google Cloud Console](https://console.cloud.google.com/).
        *   `MONGODB_URI`: The connection string for your MongoDB database.

## Running the Development Server

Once you have completed the setup, you can run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **Database:** [MongoDB](https://www.mongodb.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)