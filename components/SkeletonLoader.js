export default function SkeletonLoader({ viewMode, imageSize }) {
    const gridClasses = {
        small: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
        medium: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        large: "grid-cols-2 sm:grid-cols-3",
    };

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

    const skeletonItems = Array(12).fill(null);

    if (viewMode === "list") {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col gap-4">
                    {skeletonItems.map((_, index) => (
                        <div
                            key={index}
                            className="w-full bg-base-200 rounded-lg p-4"
                        >
                            <div className="flex gap-4 items-center">
                                <div
                                    className={`skeleton ${listClasses[imageSize]} rounded-lg`}
                                />
                                <div className="flex-1 space-y-2">
                                    <div className="skeleton h-6 w-3/4" />
                                    <div className="skeleton h-4 w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className={`grid ${gridClasses[imageSize]} gap-4`}>
                {skeletonItems.map((_, index) => (
                    <div
                        key={index}
                        className="w-full aspect-square bg-base-200 rounded-lg"
                    >
                        <div
                            className={`skeleton ${sizeClasses[imageSize]} rounded-lg`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
