// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login failed: ' + error.message);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
   
    <div className="flex justify-center items-center h-screen ">
      
      <div className="card w-[350px] shadow-sm bg-primary items-center text-[var(--foreground)] p-[24px]">
        
        <h1 className="text-2xl font-bold text-center">Login Account</h1>
        <form onSubmit={handleSignIn} className="w-[300px]">
          <div>
            <label 
              htmlFor="email"
              className="block text-sm font-medium " 
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            
              className="input w-[93%] my-[10px]"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium "
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input w-[93%] bg-pink my-[10px]"
            />
          </div>
          <div className='flex justify-center items-center my-[10px]'>
          <button
            type="submit"
         
            className="btn btn-wide "
          >
            Login
          </button>
          </div>
          <div className="text-center mt-4 my-[10px]">
            <Link href="/forgot-password" 
              className="text-sm hover:underline text-[var(--foreground)]"
            >
              Forget Password
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}