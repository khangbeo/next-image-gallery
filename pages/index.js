import { useState } from "react";
import Posts from "../components/Posts";
import Link from "next/link";
/**
 * first find out how to get data from reddit api - done
 * then make a request - done
 * how? using axios - done
 * we're only making a GET request so it'll be easy - done
 * I want a form to search for a subreddit - done
 * when the form is submitted, it will make a request to the reddit api with the form's value - done
 * then get the response and store it in the useState hook - done
 * it will have a loading, error, and actual content displayed - done
 * along with infinite scrolling/loading?
 * clicking on an image opens a modal with more detailed image
 *
 * Nice to have:
 * save the subreddit in a store and show it under the search as a recent search item
 * also have popular subreddits somewhere on the app
 *
 * TODO: move data fetching and storing logic to a custom hook
 * TODO: add context or reducer
 * TODO: clean up code and move into appropriate component
 *  need to make a function to check if subreddit/user exists,
 *  also a function to check if the search value is valid
 * TODO: fetch is returning same data for filter buttons, figure out how to clean up so we get new data on filter
 * TODO: add infinite scrolling, have an array to store initial data, then add more as the user scrolls down
 * TODO: search by user
 * TODO: add a README with makeareadme.com
 * TODO: add error handling for cases where there's no videos or images, but only text posts
 * TODO: add meaningful error messages
 * TODO: change current grid layout to masonry
 *
 */

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [subreddit, setSubreddit] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("hot");
  const [isLoading, setIsLoading] = useState(null);
  const [err, setErr] = useState(null);
  const controller = new AbortController();
  const { signal } = controller;
  const categories = ["hot", "top", "new", "best", "rising"];

  const catButtons = categories.map((cat) => (
    <button
      className={`btn text-neutral-content ${
        category === cat && "btn-active"
      } rounded-full m-2 btn-sm md:btn-md`}
      key={cat}
      onClick={() => filterItem(cat)}
    >
      {cat}
    </button>
  ));

  const filterItem = (curCat) => {
    setCategory(curCat);

    if (category) {
      setErr(null);
      getSubreddit();
    } else {
      setErr("Enter a subreddit");
    }
  };

  const getSubreddit = async () => {
    setIsLoading(true);
    try {
      const url = `https://www.reddit.com/r/${subreddit}/${category}.json?restrict_sr=true&include_over_18=on`;
      const res = await fetch(url, { signal });

      const data = await res.json();
      if (!res.ok) {
        const error = (data && data.message) || res.status;
        return Promise.reject(error);
      }
      setPosts(data.data.children);
    } catch (e) {
      setErr(`Error: ${subreddit} does not exist!`);
      console.log(`There was an error: ${e}`);
    } finally {
      setIsLoading(false);
    }
    return () => controller.abort();
  };

  const handleChange = ({ target }) => {
    setQuery(target.value);
    setSubreddit(target.value);
    setErr(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query !== "" && query.length > 0) {
      setQuery("");
      getSubreddit();
    } else {
      setErr("Enter a subreddit");
    }
  };

  return (
    <div className="bg-base-100 flex flex-col min-h-screen">
      <nav className="navbar flex flex-col md:flex-row bg-neutral justify-center w-full sticky top-0 z-10 shadow-2xl">
        <Link href="#">
          <a className="btn btn-ghost normal-case text-neutral-content text-xl rounded-full">
            Reddit Viewer
          </a>
        </Link>

        <form className="form-control w-64 sm:w-96" onSubmit={handleSubmit}>
          <input
            className="input m-2 input-bordered w-11/12 rounded-full"
            placeholder="Search subreddit"
            type="text"
            value={query}
            onChange={handleChange}
          />
        </form>

        {posts.length > 0 && <div>{catButtons}</div>}
      </nav>
      {err && (
        <span className="alert alert-error rounded-none shadow-lg">{err}</span>
      )}
      <main className="grow p-4 flex flex-column justify-center">
        {/* <div>Current Query: {query}</div>
        <div>Current Sub: {subreddit}</div>
        <div>Current Url: {url}</div>

        <div>Results</div> */}
        {isLoading ? (
          <p>loading...</p>
        ) : posts.length > 0 && !err ? (
          <Posts posts={posts} />
        ) : (
          <p className="text-6xl p-6">
            Get Images and Videos from your favorite subreddits!
          </p>
        )}
      </main>

      <footer className="flex flex-col sm:flex-row text-sm justify-between items-center p-3 bg-neutral text-neutral-content">
        <div className="flex items-center">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
            className="fill-current"
          >
            <path d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"></path>
          </svg>
          &nbsp;
          <p>Copyright © 2022 Anthony Duong - All rights reserved</p>
        </div>

        <div className="grid-flow-col">
          <Link href="https://github.com/khangbeo">
            <a className="btn" rel="noreferrer noopener" target="_blank">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </Link>
          <Link href="https://www.linkedin.com/in/anthony-duong1/">
            <a className="btn" rel="noreferrer noopener" target="_blank">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </Link>
          <Link href="mailto:khangbeo2012@gmail.com">
            <a className="btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M12 12.713l-11.985-9.713h23.971l-11.986 9.713zm-5.425-1.822l-6.575-5.329v12.501l6.575-7.172zm10.85 0l6.575 7.172v-12.501l-6.575 5.329zm-1.557 1.261l-3.868 3.135-3.868-3.135-8.11 8.848h23.956l-8.11-8.848z" />
              </svg>
            </a>
          </Link>
        </div>
      </footer>
    </div>
  );
}
