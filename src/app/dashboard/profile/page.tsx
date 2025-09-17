// src/app/dashboard/profile/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  graduationYear?: number;
  degree?: string;
  company?: string;
  jobTitle?: string;
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession(); // <-- Get the 'update' function
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // This useEffect will run once to load the user's existing profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "authenticated") {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile({
            graduationYear: data.graduationYear,
            degree: data.degree,
            company: data.company,
            jobTitle: data.jobTitle,
          });
        }
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [status]); // It runs when the session status changes to "authenticated"

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (response.ok) {
      // This is the magic line!
      // It tells NextAuth to update the session with the new user data
      // which also updates the name if it was changed (not in this form, but good practice)
      await update(); 
      setMessage("Profile updated successfully!");
    } else {
      setMessage("Failed to update profile.");
    }
  };

  // Redirect logic using useEffect to avoid render errors
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);


  if (status !== "authenticated" || isLoading) {
    return <p className="text-center p-10">Loading...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Edit Your Profile</h1>
      <p>Welcome, {session?.user?.name}</p>
      
      <form onSubmit={handleUpdateProfile} className="mt-6 max-w-lg">
        {/* ... your form fields ... */}
        <div className="mb-4">
          <label>Graduation Year</label>
          <input type="number" value={profile.graduationYear || ''} onChange={(e) => setProfile({...profile, graduationYear: Number(e.target.value)})} className="w-full rounded-md border p-2"/>
        </div>
        <div className="mb-4">
          <label>Degree / Major</label>
          <input type="text" value={profile.degree || ''} onChange={(e) => setProfile({...profile, degree: e.target.value})} className="w-full rounded-md border p-2"/>
        </div>
        <div className="mb-4">
          <label>Current Company</label>
          <input type="text" value={profile.company || ''} onChange={(e) => setProfile({...profile, company: e.target.value})} className="w-full rounded-md border p-2"/>
        </div>
        <div className="mb-4">
          <label>Job Title</label>
          <input type="text" value={profile.jobTitle || ''} onChange={(e) => setProfile({...profile, jobTitle: e.target.value})} className="w-full rounded-md border p-2"/>
        </div>
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white">Update Profile</button>
      </form>
      {message && <p className={`mt-4 ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
    </div>
  );
}