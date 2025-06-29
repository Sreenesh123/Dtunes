export const fetchRecommendations = async (trackId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/recommendations?track_id=${trackId}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};
