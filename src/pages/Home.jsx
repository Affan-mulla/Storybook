import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaChevronRight, FaChevronLeft, FaHeart, FaCommentAlt, FaFeatherAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import useStories from "../hooks/useStories";
import StoryCard from "../components/StoryCard";

export default function Home() {
  const { role } = useAuth();
  const { stories, loading } = useStories();
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeRecTab, setActiveRecTab] = useState("Recommended");

  // Filter & Prep Data
  const spotlightStories = stories.slice(0, 6);

  const communityStats = useMemo(() => {
    const totalStories = stories.length;
    const totalLikes = stories.reduce(
      (sum, story) => sum + Number(story.likesCount || 0),
      0,
    );
    const totalComments = stories.reduce(
      (sum, story) => sum + Number(story.commentsCount || 0),
      0,
    );

    return { totalStories, totalLikes, totalComments };
  }, [stories]);
  
  const trendingStories = useMemo(() => {
    return [...stories]
      .sort((a, b) => {
        const scoreA = Number(a.likesCount || 0) + Number(a.commentsCount || 0);
        const scoreB = Number(b.likesCount || 0) + Number(b.commentsCount || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;

        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [stories]);

  const recommendedStories = useMemo(() => {
    let filtered = stories;
    if (activeRecTab === "Popular") {
      filtered = [...stories].sort(
        (a, b) =>
          Number(b.likesCount || 0) + Number(b.commentsCount || 0) -
          (Number(a.likesCount || 0) + Number(a.commentsCount || 0)),
      );
    }
    if (activeRecTab === "Originals") {
      filtered = stories.filter((story) => {
        const categories = Array.isArray(story.categories) ? story.categories : [];
        return categories.some((category) => category.toLowerCase() === "originals");
      });
    }
    if (activeRecTab === "What's New") {
      filtered = [...stories].sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });
    }
    return filtered.slice(0, 12);
  }, [stories, activeRecTab]);

  const heroStories = stories.slice(0, 5);
  const currentHeroStory = heroStories[heroIndex];

  const handleNextHero = () => {
    setHeroIndex((prev) => (prev + 1) % heroStories.length);
  };

  const handlePrevHero = () => setHeroIndex((prev) => (prev === 0 ? heroStories.length - 1 : prev - 1));

  // Auto-rotate hero
  useEffect(() => {
    if (heroStories.length > 1) {
      const interval = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % heroStories.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroStories.length]);


  // Helper component for loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-lora text-muted-foreground animate-pulse">Loading StoryBook...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-foreground flex flex-col items-center">
      <div className="w-full  mx-auto">
        
        {/* Section 1 — Hero */}
        <section className="relative w-full min-h-[70vh] flex flex-col md:flex-row items-center overflow-hidden ">
          <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none"></div>
          
          <div className="relative z-10 w-full md:w-1/2 p-8 md:p-16 flex flex-col items-start justify-center space-y-6">
            <div className="flex gap-2 bg-background/40 backdrop-blur-sm p-1 rounded-full border border-foreground/10">
              {['Stories', 'Novels', 'Audio'].map(tab => (
                <button key={tab} className="px-5 py-1.5 rounded-full text-xs font-bold font-lora tracking-wider uppercase text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-colors">
                  {tab}
                </button>
              ))}
            </div>
            
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-foreground font-black leading-tight">
              Welcome to StoryBook,<br/> Home of Imagination!
            </h1>
            
            <p className="font-lora text-lg text-foreground/80 italic max-w-lg">
              StoryBook lets you connect with top authors, immerse in breathtaking worlds, monetize your tales, and share your voice.
            </p>

            <Link to="/discover" className="mt-4 px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-full font-lora text-lg hover:scale-105 hover:shadow-lg hover:shadow-primary/40 transition-all duration-300">
              Browse Stories
            </Link>
          </div>

          <div className="relative z-10 w-full md:w-1/2 p-8 flex items-center justify-center min-h-[400px]">
             {currentHeroStory ? (
               <div className="relative group w-full max-w-[350px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <img src={currentHeroStory.coverImageURL || currentHeroStory.coverImageUrl} alt={currentHeroStory.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-muted/40 via-muted/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <span className="inline-block px-3 py-1 bg-primary/90 backdrop-blur text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-md mb-3">
                      {Array.isArray(currentHeroStory.categories) && currentHeroStory.categories.length > 0
                        ? currentHeroStory.categories.join(", ")
                        : "General"}
                    </span>
                    <h3 className="font-playfair text-3xl font-bold text-foreground line-clamp-2 leading-tight shadow-sm">{currentHeroStory.title}</h3>
                    <div className="mt-3 flex items-center gap-3 text-sm text-primary-foreground/90 font-lora">
                      <span className="inline-flex items-center gap-1 text-red-500"><FaHeart /> {Number(currentHeroStory.likesCount || 0)}</span>
                      <span className="inline-flex items-center gap-1 text-foreground"><FaCommentAlt /> {Number(currentHeroStory.commentsCount || 0)}</span>
                    </div>
                  </div>

                  <button onClick={(e) => { e.preventDefault(); handlePrevHero(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/50 hover:bg-primary backdrop-blur text-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <FaChevronLeft />
                  </button>
                  <button onClick={(e) => { e.preventDefault(); handleNextHero(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/50 hover:bg-primary backdrop-blur text-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <FaChevronRight />
                  </button>
               </div>
             ) : (
                <div className="w-full max-w-[350px] aspect-[3/4] rounded-2xl bg-card border border-border flex items-center justify-center p-8 text-center text-muted-foreground font-lora">
                  No stories available to feature yet!
                </div>
             )}
          </div>
        </section>

        {/* Section 2 — Weekly Spotlight */}
        <section className="w-full px-4 sm:px-6 py-16 bg-background">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-playfair text-3xl font-bold text-foreground border-l-4 border-primary pl-4">Weekly Spotlight</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {spotlightStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Link to="/discover" className="font-lora text-primary font-bold hover:text-foreground transition-colors flex items-center gap-2 group">
              View All <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Section 3 — New & Trending */}
        <section className="w-full px-4 sm:px-6 py-16 bg-card border-y border-border">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
            <h2 className="font-playfair text-3xl font-bold text-foreground border-l-4 border-primary pl-4">New & Trending</h2>
          </div>

          <div className="flex flex-col space-y-4 w-full ">
            {trendingStories.map((story, idx) => (
              <Link key={story.id} to={`/story/${story.id}`} className="group flex items-center p-4 rounded-xl hover:bg-background border border-transparent hover:border-border hover:shadow-xl transition-all duration-300">
                <div className="w-16 flex-shrink-0 flex justify-center">
                  <span className="font-playfair text-4xl font-extrabold text-primary/30 group-hover:text-primary transition-colors">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                </div>
                
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted ml-2 sm:ml-4 shadow-md group-hover:scale-105 transition-transform duration-300">
                  <img src={story.coverImageURL} alt={story.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow flex flex-col justify-center ml-4 sm:ml-6 pr-4">
                  <h3 className="font-playfair text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{story.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-xs uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {Array.isArray(story.categories) && story.categories.length > 0
                        ? story.categories.join(", ")
                        : "General"}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-lora">
                      <FaHeart className="text-[10px]" /> {Number(story.likesCount || 0)}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-lora">
                      <FaCommentAlt className="text-[10px]" /> {Number(story.commentsCount || 0)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link to="/trending" className="font-lora text-primary font-bold hover:text-foreground transition-colors flex items-center gap-2 group w-max">
              View All Trending <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Section 4 — Recommended for You */}
        <section className="w-full px-4 sm:px-6 py-16 bg-background">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex overflow-x-auto no-scrollbar gap-2 sm:gap-6 pb-2 md:pb-0 font-lora font-bold">
              {['Recommended', 'Popular', 'Originals', "What's New"].map(tab => (
                 <button 
                  key={tab} 
                  onClick={() => setActiveRecTab(tab)}
                  className={`text-sm sm:text-base foregroundspace-nowrap px-3 py-1.5 transition-colors border-b-2 ${activeRecTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                 >
                   {tab}
                 </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-lora self-end md:self-auto">
              <span>Sort by:</span>
              <select className="bg-card border border-border rounded-md px-2 py-1 text-foreground outline-none focus:border-primary">
                <option>Recently Updated</option>
                <option>Most Read</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {recommendedStories.map(story => (
              <Link key={story.id} to={`/story/${story.id}`} className="group flex flex-col space-y-3 hover:scale-[1.02] transition-transform duration-300">
                <div className="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-muted relative">
                  <img src={story.coverImageURL} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-background/20 group-hover:bg-transparent transition-colors duration-300"></div>
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">{story.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] sm:text-xs text-primary/80 uppercase font-bold tracking-widest">
                      {Array.isArray(story.categories) && story.categories.length > 0
                        ? story.categories.join(", ")
                        : "General"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-lora flex items-center gap-1"><FaHeart className="text-secondary" /> {Number(story.likesCount || 0)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {recommendedStories.length === 0 && (
             <p className="text-muted-foreground font-lora italic py-8 border-t border-border mt-4">No stories found for this tab.</p>
          )}
        </section>

        {/* Section 5 — Stats Banner */}
        <section className="w-full px-4 sm:px-6 py-12 bg-card/50 border-y border-border backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex flex-row items-center justify-center divide-x divide-border">
            <div className="flex-1 flex flex-col items-center justify-center py-4 px-2">
              <span className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black text-primary flex items-center gap-3">
                <span className="text-lg sm:text-2xl text-primary/50">📚</span>{communityStats.totalStories}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 text-center">Stories</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-4 px-2">
              <span className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black text-foreground flex items-center gap-3">
                <span className="text-lg sm:text-2xl text-foreground/30">❤️</span>{communityStats.totalLikes}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 text-center">Total Likes</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-4 px-2">
              <span className="font-playfair text-3xl sm:text-4xl md:text-5xl font-black text-primary flex items-center gap-3">
                <span className="text-lg sm:text-2xl text-primary/50">💬</span>{communityStats.totalComments}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 text-center">Total Comments</span>
            </div>
          </div>
        </section>

        {/* Section 6 — CTA Cards */}
        <section className="w-full px-4 sm:px-6 py-16 bg-background">
           <div className="flex flex-col md:flex-row gap-6">
             
             {/* Left Card */}
             <div className="flex-1 rounded-2xl bg-card border border-border p-8 sm:p-10 flex flex-col justify-center items-start shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
               <h3 className="font-playfair text-3xl font-black text-foreground mb-4 relative z-10 leading-snug">
                 Publish your stories, <br className="hidden lg:block"/> and reach millions.
               </h3>
               <Link to={role === 'admin' ? '/admin/add' : '/register'} className="relative z-10 bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold px-6 py-3 rounded-full transition-all flex items-center gap-2">
                 Submit a Story <FaFeatherAlt />
               </Link>
             </div>

             {/* Right Card */}
             <div className="flex-1 rounded-2xl bg-primary border border-primary p-8 sm:p-10 text-primary-foreground flex flex-col justify-center items-start shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-foreground/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
               <h3 className="font-playfair text-3xl font-black mb-4 relative z-10 leading-snug">
                 Read stories on the go. <br className="hidden lg:block"/> Download our app!
               </h3>
               <Link to="/discover" className="relative z-10 bg-primary-foreground text-primary hover:bg-foreground font-bold px-6 py-3 rounded-full transition-all shadow-md flex items-center gap-2">
                 Start Reading
               </Link>
             </div>

           </div>
        </section>

        {/* Section 7 — Footer */}
        <footer className="w-full bg-background border-t border-border pt-16 pb-8 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            
            <div className="space-y-4 w-full">
              <Link to="/" className="flex items-center gap-2 text-primary">
                <FaFeatherAlt className="text-2xl" />
                <span className="font-playfair text-3xl font-bold">StoryBook</span>
              </Link>
              <p className="text-sm text-foreground font-lora">
                Where stories come to life. Read, explore, and share imagination globally.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Download the app</h4>
              <div className="flex flex-col gap-3">
                <button className="flex items-center gap-3 bg-foreground/5 hover:bg-foreground/10 transition-colors border border-foreground/10 rounded-lg px-4 py-2 text-left w-40">
                  <div className="text-2xl">🍎</div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase leading-none mb-1">Download on the</div>
                    <div className="text-sm font-bold leading-none text-foreground">App Store</div>
                  </div>
                </button>
                <button className="flex items-center gap-3 bg-foreground/5 hover:bg-foreground/10 transition-colors border border-foreground/10 rounded-lg px-4 py-2 text-left w-40">
                  <div className="text-2xl">▶️</div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase leading-none mb-1">Get it on</div>
                    <div className="text-sm font-bold leading-none text-foreground">Google Play</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
               <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Contact us</h4>
               <a href="mailto:hello@storybook.app" className="font-lora text-muted-foreground hover:text-primary transition-colors block text-sm">hello@storybook.app</a>
               <a href="mailto:support@storybook.app" className="font-lora text-muted-foreground hover:text-primary transition-colors block text-sm">support@storybook.app</a>
            </div>

            <div className="space-y-4">
               <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Sign up for updates</h4>
               <form className="flex" onSubmit={e => e.preventDefault()}>
                 <input 
                   type="email" 
                   placeholder="Enter your email" 
                   className="bg-background text-foreground border border-border px-3 py-2 rounded-l-lg outline-none focus:border-primary w-full text-sm font-lora"
                 />
                 <button type="button" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 font-bold text-sm rounded-r-lg transition-colors">
                   Subscribe
                 </button>
               </form>
               <p className="text-[10px] text-muted-foreground">By subscribing you agree to our Terms and Conditions.</p>
            </div>
            
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-6 text-xs text-muted-foreground font-lora">
               <span className="hover:text-foreground cursor-pointer transition-colors">Terms and Conditions</span>
               <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
               <span className="hover:text-foreground cursor-pointer transition-colors">FAQ</span>
             </div>
             <p className="text-xs text-muted-foreground font-lora">© 2025 StoryBook. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
