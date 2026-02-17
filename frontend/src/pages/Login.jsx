import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
import projectimage1 from "../../img/projectimage1.png";

export const Login = () => {
  const { store, login } = useGlobalReducer();
  const [user, setUser] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(user);
    if (!success) {
      setError("Invalid email or password.");
    }
  };

  useEffect(() => {
    if (store.user && store.access_token) {
      navigate("/profile/" + store.user.id);
    }
  }, [store.user, store.access_token]);

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
        onSubmit={handleLogin}
        className="p-4 rounded w-100"
        style={{ maxWidth: "400px", marginTop: "100px" }}
      >
        <h1 className="text-white text-center mb-4">Login</h1>

        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            onChange={(e) => {
              setError(null);
              setUser({ ...user, email: e.target.value });
            }}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            onChange={(e) => {
              setError(null);
              setUser({ ...user, password: e.target.value });
            }}
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
