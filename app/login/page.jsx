'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {

  const router = useRouter();

  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  async function handleLogin(e){

    e.preventDefault();

    setError('');
    setLoading(true);

    try{

      const res=await fetch('/api/auth/login',{

        method:'POST',

        headers:{
          'Content-Type':'application/json'
        },

        body:JSON.stringify({
          username,
          password
        })

      });

      const data=await res.json();

      if(!res.ok){

        setError(data.error||'Login failed');
        return;
      }

      router.push('/dashboard');

    }catch{

      setError('Something went wrong');

    }finally{

      setLoading(false);

    }
  }

  return (

    <div className="login-root">

      <div className="login-card">

        <h1>
          SS Traders
        </h1>

        <p>
          Enterprise Document Control
        </p>

        <form onSubmit={handleLogin}>

          <input
            placeholder="Username"
            value={username}
            onChange={e=>setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : 'Sign In'}
          </button>

        </form>

      </div>

    </div>

  );
}
