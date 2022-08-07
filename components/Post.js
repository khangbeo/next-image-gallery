// import Image from 'next/image'

const Thumbnail = ({ post }) => {
  return <img src={post.url} alt={post.title} />;
};
const Post = ({ post }) => {
  let base_url = "https://reddit.com";

  /** make a clickable post
   *
   * Data to get:
   * title
   * thumbnail
   * url
   * created_at
   * author maybe?
   * likes
   *
   */
  return (
    <article>
      <a href={base_url + post.permalink} target="_blank" rel="noreferrer">
        <h3>{post.title}</h3>
        {post.url ? <Thumbnail post={post} /> : null}
      </a>
    </article>
  );
};

export default Post;
