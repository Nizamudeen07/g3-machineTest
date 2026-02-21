import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Api from "../services/api";
import Bg from "@assets/download 1.png";
import checkBlank from "@assets/checkBlank.svg";
import checkBox from "@assets/checkBox.svg";
import emailIcon from "@assets/mail-01.svg";
import lockIcon from "@assets/lock-02.svg";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ===============================
  // VALIDATION
  // ===============================
  const validate = () => {
    let err = {};

    if (!form.email) err.email = "Email is required";
    if (!form.password) err.password = "Password is required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ===============================
  // HANDLE LOGIN
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("ip_address", "220.233.36.40");

      const res = await Api.post("login", formData, {
        headers: {
          Accept: "application/json",
        },
      });

      const data = res?.data;
      console.log("LOGIN RESPONSE:", data);

      if (!data) {
        toast.error("Invalid server response");
        return;
      }

      if (data.isExpired === 1) {
        toast.success(data.message);
        return;
      }

      if (!data.access_token) {
        toast.error(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem(
        "company_id",
        data.companies?.[0]?.id || ""
      );

      toast.success("Login successful");

      navigate("/users");

    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data || err);
      toast.error(
        err.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
   
      <div
        className="h-screen w-screen flex flex-col items-center justify-center bg-black relative overflow-hidden"
        style={{
          backgroundImage: `url(${Bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* LOGO */}
        <h1 className="absolute top-12 text-white text-4xl font-semibold tracking-widest">
          LOGO
        </h1>
    
        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="w-[420px] backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl text-white shadow-2xl"
        >
          <h2 className="text-2xl font-semibold mb-2">Sign in</h2>
          <p className="text-sm text-white/70 mb-6">
            Log in to manage your account
          </p>
    
          {/* Email */}
          <label className="text-sm text-white/80">Email</label>
          <div className="flex items-center mt-2 border border-white/30 rounded-lg px-4 py-3 bg-white/5">
            <img src={emailIcon} className="mr-3 w-5" alt="Email Icon" />
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent outline-none w-full placeholder-white/60"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
    
          {/* Password */}
          <label className="text-sm text-white/80 mt-6 block">
            Password
          </label>
          <div className="flex items-center mt-2 border border-white/30 rounded-lg px-4 py-3 bg-white/5">
            <img src={lockIcon} className="mr-3 w-5" alt="Lock Icon" />
            <input
              type="password"
              placeholder="Enter your password"
              className="bg-transparent outline-none w-full placeholder-white/60"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
          )}
    
          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setRemember(!remember)}
            >
              <img
                src={remember ? checkBox : checkBlank}
                className="mr-2 w-4"
                alt="Checkbox"
              />
              <span className="text-white/80">Remember me</span>
            </div>
    
            <span className="text-purple-300 cursor-pointer hover:underline">
              Forgot password?
            </span>
          </div>
    
          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    );
    
  
}
