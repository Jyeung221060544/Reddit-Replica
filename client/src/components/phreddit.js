import {useState, useEffect} from 'react';
import { Banner } from './banner.js';
import { NavBar } from './nav.js';
import { HomePageView } from './homePageView.js'
import { SearchPageView } from './searchPageView.js'
import { CommunityPageView } from './communityPageView.js'
import { PostPageView } from './postPageView.js'
import { CreatePostPageView } from './createPostPageView.js'
import { CreateCommunityPageView } from './createCommunityPageView.js';
import { CreateCommentPageView } from './createCommentPageView.js';
import { arrayOfPostCommentsTime } from "../helperFunctions.js";
import { PhredditContext, UserContext } from "./context";
import { LoginPageView } from './loginPageView.js';
import { RegisterPageView } from './registerPageView.js';
import { WelcomePageView } from './welcomePageView.js';
import { UserProfilePageView } from './userProfilePageView.js';
import { EditComment } from './editComment.js';
import { EditCommunity } from './editCommunity.js';
import { EditPost } from './editPost.js';
import api from '../api';


async function fetchData(setPosts, setCommunities, setComments, setLinkFlairs, setUsers) {
  try {
    const [postsRes, communitiesRes, commentsRes, flairsRes, usersRes] = await Promise.all([
      api.get("/get/posts"),
      api.get("/get/communities"),
      api.get("/get/comments"),
      api.get("/get/linkflairs"),
      api.get("/get/users"),
    ]);

    setPosts(postsRes.data);
    setCommunities(communitiesRes.data);
    setComments(commentsRes.data);
    setLinkFlairs(flairsRes.data);
    setUsers(usersRes.data);
  } catch (err) {
    console.error("One or more fetches failed:", err);
  }
}

export default function Phreddit() {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [postIDs, setPostIDs] = useState([]);
  const [newestPosts, setNewestPosts] = useState([]);
  const [oldestPosts, setOldestPosts] = useState([]);
  const [activePosts, setActivePosts] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [linkFlairIDs, setLinkFlairIDs] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentIDs, setCommentIDs] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [login, setLogin] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [editComment, setEditComment] = useState(null);
  const [editCommunity, setEditCommunity] = useState(null);
  const [editUser, setEditUser] = useState(false);
  const [listing, setListing] = useState('post');
  const [storeAdmin, setStoreAdmin] = useState(null);

    
  

  // Functions to switch pages
  const [currentPage, setCurrentPage] = useState('welcome-page'); // Default page
  const handleShowHomePage = () => setCurrentPage('home');
  const handleShowCreateCommunityPage = () => setCurrentPage('create-community');
  const handleShowCreatePostPage = () => setCurrentPage('create-post');
  const handleShowPostPage = () => setCurrentPage('post');
  const handleShowCommunityPage = () => setCurrentPage('community');
  const handleShowCreateCommentPage = () => setCurrentPage('create-comment');
  const handleShowSearchPage = () => setCurrentPage('search');
  const handleShowWelcomePage = () => setCurrentPage('welcome-page')
  const handleShowLoginPage = () => setCurrentPage('login-page')
  const handleShowRegisterPage = () => setCurrentPage('register-page');
  const handleShowUserProfilePage = () => setCurrentPage('user-profile');
  const handleShowEditCommentPage = () => setCurrentPage('edit-comment');
  const handleShowEditPostPage = () => setCurrentPage('edit-post');
  const handleShowEditCommunityPage = () => setCurrentPage('edit-community');



  // Post States
  const[post, setPost] = useState(null);
  const showPost = async (post) => {
    if (!post) return;
    post.views++;
    // console.log(post);
    await api.post("/updateViews", {
      views: post.views,
      postID: post._id
    });
    setPost({...post});
    handleShowPostPage();
  }

  // Community States
  const [community, setCommunity] = useState(null); 
  const showCommunityPage = (community) => {
    if(!community) return;
    setCommunity({...community});
    handleShowCommunityPage();
  };



  // Comment States
  const [comment, setComment] = useState(null); 
  const showCreateCommentPage = (comment, post) => {
    if(!comment) return;
    setPost({...post});
    setComment({...comment});
    handleShowCreateCommentPage();
  };

  // Search State
  const [searchArray, setSearchArray] = useState([]); 
  const [searchValue, setSearchValue] = useState('');
  const showSearchPage = (searchArray, input) => {
    setSearchArray(searchArray);
    setSearchValue(input);
    handleShowSearchPage();
  };

  const [user, setUser] = useState(null); 
  


  useEffect(() => {
    fetchData(setPosts, setCommunities, setComments, setLinkFlairs, setUsers);
  }, [refreshTrigger, currentPage]);
  
  useEffect(() => {
    // Only run this once data is fetched
    if (posts.length && comments.length && linkFlairs.length && communities.length) {
      console.log("posts:", posts);
      console.log("communities:", communities);
      console.log("linkFlairs:", linkFlairs);
      console.log("comments:", comments);
  
      setPostIDs(posts.map(post => post._id));
      setNewestPosts([...posts].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate)));
      setOldestPosts([...posts].sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate)));
      setLinkFlairIDs(linkFlairs.map(flair => flair._id));
      setCommentIDs(comments.map(comment => comment._id));
  
      const activePostsSorted = [...posts].sort((a, b) => {
        let postComments1 = arrayOfPostCommentsTime(a, comments, comments.map(c => c.commentID || c._id));
        let newestComment1 = Math.max(...postComments1, 0);
  
        let postComments2 = arrayOfPostCommentsTime(b, comments, comments.map(c => c.commentID || c._id));
        let newestComment2 = Math.max(...postComments2, 0);
  
        return newestComment2 - newestComment1;
      });
  
      setActivePosts(activePostsSorted);
    }
  }, [posts, comments, linkFlairs, communities]);
  
  return (
    <PhredditContext.Provider value={{
      postState: {
        posts, 
        setPosts, 
        postIDs, 
        newestPosts, 
        oldestPosts, 
        activePosts, 
        post, setPost, 
        setActivePosts, 
        setOldestPosts, 
        setNewestPosts, 
        setPostIDs },
      commentState: {comments, setComments, commentIDs, comment, setComment, setCommentIDs},
      communityState: {communities, setCommunities, community, setCommunity},
      flairState: {linkFlairs, linkFlairIDs, setLinkFlairs, setLinkFlairIDs},
      showPageFunctions: {
        currentPage, 
        setCurrentPage, 
        handleShowHomePage, 
        handleShowCreateCommunityPage, 
        handleShowCreatePostPage, 
        handleShowPostPage, 
        showPost, 
        showCreateCommentPage, 
        showCommunityPage, 
        showSearchPage, 
        handleShowWelcomePage, 
        handleShowRegisterPage, 
        handleShowLoginPage,
        handleShowUserProfilePage,
        handleShowEditCommentPage,
        handleShowEditCommunityPage,
        handleShowEditPostPage
      },
      searchState: {searchArray, setSearchArray, searchValue, setSearchValue},
      refreshControl: { setRefreshTrigger },
      loginState: {login, setLogin},
      userState: {users, setUsers, user, setUser, storeAdmin, setStoreAdmin},
      editState: {listing, setListing, editPost, setEditPost, editComment, setEditComment, editCommunity, setEditCommunity, editUser, setEditUser}
    }}>
      <Banner />
      <div className="container page" style={{display: 'flex',  width: '100%', height: '90%'}}>
        <NavBar />
        <HomePageView />
        <SearchPageView />
        <CommunityPageView />
        <CreateCommunityPageView/>
        <PostPageView />
        <CreatePostPageView />
        <CreateCommentPageView />
        <WelcomePageView />
        <LoginPageView/>
        <RegisterPageView/>
        <UserProfilePageView/>
        <EditComment/>
        <EditCommunity/>
        <EditPost/>
      </div>
    </PhredditContext.Provider>
  );
}