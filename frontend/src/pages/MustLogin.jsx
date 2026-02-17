import React from "react";
import { Link } from "react-router-dom";
import projectimage1 from "../../img/projectimage1.png";

export const MustLogin = () => {
  return (
    <div>
      <div
        className="text-center container-fluid"
        style={{
          backgroundImage: `url(${projectimage1})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
          <h1 className="arise text-white">
            <strong>ARISE!</strong>
          </h1>
          <h1 className="mx-auto text-3xl font-bold text-white">
            You must be logged in
          </h1>
          <p className="text-white mt-4 mx-auto">Please log in to continue.</p>
          <img
            className="gif mx-auto"
            src="https://i.pinimg.com/originals/33/bd/d7/33bdd73f8ed677ef20a71935341b5c22.gif"
          />
          <div className="login-link">
            <Link
              to="/login"
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
