import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

function App() {
  const startSession = async () => {
    try {
      const userId = uuidv4();
      const response = await fetch("http://localhost:8000/api/start-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        // If the response status is not OK (e.g., 400, 500)
        throw new Error(`Failed to start session: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.token) {
        // Store the token in localStorage
        localStorage.setItem("sessionToken", data.token);
        console.log("Session started. Token:", data.token);
        console.log("Questions:", data.questions);
      } else {
        console.error("No token received");
      }
    } catch (error) {
      console.error("Error starting session:", error.message);
    }
  };

  useEffect(() => {
    startSession();
  }, []);

  return (
    <div>
      <h1>Chatbot Session</h1>
      <p>Starting session... Check console for details.</p>
    </div>
  );
}

export default App;
