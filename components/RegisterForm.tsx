import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      // After successful registration, sign in with Discord
      await signIn("discord");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            {...register("username")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Registering..." : "Register"}
        </button>

        <div className="text-center mt-4">
          <button
            onClick={() => signIn("discord")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-discord hover:bg-discord-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-discord"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0c-2.056 0-3.075.014-3.957.04 1.797.242 3.165 1.05 3.917 2.32C15.076.015 14.057 0 12 0z" />
              <path d="M12 5.838c-1.879 0-2.773.02-3.464.058 1.386.896 2.633 2.32 3.406 3.887-.77.867-1.384 1.628-1.384 2.737 0 1.11.614 2.737 1.385 2.737.772 0 1.385-.867 1.385-2.737 0-1.11-.613-2.737-1.385-2.737-.773 0-1.385.867-1.385 2.737 0 1.508.94 2.08 2.531 2.328-.49.447-.906 1.089-1.385 1.818v.058c2.083-.086 3.167-.934 3.958-2.32C15.075 8.152 14.056 7.838 12 7.838v-.001zm0 1.5c.801 0 1.173.002 1.54.01 1.872.046 2.771 1.477 2.817 3.464-.242 1.386-.866 2.633-1.818 3.406.446.49.866 1.384 1.818 1.384.67 0 1.54-.01 1.54-.01 1.172-.002 1.871-.046 2.817-.092.946-2.08.99-2.771.99-3.957 0-1.173-.044-1.872-.09-2.818-.008-.27-.012-.67-.012-1.54v-.001c0-1.11.044-1.872.09-2.818.046-1.045.092-1.645.092-2.818 0-1.173-.046-1.872-.092-2.818A1.006 1.006 0 0 0 19.39 5.848c-.946 2.08-1.86 2.771-3.405 2.817-.49-.447-1.089-.906-1.818-1.384v-.058c.946-.086 1.86-.934 2.818-2.32C13.173 5.84 12.802 5.838 12 5.838z" />
            </svg>
            Continue with Discord
          </button>
        </div>
      </form>
    </div>
  );
}
