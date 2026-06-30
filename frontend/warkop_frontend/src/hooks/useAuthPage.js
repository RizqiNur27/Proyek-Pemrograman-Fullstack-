import { useState } from "react";
import { login, register } from "../api";
import { useAuth } from "../context/AuthContext";

export default function useAuthPage(onSuccess) {
  const { loginUser } = useAuth();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const res = await login({
          email: form.email,
          password: form.password,
        });

        loginUser(res.token);
        onSuccess?.();
      } else {
        await register({
          nama: form.nama,
          email: form.email,
          password: form.password,
        });

        setMode("login");
        setForm({
          nama: "",
          email: form.email,
          password: "",
        });

        alert("Registrasi berhasil! Silakan login.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    mode,
    setMode,
    form,
    loading,
    error,
    handleChange,
    handleSubmit,
  };
}