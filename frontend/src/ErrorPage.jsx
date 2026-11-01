import { useRouteError, useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError(); // Captures the thrown error
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Oops! Something went wrong 😢😿😿😭😭🥺🥺🥺</h1>
      <a className="un" onClick={() => navigate(-1)}>Go Back</a>
    </div>
  );
}