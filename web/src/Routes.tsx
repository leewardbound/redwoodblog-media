// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Router, Route, Set, Private } from '@redwoodjs/router'
import FilesLayout from 'src/layouts/User/FilesLayout'
import PostsLayout from 'src/layouts/User/PostsLayout'
import BlogLayout from 'src/layouts/BlogLayout/BlogLayout'

const Routes = () => {
  return (
    <Router>
      <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />
      <Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" />
      <Route path="/login" page={LoginPage} name="login" />
      <Route path="/signup" page={SignupPage} name="signup" />
      <Private unauthenticated="home">
        <Set wrap={PostsLayout}>
          <Route path="/user/posts/new" page={UserPostNewPostPage} name="userNewPost" />
          <Route path="/user/posts/{id:Int}/edit" page={UserPostEditPostPage} name="userEditPost" />
          <Route path="/user/posts/{id:Int}" page={UserPostPostPage} name="userPost" />
          <Route path="/user/posts" page={UserPostPostsPage} name="userPosts" />
        </Set>
        <Set wrap={FilesLayout}>
          <Route path="/user/files/new" page={UserFileNewFilePage} name="userNewFile" />
          <Route path="/user/files/{id}/edit" page={UserFileEditFilePage} name="userEditFile" />
          <Route path="/user/files/{id}" page={UserFileFilePage} name="userFile" />
          <Route path="/user/files" page={UserFileFilesPage} name="userFiles" />
        </Set>
      </Private>
      <Route path="/contact" page={ContactPage} name="contact" />
      <Set wrap={BlogLayout}>
        <Route path="/" page={HomePage} name="home" />
        <Route path="/about" page={AboutPage} name="about" />
      </Set>
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
