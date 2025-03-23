import { useState } from "react";
import ImageModal from "./ImageModal";

const Thumbnail = ({ url, title, viewMode, imageSize, post }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sizeClasses = {
        small: "h-24 w-24",
        medium: "h-32 w-32",
        large: "h-40 w-40",
    };

    const listClasses = {
        small: "h-20 w-20",
        medium: "h-24 w-24",
        large: "h-32 w-32",
    };

    const containerClasses =
        viewMode === "grid"
            ? "w-full h-full"
            : `flex-shrink-0 ${listClasses[imageSize]}`;

    return (
        <>
            <div
                className={`relative overflow-hidden rounded-lg cursor-pointer ${containerClasses}`}
                onClick={() => setIsModalOpen(true)}
            >
                <img
                    src={url}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>
            {isModalOpen && (
                <ImageModal
                    url={url}
                    title={title}
                    onClose={() => setIsModalOpen(false)}
                    post={post}
                />
            )}
        </>
    );
};

const YouTubeEmbed = ({ url, viewMode, imageSize }) => {
    const videoId = url.match(
        /(?:youtube\.com\/watch\?v=|youtu.be\/)([^&?]+)/
    )?.[1];
    if (!videoId) return null;

    const sizeClasses = {
        small: "h-24 w-24",
        medium: "h-32 w-32",
        large: "h-40 w-40",
    };

    const listClasses = {
        small: "h-20 w-20",
        medium: "h-24 w-24",
        large: "h-32 w-32",
    };

    const containerClasses =
        viewMode === "grid"
            ? "w-full h-full"
            : `flex-shrink-0 ${listClasses[imageSize]}`;

    return (
        <div
            className={`relative overflow-hidden rounded-lg ${containerClasses}`}
        >
            <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

const RedditVideo = ({ url, viewMode, imageSize }) => {
    const sizeClasses = {
        small: "h-24 w-24",
        medium: "h-32 w-32",
        large: "h-40 w-40",
    };

    const listClasses = {
        small: "h-20 w-20",
        medium: "h-24 w-24",
        large: "h-32 w-32",
    };

    const containerClasses =
        viewMode === "grid"
            ? "w-full h-full"
            : `flex-shrink-0 ${listClasses[imageSize]}`;

    return (
        <div
            className={`relative overflow-hidden rounded-lg ${containerClasses}`}
        >
            <video src={url} controls className="w-full h-full object-cover" />
        </div>
    );
};

export default function Post({ post, viewMode, imageSize }) {
    const { data } = post;

    // Handle gallery posts
    if (data.is_gallery) {
        const galleryImages = data.gallery_data?.items
            ?.map((item) => {
                const imageId = item.media_id;
                return (
                    data.media_metadata?.[imageId]?.s?.u ||
                    data.media_metadata?.[imageId]?.p?.[0]?.u
                );
            })
            .filter(Boolean);

        if (galleryImages && galleryImages.length > 0) {
            return (
                <Thumbnail
                    url={galleryImages[0]}
                    title={data.title}
                    viewMode={viewMode}
                    imageSize={imageSize}
                    post={post}
                />
            );
        }
    }

    // Get the URL from either the direct URL or preview images
    const url = data.url || data.preview?.images?.[0]?.source?.url;
    const title = data.title;

    if (!url) {
        console.log("Post missing URL:", {
            id: data.id,
            title: data.title,
            post_hint: data.post_hint,
            is_video: data.is_video,
            is_gallery: data.is_gallery,
            has_preview: !!data.preview,
        });
        return null; // Skip rendering if no valid URL
    }

    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
    const isRedditVideo = data.is_video || data.media?.reddit_video;

    const renderMedia = () => {
        if (isYouTube) {
            return (
                <YouTubeEmbed
                    url={url}
                    viewMode={viewMode}
                    imageSize={imageSize}
                />
            );
        }
        if (isRedditVideo) {
            return (
                <RedditVideo
                    url={url}
                    viewMode={viewMode}
                    imageSize={imageSize}
                />
            );
        }
        return (
            <Thumbnail
                url={url}
                title={title}
                viewMode={viewMode}
                imageSize={imageSize}
                post={post}
            />
        );
    };

    if (viewMode === "list") {
        return (
            <div className="flex gap-4 items-center">
                {renderMedia()}
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold mb-1 truncate">
                        {title}
                    </h2>
                    <div className="text-sm text-base-content/70">
                        <span>Score: {data.score}</span>
                        <span className="mx-2">•</span>
                        <span>Comments: {data.num_comments}</span>
                    </div>
                </div>
            </div>
        );
    }

    return renderMedia();
}
