import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Feedback() {
  const {rideID} = useParams()
  const navigate = useNavigate();
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState("");
  const [recommendation, setRecommendation] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('feedbackAuth')) navigate("/vehicles")
  })
  
  const handleSubmit = async () => {
    try {
      setSubmitted(true);
      const res = await fetch("http://localhost:8000/submit-feedback", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({rideID, rating, review, recommendation})
      })
      const data = await res.json()
      if (res.status === 201) {
        sessionStorage.removeItem('feedbackAuth')
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.log("Error submitting feedback...", error)
    }
  };

  if (submitted) {
    return (
      <div className="w-screen flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-4">Your feedback has been submitted successfully.</p>
          <p className="text-gray-500">Redirecting you to the homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <div>
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Rate Your Experience
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-medium mb-3">
            Overall Rating
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <svg 
                  className={`w-10 h-10 ${
                    (hoverRating || rating) >= star 
                      ? "text-yellow-400" 
                      : "text-gray-300"
                  }`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-gray-600">
              {rating ? `${rating} out of 5` : "Select a rating"}
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="review" className="block text-gray-700 text-lg font-medium mb-3">
            Your Review
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-y"
            placeholder="Share your experience with us..."
          ></textarea>
        </div>
        
        <div className="mb-8">
          <label className="block text-gray-700 text-lg font-medium mb-3">
            How likely are you to recommend us to others?
          </label>

          <div className="relative mb-4">
            <div className="flex items-center">
              <div className="relative w-full">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={recommendation}
                  onChange={(e) => setRecommendation(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(recommendation - 1) * 11.1}%, #e5e7eb ${(recommendation - 1) * 11.1}%, #e5e7eb 100%)`,
                    height: '6px'
                  }}
                />
                <style jsx>{`
                  .range-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 22px;
                    height: 22px;
                    background: white;
                    border: 3px solid #3b82f6;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                    transition: all 0.15s ease;
                  }
                  .range-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                  }
                  .range-slider::-moz-range-thumb {
                    width: 22px;
                    height: 22px;
                    background: white;
                    border: 3px solid #3b82f6;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                    transition: all 0.15s ease;
                  }
                  .range-slider::-moz-range-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                  }
                `}</style>
                
                <div className="absolute inset-x-0 top-8 flex justify-between text-xs text-gray-500">
                  {[...Array(10)].map((_, index) => (
                    <span 
                      key={index} 
                      className={`${index + 1 === recommendation ? 'font-bold text-blue-600' : ''}`}
                    >
                      {index + 1}
                    </span>
                  ))}
                </div>
              </div>
              <span className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold ml-4 shadow-md">
                {recommendation}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm text-gray-600 mt-8">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
        </div>
        
        <button
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition duration-200 flex items-center justify-center"
          onClick={handleSubmit}
          >
          Submit Feedback
        </button>
      </form>
      </div>
    </div>
  );
}

export default Feedback;
