"use client";

import React, { useState } from "react";
import Image from "next/image";
import { supabase } from "@/services/supabaseClient";
import { useRouter } from "next/navigation";

function Login() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        router.refresh();
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        alert("Account created successfully. Please login.");

        setIsLogin(true);
      }
    } catch (err) {
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">

      <div className="bg-white rounded-3xl shadow-lg w-[430px] overflow-hidden">

        <div className="flex justify-center mt-6">
          <Image
            src="/NexprepLogo.png"
            alt="logo"
            width={150}
            height={70}
          />
        </div>

        <div className="flex justify-center mt-5">
          <Image
            src="/Login.png"
            alt="login"
            width={320}
            height={280}
          />
        </div>

        <div className="px-8 pb-8">

          <h2 className="text-2xl font-bold text-center">
            {isLogin ? "Login" : "Create Account"}
          </h2>

          <p className="text-center text-gray-500 mb-6">
            {isLogin
              ? "Login using Email & Password"
              : "Create your account"}
          </p>

          {!isLogin && (
            <input
              className="w-full border rounded-lg p-3 mb-4"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            className="w-full border rounded-lg p-3 mb-4"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border rounded-lg p-3 mb-4"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-red-500 text-sm mb-3">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded-lg py-3"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>

          <button
            className="mt-5 text-blue-600 w-full"
            onClick={() => {
              setError("");
              setIsLogin(!isLogin);
            }}
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : "Already have an account? Login"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;