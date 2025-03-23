import { useEffect, useState } from "react";

export default function ImageModal({ url, title, onClose, post }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [galleryImages, setGalleryImages] = useState([]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    useEffect(() => {
        if (post?.data?.is_gallery) {
            const images =
                post.data.gallery_data?.items
                    ?.map((item) => {
                        const imageId = item.media_id;
                        return (
                            post.data.media_metadata?.[imageId]?.s?.u ||
                            post.data.media_metadata?.[imageId]?.p?.[0]?.u
                        );
                    })
                    .filter(Boolean) || [];
            setGalleryImages(images);
        }
    }, [post]);

    const handlePrevious = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? galleryImages.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setCurrentImageIndex((prev) =>
            prev === galleryImages.length - 1 ? 0 : prev + 1
        );
    };

    const displayUrl = post?.data?.is_gallery
        ? galleryImages[currentImageIndex]
        : url;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">{title}</h2>

                    <div className="relative aspect-video mb-4">
                        <img
                            src={displayUrl}
                            alt={title}
                            className="w-full h-full object-contain"
                        />
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 btn btn-circle btn-ghost text-white bg-black bg-opacity-50 hover:bg-opacity-75"
                        >
                            ✕
                        </button>
                        {post?.data?.is_gallery && galleryImages.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevious}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost text-white bg-black bg-opacity-50 hover:bg-opacity-75"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-ghost text-white bg-black bg-opacity-50 hover:bg-opacity-75"
                                >
                                    →
                                </button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                                    {currentImageIndex + 1} /{" "}
                                    {galleryImages.length}
                                </div>
                            </>
                        )}
                    </div>

                    {post && (
                        <>
                            <div className="flex justify-between items-center text-sm text-base-content/70 mb-4">
                                <div>
                                    Posted by u/{post.data.author} •{" "}
                                    {new Date(
                                        post.data.created_utc * 1000
                                    ).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>↑ {post.data.score}</span>
                                    <span>💬 {post.data.num_comments}</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <a
                                    href={`https://reddit.com${post.data.permalink}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary btn-block"
                                >
                                    View on Reddit
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
