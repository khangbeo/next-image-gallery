import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Navbar({
    category,
    filterItem,
    query,
    handleSubmit,
    handleChange,
    subreddit,
    onReset,
    viewMode,
    setViewMode,
    imageSize,
    setImageSize,
}) {
    const router = useRouter();
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/r/${query.trim()}/hot`);
        }
    };

    return (
        <div className="navbar bg-base-100 shadow-md sticky top-0 z-50">
            <div className="navbar-start">
                <div className="dropdown">
                    <label tabIndex={0} className="btn btn-ghost lg:hidden">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h8m-8 6h16"
                            />
                        </svg>
                    </label>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        <li>
                            <button
                                className={category === "hot" ? "active" : ""}
                                onClick={() => filterItem("hot")}
                            >
                                Hot
                            </button>
                        </li>
                        <li>
                            <button
                                className={category === "top" ? "active" : ""}
                                onClick={() => filterItem("top")}
                            >
                                Top
                            </button>
                        </li>
                        <li>
                            <button
                                className={category === "new" ? "active" : ""}
                                onClick={() => filterItem("new")}
                            >
                                New
                            </button>
                        </li>
                        <li>
                            <button
                                className={
                                    category === "rising" ? "active" : ""
                                }
                                onClick={() => filterItem("rising")}
                            >
                                Rising
                            </button>
                        </li>
                    </ul>
                </div>
                <a
                    className="btn btn-ghost normal-case text-xl hidden lg:flex items-center h-full"
                    onClick={() => router.push("/")}
                >
                    Reddit Gallery
                </a>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li>
                        <button
                            className={category === "hot" ? "active" : ""}
                            onClick={() => filterItem("hot")}
                        >
                            Hot
                        </button>
                    </li>
                    <li>
                        <button
                            className={category === "top" ? "active" : ""}
                            onClick={() => filterItem("top")}
                        >
                            Top
                        </button>
                    </li>
                    <li>
                        <button
                            className={category === "new" ? "active" : ""}
                            onClick={() => filterItem("new")}
                        >
                            New
                        </button>
                    </li>
                    <li>
                        <button
                            className={category === "rising" ? "active" : ""}
                            onClick={() => filterItem("rising")}
                        >
                            Rising
                        </button>
                    </li>
                </ul>
            </div>
            <div className="flex-1 flex items-center gap-2">
                <form onSubmit={handleFormSubmit} className="flex-1">
                    <input
                        type="text"
                        placeholder="Enter subreddit..."
                        className="input input-bordered w-full text-base md:text-lg"
                        value={query}
                        onChange={handleChange}
                    />
                </form>
                <div className="flex items-center gap-2 shrink-0">
                    <div className="dropdown dropdown-end">
                        <label
                            tabIndex={0}
                            className="btn btn-ghost btn-circle"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                />
                            </svg>
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                            <li>
                                <button
                                    className={
                                        viewMode === "grid" ? "active" : ""
                                    }
                                    onClick={() => setViewMode("grid")}
                                >
                                    Grid View
                                </button>
                            </li>
                            <li>
                                <button
                                    className={
                                        viewMode === "list" ? "active" : ""
                                    }
                                    onClick={() => setViewMode("list")}
                                >
                                    List View
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="dropdown dropdown-end">
                        <label
                            tabIndex={0}
                            className="btn btn-ghost btn-circle"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                />
                            </svg>
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                            <li>
                                <button
                                    className={
                                        imageSize === "small" ? "active" : ""
                                    }
                                    onClick={() => setImageSize("small")}
                                >
                                    Small
                                </button>
                            </li>
                            <li>
                                <button
                                    className={
                                        imageSize === "medium" ? "active" : ""
                                    }
                                    onClick={() => setImageSize("medium")}
                                >
                                    Medium
                                </button>
                            </li>
                            <li>
                                <button
                                    className={
                                        imageSize === "large" ? "active" : ""
                                    }
                                    onClick={() => setImageSize("large")}
                                >
                                    Large
                                </button>
                            </li>
                        </ul>
                    </div>
                    <button
                        className="btn btn-ghost btn-circle"
                        onClick={toggleTheme}
                    >
                        {theme === "light" ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                        )}
                    </button>
                    {subreddit && (
                        <button
                            className="btn btn-ghost btn-circle"
                            onClick={onReset}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
