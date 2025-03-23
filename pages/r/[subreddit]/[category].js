import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Navbar from "../../../components/Navbar";
import Posts from "../../../components/Posts";
import SkeletonLoader from "../../../components/SkeletonLoader";

export default function SubredditCategoryPage() {
    const router = useRouter();
    const { subreddit, category } = router.query;
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [viewMode, setViewMode] = useState("grid");
    const [imageSize, setImageSize] = useState("medium");
    const [query, setQuery] = useState("");
    const [after, setAfter] = useState("");
    const observer = useRef();
    const lastPostRef = useRef();
    const abortControllerRef = useRef(null);
    const loadingRef = useRef();

    useEffect(() => {
        if (subreddit) {
            setQuery(subreddit);
        }
    }, [subreddit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/r/${query.trim()}/hot`);
        }
    };

    const handleChange = (e) => {
        setQuery(e.target.value);
    };

    const isMedia = (post) => {
        if (!post) return false;

        // Filter out gallery posts
        if (post.is_gallery) {
            return false;
        }

        const url = post.url;
        if (!url) return false;

        // Check for media extensions
        const mediaExtensions =
            /\.(jpg|jpeg|png|webp|avif|gif|svg|gfycat|mp4|webm)$/i;
        const isRedditVideo = /^(?:https?:\/\/)?(?:(?:v\.)?redd.it\/)/i;
        const isYoutube =
            /^(?:https?:\/\/)?(?:(?:www\.)?youtube.com\/watch\?v=|youtu.be\/)(\w+)$/i;
        const isImgur =
            /^(?:https?:\/\/)?(?:i\.)?imgur\.com\/([a-zA-Z0-9]+)(?:\.(jpg|jpeg|png|gif|webp))?$/i;

        return (
            mediaExtensions.test(url) ||
            isRedditVideo.test(url) ||
            isYoutube.test(url) ||
            isImgur.test(url) ||
            post.post_hint === "image" ||
            post.is_video
        );
    };

    const fetchPosts = async (isLoadMore = false) => {
        if (!subreddit || !category) return;

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

            // Filter and process posts
            const newPosts = data.data.children
                .filter((post) => {
                    const isValid = isMedia(post.data);
                    if (!isValid) {
                        console.log("Filtered out post:", {
                            id: post.data.id,
                            url: post.data.url,
                            post_hint: post.data.post_hint,
                            is_video: post.data.is_video,
                            is_gallery: post.data.is_gallery,
                            has_preview: !!post.data.preview,
                        });
                    }
                    return isValid;
                })
                .map((post) => {
                    // Ensure the post has a valid URL
                    if (
                        !post.data.url &&
                        post.data.preview?.images?.[0]?.source?.url
                    ) {
                        post.data.url = post.data.preview.images[0].source.url;
                    }
                    return post;
                });

            if (newPosts.length === 0) {
                throw new Error(`No media posts found in "${cleanSubreddit}"`);
            }

            if (isLoadMore) {
                // Check for duplicates before adding new posts
                const existingIds = new Set(posts.map((post) => post.data.id));
                const uniqueNewPosts = newPosts.filter(
                    (post) => !existingIds.has(post.data.id)
                );
                if (uniqueNewPosts.length > 0) {
                    setPosts((prev) => [...prev, ...uniqueNewPosts]);
                }
            } else {
                setPosts(newPosts);
            }

            setHasMore(data.data.after !== null);
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
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !isLoading) {
                    setAfter(posts[posts.length - 1]?.data?.name);
                }
            },
            { threshold: 0.1 }
        );

        const currentObserver = observer;
        if (loadingRef.current) {
            currentObserver.observe(loadingRef.current);
        }

        return () => {
            if (loadingRef.current) {
                currentObserver.unobserve(loadingRef.current);
            }
        };
    }, [hasMore, isLoading, posts]);

    useEffect(() => {
        if (subreddit && category) {
            setAfter(""); // Reset after when category changes
            fetchPosts(false);
        }
    }, [subreddit, category]);

    useEffect(() => {
        if (after) {
            fetchPosts(true);
        }
    }, [after]);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const filterItem = (cat) => {
        router.push(`/r/${subreddit}/${cat}`);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-base-200">
                <Navbar
                    category={category}
                    filterItem={filterItem}
                    query={query}
                    handleSubmit={handleSubmit}
                    handleChange={handleChange}
                    subreddit={subreddit}
                    onReset={() => router.push("/")}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    imageSize={imageSize}
                    setImageSize={setImageSize}
                />
                <div className="container mx-auto px-4 py-8">
                    <div className="alert alert-error">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-current shrink-0 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>Error: {error}</span>
                    </div>
                    <button
                        className="btn btn-primary mt-4"
                        onClick={() => router.push("/")}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar
                category={category}
                filterItem={filterItem}
                query={query}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                subreddit={subreddit}
                onReset={() => router.push("/")}
                viewMode={viewMode}
                setViewMode={setViewMode}
                imageSize={imageSize}
                setImageSize={setImageSize}
            />
            <div className="container mx-auto px-4 py-8">
                {posts.length === 0 && !isLoading ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">
                            No posts found
                        </h2>
                        <p className="text-gray-600">
                            Try a different subreddit or category
                        </p>
                    </div>
                ) : (
                    <>
                        <Posts
                            posts={posts}
                            viewMode={viewMode}
                            imageSize={imageSize}
                        />
                        <div ref={loadingRef} className="mt-8">
                            {isLoading && (
                                <SkeletonLoader
                                    viewMode={viewMode}
                                    imageSize={imageSize}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
