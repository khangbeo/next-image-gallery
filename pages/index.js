import { useState, useEffect, useRef } from "react";
import Posts from "../components/Posts";
import Link from "next/link";
import Footer from "../components/Footer";
import SkeletonLoader from "../components/SkeletonLoader";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [subreddit, setSubreddit] = useState("");
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("hot");
    const [isLoading, setIsLoading] = useState(null);
    const [err, setErr] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observer = useRef();
    const lastPostRef = useRef();
    const abortControllerRef = useRef(null);
    const categories = ["hot", "top", "new", "best", "rising"];
    const [viewMode, setViewMode] = useState("grid");
    const [imageSize, setImageSize] = useState("medium");

    const filterItem = async (curCat) => {
        setIsLoading(true); // Set loading state for category change
        setCategory(curCat);
        setPage(1);
        setPosts([]);
        setHasMore(true);
        setErr(null);

        if (subreddit) {
            try {
                const cleanSubreddit = subreddit.trim().toLowerCase();
                if (!cleanSubreddit) {
                    throw new Error("Please enter a subreddit name");
                }

                const baseUrl = "https://www.reddit.com";
                const endpoint = `/r/${encodeURIComponent(
                    cleanSubreddit
                )}/${curCat}.json`;
                const params = new URLSearchParams({
                    restrict_sr: "true",
                    include_over_18: "on",
                    limit: "25",
                });

                const url = `${baseUrl}${endpoint}?${params.toString()}`;

                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                abortControllerRef.current = new AbortController();

                const res = await fetch(url, {
                    signal: abortControllerRef.current.signal,
                    headers: {
                        "User-Agent": "RedditViewer/1.0.0",
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error(
                            `Subreddit "${cleanSubreddit}" not found`
                        );
                    } else if (res.status === 403) {
                        throw new Error(
                            `Access to "${cleanSubreddit}" is forbidden`
                        );
                    } else {
                        throw new Error(
                            data.message ||
                                `Error ${res.status}: ${res.statusText}`
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
                    throw new Error(
                        `No media posts found in "${cleanSubreddit}"`
                    );
                }

                setPosts(validPosts);
                setHasMore(newPosts.length === 25);
                setPage(2);
                setErr(null);
            } catch (e) {
                if (e.name !== "AbortError") {
                    setErr(e.message || `Error: ${subreddit} does not exist!`);
                    console.error(`Fetch error:`, e);
                }
                setHasMore(false);
            } finally {
                setIsLoading(false);
            }
        } else {
            setErr("Enter a subreddit");
            setIsLoading(false);
        }
    };

    const getSubreddit = async (isLoadMore = false) => {
        if (!isLoadMore) return; // Only handle pagination here

        // Abort previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setIsLoadingMore(true);

        try {
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

            // Only add after parameter for categories that support it
            if (["new", "top"].includes(category) && posts.length > 0) {
                params.append(
                    "after",
                    posts[posts.length - 1]?.data?.name || ""
                );
            }

            const url = `${baseUrl}${endpoint}?${params.toString()}`;

            const res = await fetch(url, {
                signal: abortControllerRef.current.signal,
                headers: {
                    "User-Agent": "RedditViewer/1.0.0",
                },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || `Error ${res.status}: ${res.statusText}`
                );
            }

            if (!data.data || !data.data.children) {
                throw new Error("Invalid response format from Reddit API");
            }

            const newPosts = data.data.children;
            const validPosts = newPosts.filter(
                (post) => post && post.data && !isMedia(post.data.url)
            );

            // Check for duplicates before adding new posts
            const existingIds = new Set(posts.map((post) => post.data.id));
            const uniqueNewPosts = validPosts.filter(
                (post) => !existingIds.has(post.data.id)
            );

            if (uniqueNewPosts.length > 0) {
                setPosts((prev) => [...prev, ...uniqueNewPosts]);
                setHasMore(newPosts.length === 25);
                setPage((prev) => prev + 1);
                setErr(null);
            } else {
                setHasMore(false);
            }
        } catch (e) {
            if (e.name !== "AbortError") {
                setErr(e.message || `Error: ${subreddit} does not exist!`);
                console.error(`Fetch error:`, e);
            }
            setHasMore(false);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Helper function to check if URL is media
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

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: "20px",
            threshold: 0.1,
        };

        observer.current = new IntersectionObserver((entries) => {
            const [target] = entries;
            if (target.isIntersecting && hasMore && !isLoadingMore) {
                getSubreddit(true);
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

    const handleChange = ({ target }) => {
        setQuery(target.value);
        setSubreddit(target.value);
        setErr(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        try {
            const response = await fetch(
                `https://www.reddit.com/r/${query}/hot.json?limit=1`
            );
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            router.push(`/r/${query}`);
        } catch (err) {
            setErr(err.message);
        }
    };

    const handleReset = () => {
        setSubreddit("");
        setQuery("");
        setPosts([]);
        setCategory("hot");
        setPage(1);
        setHasMore(true);
        setErr(null);
        setIsLoading(false);
        setIsLoadingMore(false);
    };

    return (
        <div className="min-h-screen bg-base-100 flex flex-col">
            <Navbar
                category={category}
                filterItem={filterItem}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                subreddit={subreddit}
                query={query}
                onReset={handleReset}
                viewMode={viewMode}
                setViewMode={setViewMode}
                imageSize={imageSize}
                setImageSize={setImageSize}
            />
            <main className="flex-1 container mx-auto px-4 py-8">
                {!subreddit ? (
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-8">
                            Reddit Viewer
                        </h1>
                        <p className="text-lg text-base-content/70 mb-8">
                            Enter a subreddit name to start browsing
                        </p>
                        {err && <p className="text-error mb-4">{err}</p>}
                    </div>
                ) : err ? (
                    <div className="text-center text-red-500 text-xl">
                        {err}
                    </div>
                ) : (
                    <>
                        {isLoading ? (
                            <SkeletonLoader
                                viewMode={viewMode}
                                imageSize={imageSize}
                            />
                        ) : (
                            <Posts
                                posts={posts}
                                lastPostRef={lastPostRef}
                                isLoadingMore={isLoadingMore}
                                viewMode={viewMode}
                                imageSize={imageSize}
                            />
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
