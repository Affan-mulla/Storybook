import { useState } from "react";
import { uploadToCloudinary } from "../cloudinary/upload";

export default function CloudinaryTest() {
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTestUpload = async (event) => {
    event.preventDefault();
    setError("");

    if (!imageFile || !audioFile) {
      setError("Select both an image and an audio file.");
      return;
    }

    setLoading(true);

    try {
      const uploadedImageUrl = await uploadToCloudinary(
        imageFile,
        "storybook/images",
        "image",
      );
      const uploadedAudioUrl = await uploadToCloudinary(
        audioFile,
        "storybook/audio",
        "video",
      );

      setImageUrl(uploadedImageUrl);
      setAudioUrl(uploadedAudioUrl);
    } catch (err) {
      setError(err.message || "Cloudinary upload test failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Cloudinary Upload Test</h1>
      <form onSubmit={handleTestUpload}>
        <div>
          <label htmlFor="test-image">Cover Image (resourceType: image)</label>
          <input
            id="test-image"
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            required
          />
        </div>

        <div>
          <label htmlFor="test-audio">Audio File (resourceType: video)</label>
          <input
            id="test-audio"
            type="file"
            accept="audio/*"
            onChange={(event) => setAudioFile(event.target.files?.[0] || null)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Run Upload Test"}
        </button>
      </form>

      {error ? <p>{error}</p> : null}

      {imageUrl ? (
        <section>
          <h2>Image secure_url</h2>
          <a href={imageUrl} target="_blank" rel="noreferrer">
            {imageUrl}
          </a>
          <div>
            <img src={imageUrl} alt="Uploaded cover" width="280" />
          </div>
        </section>
      ) : null}

      {audioUrl ? (
        <section>
          <h2>Audio secure_url</h2>
          <a href={audioUrl} target="_blank" rel="noreferrer">
            {audioUrl}
          </a>
          <div>
            <audio controls src={audioUrl} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
