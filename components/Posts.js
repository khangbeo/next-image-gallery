import Post from "./Post";

const Posts = ({ posts }) => {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 w-full">
      {posts.map((post, index) => (
        // change id to a better id
        <Post key={index} post={post.data} />
      ))}
    </div>
  );
};

export default Posts;
