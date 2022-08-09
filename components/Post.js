// import Image from 'next/image'

const Thumbnail = ({ post }) => {
  const { url, thumbnail_width, thumbnail_height, title } = post;
  return <img src={url} alt={title} />;
};

const YoutubeEmbed = ({ post }) => {
  const {
    secure_media: {
      oembed: { thumbnail_url, thumbnail_height, thumbnail_width },
    },
  } = post;
  return <iframe className="h-full" src={thumbnail_url}></iframe>;
};

const RedditVideo = ({ post }) => {
  const {
    secure_media: {
      reddit_video: { fallback_url },
    },
  } = post;
  return (
    <video className="h-full" autoPlay={true} controls alt={post.title}>
      <source src={fallback_url} type="video/mp4" />
    </video>
  );
};

const Post = ({ post }) => {
  let base_url = "https://reddit.com";

  function isImage(url) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  function isYoutube(url) {
    return /^(?:https?:\/\/)?(?:(?:www\.)?youtube.com\/watch\?v=|youtu.be\/)(\w+)$/.test(
      url
    );
  }

  function isRedditVideo(url) {
    return /^(?:https?:\/\/)?(?:(?:v\.)?redd.it\/)/.test(url);
  }

  function isMedia(url) {
    return !isImage(url) && !isRedditVideo(url) && !isYoutube(url);
  }

  if (isYoutube(post.url)) {
    console.log(post);
  }

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
    !isMedia(post.url) && (
      <article className="card card-compact w-72 bg-neutral shadow-xl">
        <a href={base_url + post.permalink} target="_blank" rel="noreferrer">
          <div className="h-96 overflow-hidden">
            {isImage(post.url) && <Thumbnail post={post} />}
            {isYoutube(post.url) && <YoutubeEmbed post={post} />}
            {isRedditVideo(post.url) && <RedditVideo post={post} />}
          </div>
          <div className="card-body">
            <h2 className="card-title text-base">{post.title}</h2>
          </div>
        </a>
      </article>
    )
  );
};

export default Post;
