import projectimage1 from "../../img/projectimage1.png";

export const Checkout = () => {
  return (
    <div
      className="home d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: `url(${projectimage1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        width: "100%",
        padding: "2rem",
      }}
    >
      <div
        className="text-center"
        style={{ maxWidth: "700px", color: "#f8f9fa"  }}
      >
        <h1
          className="mb-4"
          style={{
            whiteSpace: "nowrap",
            color: "#0d6efd", 
            textShadow: "0 0 5px rgba(13,110,253,0.7)", 
          }}
        >
          🚧 Coming Soon: Game Sales & Checkout 🚀
        </h1>

        <img
          src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGd1aWZkaWswdzVhdHkzMDI3aTY0a2Y1MzNoNGN3djZ0bzU4cGE1dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UKwSxTQpFZoMrYxrYE/giphy.gif"
          alt="Coming Soon"
          className="img-fluid mb-4"
          style={{ maxWidth: "350px" }}
        />

        <p className="fs-5" style={{ color: "#f8f9fa", textShadow: "0 0 3px rgba(0,0,0,0.7)" }}>
          We're currently working on obtaining the necessary licensing to offer game sales directly through our website. Our checkout system is also in the works and will be live soon. Stay tuned—we can’t wait to bring you an amazing game shopping experience!
        </p>
      </div>
    </div>
  );
};
