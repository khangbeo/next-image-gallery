import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Posts from "../../components/Posts";
import SkeletonLoader from "../../components/SkeletonLoader";

export default function SubredditPage() {
    const router = useRouter();
    const { subreddit } = router.query;
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState("hot");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [viewMode, setViewMode] = useState("grid");
    const [imageSize, setImageSize] = useState("medium");
    const observer = useRef();
    const lastPostRef = useRef();
    const abortControllerRef = useRef(null);

    const isMedia = (url) => {
        if (!url) return true;
        const mediaExtensions =
            /\.(jpg|jpeg|png|webp|avif|gif|svg|gfycat|mp4|webm)$/i;
        const isRedditVideo = /^(?:https?:\/\/)?(?:(?:v\.)?redd.it\/)/i;
        const isYoutube =
            /^(?:https?:\/\/)?(?:(?:www\.)?youtube.com\/watch\?v=|youtu.be\/)(\w+)$/i;
        return (
            !mediaExtensions.test(url) &&
            !isRedditVideo.test(url) &&
            !isYoutube.test(url)
        );
    };

    const fetchPosts = async (isLoadMore = false) => {
        if (!subreddit) return;

        try {
            if (!isLoadMore) {
                setIsLoading(true);
                setError(null);
            } else {
                setIsLoadingMore(true);
            }

            const cleanSubreddit = subreddit.trim().toLowerCase();
            if (!cleanSubreddit) {
                throw new Error("Please enter a subreddit name");
            }

            const baseUrl = "https://www.reddit.com";
            const endpoint = `/r/${encodeURIComponent(
                cleanSubreddit
            )}/${category}.json`;
            const params = new URLSearchParams({
                restrict_sr: "true",
                include_over_18: "on",
                limit: "25",
            });

            if (isLoadMore && posts.length > 0) {
                params.append(
                    "after",
                    posts[posts.length - 1]?.data?.name || ""
                );
            }

            const url = `${baseUrl}${endpoint}?${params.toString()}`;

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            const response = await fetch(url, {
                signal: abortControllerRef.current.signal,
                headers: {
                    "User-Agent": "RedditViewer/1.0.0",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Subreddit "${cleanSubreddit}" not found`);
                } else if (response.status === 403) {
                    throw new Error(
                        `Access to "${cleanSubreddit}" is forbidden`
                    );
                } else {
                    throw new Error(
                        data.message ||
                            `Error ${response.status}: ${response.statusText}`
                    );
                }
            }

            if (!data.data || !data.data.children) {
                throw new Error("Invalid response format from Reddit API");
            }

            const newPosts = data.data.children;
            const validPosts = newPosts.filter(
                (post) => post && post.data && !isMedia(post.data.url)
            );

            if (validPosts.length === 0) {
                throw new Error(`No media posts found in "${cleanSubreddit}"`);
            }

            if (isLoadMore) {
                // Check for duplicates before adding new posts
                const existingIds = new Set(posts.map((post) => post.data.id));
                const uniqueNewPosts = validPosts.filter(
                    (post) => !existingIds.has(post.data.id)
                );
                if (uniqueNewPosts.length > 0) {
                    setPosts((prev) => [...prev, ...uniqueNewPosts]);
                }
            } else {
                setPosts(validPosts);
            }

            setHasMore(newPosts.length === 25);
            setPage((prev) => (isLoadMore ? prev + 1 : 1));
            setError(null);
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(err.message);
                console.error("Fetch error:", err);
            }
            setHasMore(false);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        if (subreddit) {
            router.replace(`/r/${subreddit}/hot`);
        }
    }, [subreddit, router]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: "20px",
            threshold: 0.1,
        };

        observer.current = new IntersectionObserver((entries) => {
            const [target] = entries;
            if (target.isIntersecting && hasMore && !isLoadingMore) {
                fetchPosts(true);
            }
        }, options);

        if (lastPostRef.current) {
            observer.current.observe(lastPostRef.current);
        }

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [posts, hasMore, isLoadingMore]);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const filterItem = (cat) => {
        setCategory(cat);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-base-100 flex flex-col">
                <Navbar
                    category={category}
                    filterItem={filterItem}
                    query={subreddit}
                    handleSubmit={() => {}}
                    handleChange={() => {}}
                    subreddit={subreddit}
                    onReset={() => router.push("/")}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    imageSize={imageSize}
                    setImageSize={setImageSize}
                />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Error</h1>
                        <p className="text-base-content/70">{error}</p>
                        <button
                            className="btn btn-primary mt-4"
                            onClick={() => router.push("/")}
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 flex flex-col">
            <Navbar
                category={category}
                filterItem={filterItem}
                query={subreddit}
                handleSubmit={() => {}}
                handleChange={() => {}}
                subreddit={subreddit}
                onReset={() => router.push("/")}
                viewMode={viewMode}
                setViewMode={setViewMode}
                imageSize={imageSize}
                setImageSize={setImageSize}
            />
            <main className="flex-1 container mx-auto px-4 py-8">
                {isLoading ? (
                    <SkeletonLoader viewMode={viewMode} imageSize={imageSize} />
                ) : (
                    <Posts
                        posts={posts}
                        lastPostRef={lastPostRef}
                        isLoadingMore={isLoadingMore}
                        viewMode={viewMode}
                        imageSize={imageSize}
                    />
                )}
            </main>
        </div>
    );
}
