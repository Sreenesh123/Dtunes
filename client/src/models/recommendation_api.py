from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from recommendation_model import get_recommendations

app = Flask(__name__)
CORS(app,supports_credentials=True, resources={r"/*": {"origins": "*"}})  

client = MongoClient("mongodb://localhost:27017/")
db = client["music_db"]
tracks_collection = db["tracks"]  

@app.route("/save-track", methods=["POST"])
def save_track():
    data = request.json
    track_id = data.get("track_id")
    track_name = data.get("track_name")
    artist = data.get("artist")
    album = data.get("album")
    genre = data.get("genre", "Unknown") 
    image = data.get("image")

    if not track_id or not track_name or not artist:
        return jsonify({"error": "Missing required fields"}), 400
    existing_track = tracks_collection.find_one({"_id": track_id})
    if not existing_track:
        tracks_collection.insert_one({
            "_id": track_id,
            "name": track_name,
            "artist": artist,
            "album": album,
            "genre": genre,
            "image": image,
            "timestamp": datetime.utcnow()
        })
        print(f"✅ Track '{track_name}' added to database.")

    return jsonify({"message": "Track saved successfully!"}), 201
@app.route("/recommendations", methods=["GET"])
def recommendations():
    track_id = request.args.get("track_id")
    
    if not track_id:
        return jsonify({"error": "track_id is required"}), 400

    try:
        recommendations = get_recommendations(track_id)
        return jsonify(recommendations)
    except IndexError:
        return jsonify({"error": "Track ID not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
