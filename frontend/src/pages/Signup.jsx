import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
import projectimage1 from "../../img/projectimage1.png";

export const Signup = () => {
  const { store, signup } = useGlobalReducer();
  const [user, setUser] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(user.email)) {
      setError("Please enter a valid email.");
      return;
    }

    const success = await signup(user);
    if (success) {
      navigate("/login");
    } else {
      setError("Sign up failed. Please try again.");
    }
  };

  return (
    <div
      className="d-flex justify-content-center"
      style={{
        backgroundImage: `url(${projectimage1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        width: "100vw",
      }}
    >
      <form
        onSubmit={handleSignUp}
        className="p-4 rounded w-100"
        style={{ maxWidth: "400px", marginTop: "100px" }}
      >
        <h1 className="text-white text-center mb-4">Sign Up</h1>

        <div className="mb-3">
          <input
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            type="email"
            className="form-control"
            placeholder="Email"
            required
          />
        </div>

        <div className="mb-3">
          <input
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            type="password"
            className="form-control"
            placeholder="Password"
            required
          />
        </div>

        {error && <div className="text-danger mb-3 text-center">{error}</div>}

        <button type="submit" className="btn btn-primary w-100">
          Submit
        </button>
      </form>
    </div>
  );
};
