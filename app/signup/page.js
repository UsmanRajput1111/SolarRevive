"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+92",
    password: "",
    confirmPassword: "",
    role: "customer",
    expertise: "",
  });

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Custom logic for phone number
    if (name === "phone") {
      let formattedValue = value.startsWith("+92") ? value : "+92";
      formattedValue = "+92" + formattedValue.slice(3).replace(/\D/g, "");
      if (formattedValue.length > 13) {
        formattedValue = formattedValue.slice(0, 13);
      }
      setFormData((prev) => ({ ...prev, phone: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneRegex = /^\+92\d{10}$/;
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!phoneRegex.test(formData.phone)) {
      toast.error(
        "Phone number must start with +92 and contain exactly 10 digits after it."
      );
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      toast.error(
        "Password must include 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (formData.role === "technician" && !formData.expertise) {
      toast.error("Please select your expertise.");
      return;
    }

    const loadingToast = toast.loading("Creating account...");
    try {
      await axios.post("/api/auth/signup", formData);
      toast.success("Account created successfully! Please login.", {
        id: loadingToast,
      });
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed", {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <Toaster />
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Phone Number with Flag and +92 */}
          <div>
            <label className="block text-gray-700">Phone Number</label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <div className="flex items-center bg-gray-100 px-3">
                <img
                  src="/pk-flag.png" // 🟢 replace this with your actual flag image path
                  alt="Pakistan Flag"
                  className="w-5 h-5 mr-2"
                />
                <span className="text-gray-700 font-medium">+92</span>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone.slice(3)} // only digits shown
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: "+92" + e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
                className="flex-1 px-3 py-2 outline-none"
                placeholder="XXXXXXXXXX"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-gray-700">I am a:</label>
            <select
              name="role"
              onChange={handleChange}
              value={formData.role}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="customer">Customer</option>
              <option value="technician">Technician</option>
            </select>
          </div>

          {/* Technician Expertise */}
          {formData.role === "technician" && (
            <div className="transition-all duration-300">
              <label className="block text-gray-700">Select Expertise:</label>
              <select
                name="expertise"
                onChange={handleChange}
                value={formData.expertise}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="" disabled>
                  Choose a category
                </option>
                <option value="Solar Panel Cleaning">Solar Panel Cleaning</option>
                <option value="Solar Panel Installation">
                  Solar Panel Installation
                </option>
                <option value="Solar Foundation">Solar Foundation</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-all"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
