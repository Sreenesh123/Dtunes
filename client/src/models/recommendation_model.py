from pymongo import MongoClient
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

client = MongoClient("mongodb://localhost:27017/")
db = client["music_db"]
tracks_collection = db["tracks"]  

def get_recommendations(track_id):
    print("📡 Fetching tracks from MongoDB...")

    tracks = list(tracks_collection.find({}, {"_id": 1, "name": 1, "artist": 1, "album": 1, "genre": 1}))

    print(f"🔍 Total Tracks Found: {len(tracks)}")
    if tracks:
        print("Sample Track:", tracks[0]) 
    else:
        print("No tracks found in database!")
        return []

    df = pd.DataFrame(tracks)

    print("📝 DataFrame created:")
    print(df.head()) 

    df["_id"] = df["_id"].astype(str)
    print(f"🔎 Checking if track ID {track_id} exists in the dataset...")
    print("🎼 Available Track IDs:", df["_id"].tolist()) 

    if track_id not in df["_id"].values:
        print("Track ID not found in `tracks` collection!")
        return []

    df["metadata"] = df["name"] + " " + df["artist"] + " " + df["album"] + " " + df["genre"]
    print("🔠 Metadata column before vectorization:")
    print(df["metadata"].head())
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df["metadata"])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    idx = df[df["_id"] == track_id].index[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    print("📊 Similarity Scores:")
    for i, score in sim_scores[:10]: 
        print(f"🎶 Track Index: {i}, Similarity: {score:.4f}")
    sim_scores = sim_scores[1:6]
    track_indices = [i[0] for i in sim_scores]
    recommended_ids = df["_id"].iloc[track_indices].tolist()
    print("✅ Recommended Track IDs:", recommended_ids)
    return recommended_ids
