import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

function App() {
  const [questions, setQuestions] = useState([]); // Stores all questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question
  const [userAnswer, setUserAnswer] = useState(""); // Store user response
  const [sessionToken, setSessionToken] = useState(null); // Store token
  const [loading, setLoading] = useState(true); // Handle loading state

  useEffect(() => {
    const startSession = async () => {
      try {
        const userId = uuidv4();
        const response = await fetch(
          "http://localhost:8000/api/start-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          }
        );

        if (!response.ok) {
          // If the response status is not OK (e.g., 400, 500)
          throw new Error(`Failed to start session: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.token) {
          // Store the token in localStorage
          localStorage.setItem("sessionToken", data.token);
          setSessionToken(data.token);
          setQuestions(data.questions || []); // Load questions
        } else {
          throw new Error("No token received");
        }
        setLoading(false); // Stop the loading spinner
      } catch (error) {
        console.error("Error starting session:", error.message);
        setLoading(false); // Stop loading even if there's an error
      }
    };

    startSession();
  }, []);

  const handleNext = async () => {
    // Send the user's answer to the backend before moving to the next question
    if (sessionToken && userAnswer) {
      try {
        const response = await fetch(
          "http://localhost:8000/api/submit-answer",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionToken}`,
            },
            body: JSON.stringify({
              sessionId: sessionToken,
              question: questions[currentQuestionIndex],
              answer: userAnswer,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to submit answer");
        }
        const data = await response.json();
        console.log("Answer submitted:", data);

        // Clear the input and move to the next question
        setUserAnswer("");
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      } catch (error) {
        console.error("Error submitting answer:", error.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  if (currentQuestionIndex >= questions.length) {
    return <div>All questions completed!</div>;
  }

  return (
    <div>
      <h2>Question {currentQuestionIndex + 1}:</h2>
      {questions[currentQuestionIndex] ? ( // Check if the question exists
        <p>{questions[currentQuestionIndex]}</p>
      ) : (
        <p>Loading question...</p>
      )}

      <input
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Type your answer"
      />
      <button onClick={handleNext}>Next</button>
    </div>
  );
}

export default App;
