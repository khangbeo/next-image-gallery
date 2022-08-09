import Post from "./Post";

const Posts = ({ posts }) => {
  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
      {posts.map((post, index) => (
        // change id to a better id
        <Post key={index} post={post.data} />
      ))}
    </div>
  );
};

export default Posts;
