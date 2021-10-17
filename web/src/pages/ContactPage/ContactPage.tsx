import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const ContactPage = () => {
  return (
    <>
      <MetaTags
        title="Contact"
        // description="Contact description"
        /* you should un-comment description and add a unique description, 155 characters or less
        You can look at this documentation for best practices : https://developers.google.com/search/docs/advanced/appearance/good-titles-snippets */
      />
      <h1>ContactPage</h1>
      <p>
        Find me in <code>./web/src/pages/ContactPage/ContactPage.tsx</code>
      </p>
      <p>
        My default route is named <code>contact</code>, link to me with `
        <Link to={routes.contact()}>Contact</Link>`
      </p>
    </>
  )
}

export default ContactPage
