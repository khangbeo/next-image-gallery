import Post from "./Post";

export default function Posts({
    posts,
    lastPostRef,
    isLoadingMore,
    viewMode,
    imageSize,
}) {
    const gridClasses = {
        small: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
        medium: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        large: "grid-cols-2 sm:grid-cols-3",
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div
                className={`${
                    viewMode === "grid"
                        ? `grid ${gridClasses[imageSize]} gap-4`
                        : "flex flex-col gap-4 max-w-3xl mx-auto"
                }`}
            >
                {posts.map((post, index) => (
                    <div
                        key={post.data.id}
                        ref={index === posts.length - 1 ? lastPostRef : null}
                        className={`${
                            viewMode === "grid"
                                ? "w-full aspect-square"
                                : "w-full bg-base-200 rounded-lg p-4"
                        }`}
                    >
                        <Post
                            post={post}
                            viewMode={viewMode}
                            imageSize={imageSize}
                        />
                    </div>
                ))}
                {isLoadingMore && (
                    <div className="col-span-full text-center py-4">
                        Loading more posts...
                    </div>
                )}
            </div>
        </div>
    );
}
