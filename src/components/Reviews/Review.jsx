import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Review.css"
;

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube-nocookie.com/embed/${match[2]}`
    : null;
};

const Review = ({ product = {}, setProduct, productId }) => {
  const navigate = useNavigate();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [videoSuccess, setVideoSuccess] = useState("");

  const getCurrentUser = () => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser || rawUser === "undefined") return null;
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?._id || currentUser?.id;
  const token = localStorage.getItem("token");

  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    if (!token || !currentUser) {
      navigate("/login");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Please write a comment before submitting.");
      return;
    }

    try {
      setReviewLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/products/${productId}/reviews`,
        {
          rating: Number(reviewRating),
          comment: reviewComment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { data: newReview, averageRating, numReviews } = response.data;

      setProduct((prev) => ({
        ...prev,
        reviews: [...(prev.reviews || []), newReview],
        averageRating: averageRating ?? prev.averageRating,
        numReviews: numReviews ?? (prev.reviews?.length || 0) + 1,
      }));

      setReviewRating(5);
      setReviewComment("");
      setReviewSuccess("Your review has been published!");
    } catch (err) {
      console.error("Error adding review:", err);
      setReviewError(
        err.response?.data?.message ||
          "Unable to post review. Please try again.",
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!window.confirm("Are you sure you want to remove this review?")) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/products/${productId}/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { averageRating, numReviews } = response.data;

      setProduct((prev) => ({
        ...prev,
        reviews: (prev.reviews || []).filter(
          (review) => review._id !== reviewId,
        ),
        averageRating: averageRating ?? prev.averageRating,
        numReviews: numReviews ?? Math.max(0, (prev.reviews?.length || 1) - 1),
      }));
    } catch (err) {
      console.error("Error deleting review:", err);
      alert(err.response?.data?.message || "Failed to remove review.");
    }
  };

  const handleAddVideoReview = async (e) => {
    e.preventDefault();
    setVideoError("");
    setVideoSuccess("");

    if (!token || !currentUser) {
      navigate("/login");
      return;
    }

    if (!videoTitle.trim() || !videoUrl.trim()) {
      setVideoError("Please provide both a title and a valid video URL.");
      return;
    }

    try {
      setVideoLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/products/${productId}/video-reviews`,
        {
          title: videoTitle.trim(),
          videoUrl: videoUrl.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const newVideoReview = response.data?.data;

      setProduct((prev) => ({
        ...prev,
        videoReviews: [...(prev.videoReviews || []), newVideoReview],
      }));

      setVideoTitle("");
      setVideoUrl("");
      setVideoSuccess("Video demonstration shared successfully!");
    } catch (err) {
      console.error("Error adding video review:", err);
      setVideoError(
        err.response?.data?.message || "Unable to submit video demonstration.",
      );
    } finally {
      setVideoLoading(false);
    }
  };

  const handleDeleteVideoReview = async (videoReviewId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!window.confirm("Delete this video review?")) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/products/${productId}/video-reviews/${videoReviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProduct((prev) => ({
        ...prev,
        videoReviews: (prev.videoReviews || []).filter(
          (review) => review._id !== videoReviewId,
        ),
      }));
    } catch (err) {
      console.error("Error deleting video review:", err);
      alert(err.response?.data?.message || "Unable to delete video review.");
    }
  };

  const reviews = product.reviews || [];
  const videoReviews = product.videoReviews || [];

  return (
    <div className="reviews-component-wrapper">
      <section className="product-reviews-section">
        <div className="reviews-header">
          <h2>Customer Reviews</h2>
          <p>Read authentic feedback from artists, learners, and performers.</p>
        </div>

        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map((review) => {
              const reviewUserId =
                typeof review.user === "object"
                  ? review.user?._id || review.user?.id
                  : review.user;

              const reviewerName =
                typeof review.user === "object"
                  ? review.user?.username
                  : String(currentUserId) === String(reviewUserId)
                    ? currentUser?.username
                    : "Musician";

              const canDelete =
                currentUser &&
                (String(currentUserId) === String(reviewUserId) ||
                  currentUser.role === "admin");

              return (
                <article className="review-card" key={review._id}>
                  <div className="review-card-header">
                    <div>
                      <h3 className="reviewer-name">
                        {reviewerName || "Musician"}
                      </h3>
                      <div
                        className="review-stars"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        className="delete-review-btn"
                        onClick={() => handleDeleteReview(review._id)}
                        title="Delete review"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <p className="review-comment">{review.comment}</p>

                  {review.createdAt && (
                    <small className="review-date">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </small>
                  )}
                </article>
              );
            })
          ) : (
            <div className="no-reviews">
              <p>No customer reviews yet.</p>
              <span>
                Be the first to share your experience with this instrument.
              </span>
            </div>
          )}
        </div>

        <div className="add-review-box">
          <h3>Write a Review</h3>

          {reviewError && (
            <div className="review-alert error">{reviewError}</div>
          )}
          {reviewSuccess && (
            <div className="review-alert success">{reviewSuccess}</div>
          )}

          {currentUser ? (
            <form onSubmit={handleAddReview} className="review-form">
              <div className="review-rating-field">
                <label htmlFor="review-rating">Rating</label>
                <select
                  id="review-rating"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  <option value={5}>★★★★★ - 5 Stars (Excellent)</option>
                  <option value={4}>★★★★☆ - 4 Stars (Very Good)</option>
                  <option value={3}>★★★☆☆ - 3 Stars (Good)</option>
                  <option value={2}>★★☆☆☆ - 2 Stars (Fair)</option>
                  <option value={1}>★☆☆☆☆ - 1 Star (Poor)</option>
                </select>
              </div>

              <div className="review-comment-field">
                <label htmlFor="review-comment">Review Description</label>
                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell other musicians about tone clarity, craftsmanship, tuning stability..."
                  rows="4"
                  maxLength={1000}
                  required
                />
              </div>

              <button
                type="submit"
                className="submit-review-btn"
                disabled={reviewLoading}
              >
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          ) : (
            <div className="login-review-message">
              <p>Please log in to leave feedback on this instrument.</p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="login-review-btn"
              >
                Login to Review
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="video-reviews-section">
        <div className="reviews-header">
          <h2>Sound &amp; Video Demonstrations</h2>
          <p>
            Watch instruments demonstrated by artists and studio recordings.
          </p>
        </div>

        <div className="video-reviews-list">
          {videoReviews.length > 0 ? (
            videoReviews.map((review) => {
              const reviewUserId =
                typeof review.user === "object"
                  ? review.user?._id || review.user?.id
                  : review.user;

              const reviewerName =
                typeof review.user === "object"
                  ? review.user?.username
                  : String(currentUserId) === String(reviewUserId)
                    ? currentUser?.username
                    : "Musician";

              const canDelete =
                currentUser &&
                (String(currentUserId) === String(reviewUserId) ||
                  currentUser.role === "admin");

              const embedUrl = getYouTubeEmbedUrl(review.videoUrl);

              return (
                <article className="video-review-card" key={review._id}>
                  {embedUrl ? (
                    <div className="video-embed-container">
                      <iframe
                        src={embedUrl}
                        title={review.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : null}

                  <div className="video-review-header">
                    <div>
                      <h3>{review.title}</h3>
                      <p className="video-author">
                        Shared by {reviewerName || "Musician"}
                      </p>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        className="delete-review-btn"
                        onClick={() => handleDeleteVideoReview(review._id)}
                        title="Delete video demo"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {!embedUrl && (
                    <a
                      href={review.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="watch-video-btn"
                    >
                      ▶ Watch External Video
                    </a>
                  )}

                  {review.createdAt && (
                    <small className="review-date">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </small>
                  )}
                </article>
              );
            })
          ) : (
            <div className="no-reviews">
              <p>No video demonstrations yet.</p>
              <span>
                Share a recording demonstrating the tone and acoustics.
              </span>
            </div>
          )}
        </div>

        <div className="add-review-box">
          <h3>Share a Sound Demo</h3>

          {videoError && <div className="review-alert error">{videoError}</div>}
          {videoSuccess && (
            <div className="review-alert success">{videoSuccess}</div>
          )}

          {currentUser ? (
            <form onSubmit={handleAddVideoReview} className="review-form">
              <div className="review-comment-field">
                <label htmlFor="video-title">Demonstration Title</label>
                <input
                  id="video-title"
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Acoustic Tone & Resonance Demo"
                  maxLength={120}
                  required
                />
              </div>

              <div className="review-comment-field">
                <label htmlFor="video-url">
                  Video Link (YouTube, Vimeo, or Video URL)
                </label>
                <input
                  id="video-url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>

              <button
                type="submit"
                className="submit-review-btn"
                disabled={videoLoading}
              >
                {videoLoading ? "Submitting..." : "Submit Video Demo"}
              </button>
            </form>
          ) : (
            <div className="login-review-message">
              <p>Please log in to share an instrument video demonstration.</p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="login-review-btn"
              >
                Login to Share
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Review;
