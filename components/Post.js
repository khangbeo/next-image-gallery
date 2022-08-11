const Thumbnail = ({ post }) => {
  const { url, title } = post;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} className="h-full w-full object-contain" alt={title} />
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
      className="h-full w-full"
      height="315"
      width="560"
      src={`${newUrl}&autoplay=1`}
    ></iframe>
  );
};

const RedditVideo = ({ post }) => {
  console.log(post);
  return (
    <video className="h-full w-full" autoPlay={true} controls alt={post.title}>
      <source
        src={post.secure_media?.reddit_video.fallback_url}
        type="video/mp4"
      />
    </video>
  );
};

const Post = ({ post }) => {
  let base_url = "https://reddit.com";

  function isImage(url) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg|gfycat)$/.test(url);
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
      <article className="card card-compact w-72 sm:w-96 bg-neutral shadow-xl">
        <a href={base_url + post.permalink} target="_blank" rel="noreferrer">
          <div className="h-80 overflow-hidden ">
            {isImage(post.url) && <Thumbnail post={post} />}
            {isYoutube(post.url) && <YoutubeEmbed post={post} />}
            {isRedditVideo(post.url) && <RedditVideo post={post} />}
          </div>
        </a>
        <div className="card-body bg-[#863958]">
          <h2 className="card-title text-neutral-content font-light">
            {post.title}
          </h2>
        </div>
      </article>
    )
  );
};

export default Post;
