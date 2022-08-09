import Image from "next/image";

const Thumbnail = ({ post }) => {
  const { url, title } = post;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={title} />
  );
};

const YoutubeEmbed = ({ post }) => {
  const {
    secure_media_embed: { content },
  } = post;

  const newUrl = content.match(
    /(?:https?:\/\/)?(www.youtube.com\/embed\/)(\w+)(\?\w+\=\w+\&\w+\;\w+\=\w)/
  );
  return (
    <iframe
      className="h-full w-full object-center"
      height="315"
      width="560"
      src={`${newUrl}&autoplay=1`}
    ></iframe>
  );
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

  if (isMedia(post.url)) {
    console.log(post);
  }

  console.log(isMedia(post.url));
  /** make a clickable post - done
   *
   * Data to get:
   * title
   * thumbnail
   * url
   *
   * up votes
   * hearts/save/favorite
   * author
   * when it was created
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
        </a>
        <div className="card-body">
          <h2 className="card-title text-base">{post.title}</h2>
        </div>
      </article>
    )
  );
};

export default Post;
