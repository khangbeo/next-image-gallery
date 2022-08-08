// import Image from 'next/image'

const Thumbnail = ({ post }) => {
  const { url, thumbnail_width, thumbnail_height, title } = post;
  return (
    <img
      src={url}
      width={thumbnail_width}
      height={thumbnail_height}
      alt={title}
    />
  );
};

const YoutubeEmbed = ({ post }) => {
  const {
    secure_media: {
      oembed: { thumbnail_url, thumbnail_height, thumbnail_width, title },
    },
  } = post;
  return (
    <img
      src={thumbnail_url}
      width={post.thumbnail_width}
      height={post.thumbnail_height}
      alt={title}
    />
  );
};
const Post = ({ post }) => {
  let base_url = "https://reddit.com";

  function isImage(url) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  // function isYoutube(url) {
  //   return /^(?:https?:\/\/)?(?:(?:www\.)?youtube.com\/watch\?v=|youtu.be\/)(\w+)$/.test(
  //     url
  //   );
  // }
  // if (isImage(post.url)) {
  //   console.log(post);
  // }

  /** make a clickable post
   *
   * Data to get:
   * title
   * thumbnail
   * url
   * votes
   * author
   *
   */

  return (
    <article>
      {isImage(post.url) && (
        <a href={base_url + post.permalink} target="_blank" rel="noreferrer">
          <h3>{post.title}</h3>
          <Thumbnail post={post} />
        </a>
      )}
    </article>
  );
};

export default Post;
