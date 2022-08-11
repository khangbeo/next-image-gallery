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
    <iframe height="315" width="560" src={`${newUrl}&autoplay=1`}></iframe>
  );
};

const RedditVideo = ({ post }) => {
  return (
    <video autoPlay={true} controls alt={post.title}>
      <source
        className="w-full h-full"
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
      <article className="card card-compact card-bordered mb-4 shadow-lg hover:shadow-2xl group transform-gpu duration-500">
        <a href={base_url + post.permalink} target="_blank" rel="noreferrer">
          {/* 

            don't really need title here, should move title to the modal

          <div className="invisible group-hover:visible delay-100 transition ease-in-out absolute top-0 left-0 right-0 px-4 py-2 bg-gray-800 opacity-90">
            <h2 className="card-title text-neutral-content font-light block truncate ...">
              {post.title}
            </h2>
          </div> */}
          <figure>
            {isImage(post.url) && <Thumbnail post={post} />}
            {isYoutube(post.url) && <YoutubeEmbed post={post} />}
            {isRedditVideo(post.url) && <RedditVideo post={post} />}
          </figure>
        </a>
      </article>
    )
  );
};

export default Post;
