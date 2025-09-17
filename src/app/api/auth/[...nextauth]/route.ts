// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import { NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/user";
import connectToDatabase from "@/lib/database";
// We are temporarily removing the credentials provider to isolate the Google issue

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }
        // This is a demo, so we are using hardcoded admin credentials.
        // In a real application, you should hash and salt the password and store it in the database.
        if (credentials.email === 'admin@example.com' && credentials.password === 'newadminpassword') {
          await connectToDatabase();
          let user = await User.findOne({ email: credentials.email });
          if (!user) {
            user = await User.create({ email: credentials.email, role: 'admin' });
          } else if (user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
          }
          return user;
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  
  callbacks: {
    async session({ session, user }) {
      // Attach user role to session for admin checks
      if (session.user) {
        (session.user as any).role = (user as any).role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };