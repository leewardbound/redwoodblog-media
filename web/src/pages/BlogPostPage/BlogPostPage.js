import { MetaTags } from '@redwoodjs/web'
import BlogPostCell from 'src/components/BlogPostCell'

const BlogPostPage = ({ id }) => {
  return (
    <>
      <MetaTags
        title="BlogPost"
        // description="BlogPost description"
        /* you should un-comment description and add a unique description, 155 characters or less
      You can look at this documentation for best practices : https://developers.google.com/search/docs/advanced/appearance/good-titles-snippets */
      />
      <BlogPostCell id={id} />
    </>
  )
}

export default BlogPostPage
