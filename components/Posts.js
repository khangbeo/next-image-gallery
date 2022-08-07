
import Post from './Post'

const Posts = ({ posts }) => {
  return (
    <div>{posts.map((post, index) => (
        // change id to a better id
        <Post key={index} post={post.data} />
    ))}</div>
  )
}

export default Posts