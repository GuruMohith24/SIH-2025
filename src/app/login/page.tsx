// src/app/login/page.tsx

"use client";


import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CombinedLoginPage() {
  const [isRegister, setIsRegister] = useState(false); // State to toggle between forms
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // This function handles BOTH login and registration for email/password
  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // If we are in "Sign Up" mode
    if (isRegister) {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // Automatically sign them in after successful registration
        await signIn('credentials', { email, password, redirect: true, callbackUrl: '/dashboard' });
      } else {
        setError(result.message);
      }
    } 
    // If we are in "Sign In" mode
    else {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isRegister ? 'Create your account' : 'Login to your account'}</CardTitle>
              <CardDescription>
                {isRegister
                  ? 'Enter your details below to create your account'
                  : 'Enter your email below to login to your account'}
              </CardDescription>
            </div>
            <Button variant="link" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Sign In' : 'Sign Up'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailAuth} className="space-y-6">
            {isRegister && (
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-center text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">
              {isRegister ? 'Create Account' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          >
            Login with Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}