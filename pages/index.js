import { useState } from "react";
import Posts from "../components/Posts";
import Link from "next/link";
import Footer from '../components/Footer'
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
      <Footer />
    </div>
  );
}
