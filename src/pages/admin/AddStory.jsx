import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../cloudinary/upload";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { FaCloudUploadAlt, FaMusic, FaImage, FaFeatherAlt } from "react-icons/fa";

const initialForm = {
  title: "",
  description: "",
  categories: [],
  fullContent: "",
};

const DEFAULT_CATEGORIES = [
  "Adventure",
  "Fantasy",
  "Horror",
  "Kids",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

export default function AddStory() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [coverFile, setCoverFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStage, setUploadStage] = useState("idle");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [existingCategories, setExistingCategories] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const snapshot = await getDocs(collection(db, "stories"));
        const categorySet = new Set();

        snapshot.docs.forEach((storyDocument) => {
          const story = storyDocument.data();

          if (Array.isArray(story.categories)) {
            story.categories.forEach((category) => {
              if (typeof category === "string" && category.trim()) {
                categorySet.add(category.trim());
              }
            });
          }
        });

        if (isMounted) {
          setExistingCategories(Array.from(categorySet));
        }
      } catch {
        if (isMounted) {
          setExistingCategories([]);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories])).sort();
  }, [existingCategories]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const toggleCategory = (categoryOption) => {
    setForm((previous) => {
      const currentCategories = previous.categories;
      if (currentCategories.includes(categoryOption)) {
        return {
          ...previous,
          categories: currentCategories.filter((c) => c !== categoryOption),
        };
      } else {
        return { ...previous, categories: [...currentCategories, categoryOption] };
      }
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setCoverFile(null);
    setAudioFile(null);
    setFileInputKey((previous) => previous + 1);
  };

  const validate = () => {
    const requiredTextValues = [
      form.title,
      form.description,
      form.fullContent,
    ];

    const hasEmptyText = requiredTextValues.some((value) => !value.trim());
    if (hasEmptyText || !coverFile || !audioFile || form.categories.length === 0) {
      toast.error("Please fill all fields and select both files.");
      return false;
    }

    if (!user?.uid) {
      toast.error("You must be logged in as admin to publish a story.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      setUploadStage("uploading-image");
      const coverImageURL = await uploadToCloudinary(
        coverFile,
        "storybook/images",
        "image",
      );

      setUploadStage("uploading-audio");
      const audioURL = await uploadToCloudinary(
        audioFile,
        "storybook/audio",
        "video",
      );

      setUploadStage("saving-firestore");
      await addDoc(collection(db, "stories"), {
        title: form.title,
        description: form.description,
        fullContent: form.fullContent,
        categories: form.categories,
        coverImageURL,
        audioURL,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });

      setUploadStage("success");
      toast.success("Story published successfully!");
      resetForm();
    } catch (error) {
      setUploadStage("idle");
      toast.error(error.message || "Failed to publish story.");
    } finally {
      setSubmitting(false);
    }
  };

  const stageLabel = {
    idle: "Ready to Create",
    "uploading-image": "Uploading visual assets...",
    "uploading-audio": "Uploading narration track...",
    "saving-firestore": "Finalizing publication...",
    success: "Success! Your story is live.",
  }[uploadStage];

  return (
    <main className="min-h-screen bg-background py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-foreground border-l-4 border-primary pl-4 inline-block">
            Publish New Story
          </h1>
          <p className="font-lora text-muted-foreground mt-3 pl-5">
            Share your next masterpiece with the StoryBook community.
          </p>
        </header>

        <div className="bg-card/50 border border-border sm:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="p-6 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Category & Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground font-lora ml-1">Story Title</label>
                  <input
                    name="title"
                    placeholder="Enter a captivating title..."
                    value={form.title}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-lora shadow-inner"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground font-lora ml-1">Genre Categories</label>
                  <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-background/50 p-4 shadow-inner min-h-[132px] content-start">
                    {categoryOptions.map((categoryOption) => {
                      const isSelected = form.categories.includes(categoryOption);
                      return (
                        <button
                          type="button"
                          key={categoryOption}
                          onClick={() => toggleCategory(categoryOption)}
                          className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold font-lora tracking-wide transition-all duration-300 ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-md scale-105"
                              : "bg-background border border-border text-muted-foreground hover:border-primary hover:text-primary"
                          }`}
                        >
                          {categoryOption}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground font-lora ml-1">
                    Select one or more genres to categorize your story.
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground font-lora ml-1">Short Description</label>
                <textarea
                  name="description"
                  placeholder="Write a brief teaser to hook your readers..."
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background/50 px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-lora resize-none shadow-inner"
                  required
                />
              </div>

              {/* Full Content */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground font-lora ml-1">Full Manuscript Content</label>
                <textarea
                  name="fullContent"
                  placeholder="Once upon a time..."
                  value={form.fullContent}
                  onChange={handleChange}
                  className="h-64 sm:h-80 w-full rounded-xl border border-border bg-background/50 px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-lora shadow-inner"
                  required
                />
              </div>

              <div className="flex items-center gap-4 py-2">
                 <div className="h-px bg-border flex-grow"></div>
                 <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Media Uploads</span>
                 <div className="h-px bg-border flex-grow"></div>
              </div>

              {/* Media Uploads Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Image Upload */}
                <div className="space-y-3 relative group">
                  <label className="text-sm font-bold text-foreground font-lora flex items-center gap-2 mb-1 ml-1">
                    <FaImage className="text-primary" /> Cover Artwork
                  </label>
                  <label className={`block relative border-2 border-dashed ${coverFile ? 'border-primary bg-primary/10' : 'border-border bg-background/30 hover:border-primary/50 hover:bg-card'} rounded-2xl p-8 text-center transition-all cursor-pointer shadow-sm group-hover:shadow-md`}>
                    <input
                      key={`cover-${fileInputKey}`}
                      type="file"
                      accept="image/*"
                      onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <FaCloudUploadAlt className={`mx-auto text-4xl mb-3 transition-transform ${coverFile ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-primary group-hover:-translate-y-1'}`} />
                    {coverFile ? (
                      <p className="text-sm text-foreground font-bold truncate px-2">{coverFile.name}</p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm text-foreground font-medium">Click to select image</p>
                        <p className="text-xs text-muted-foreground font-lora">JPEG, PNG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Audio Upload */}
                <div className="space-y-3 relative group">
                  <label className="text-sm font-bold text-foreground font-lora flex items-center gap-2 mb-1 ml-1">
                    <FaMusic className="text-primary" /> Narration Audio
                  </label>
                  <label className={`block relative border-2 border-dashed ${audioFile ? 'border-primary bg-primary/10' : 'border-border bg-background/30 hover:border-primary/50 hover:bg-card'} rounded-2xl p-8 text-center transition-all cursor-pointer shadow-sm group-hover:shadow-md`}>
                    <input
                      key={`audio-${fileInputKey}`}
                      type="file"
                      accept="audio/*"
                      onChange={(event) => setAudioFile(event.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <FaCloudUploadAlt className={`mx-auto text-4xl mb-3 transition-transform ${audioFile ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-primary group-hover:-translate-y-1'}`} />
                    {audioFile ? (
                      <p className="text-sm text-foreground font-bold truncate px-2">{audioFile.name}</p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm text-foreground font-medium">Click to select audio</p>
                        <p className="text-xs text-muted-foreground font-lora">MP3, WAV up to 15MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Wrapper */}
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border/50">
                <div className="flex items-center gap-3 bg-background/50 px-4 py-2 rounded-full border border-border">
                  <div className={`w-2.5 h-2.5 rounded-full ${submitting ? 'bg-primary animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></div>
                  <span className="text-sm text-foreground font-lora font-medium tracking-wide">
                    {uploadStage === 'idle' ? 'System ready' : stageLabel}
                  </span>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto relative overflow-hidden rounded-full bg-primary px-10 py-4 font-bold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-3 group"
                >
                  {submitting ? (
                    <>
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-primary-foreground/30 border-t-primary-foreground"></span>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <FaFeatherAlt className="text-lg group-hover:rotate-12 transition-transform" /> Publish Story
                    </>
                  )}
                </button>
              </div>
              
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
