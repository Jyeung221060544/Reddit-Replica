import React, { useContext, useState, useEffect } from "react";
import { countPostComments, findCommunity, findFlair, getTimeAgo, arrayOfPostComments, countCommentDepth, useParsedCommentContent, useParsedPostContent, loginRestrictionError, canVote } from "../helperFunctions";
import { PhredditContext } from "./context";
import axios from 'axios';

function PostPageView() {
  const {
    postState: { post },
    showPageFunctions: { currentPage }
  } = useContext(PhredditContext);

    if (!post) return null;
    return (
        <div className="container main" id="post-page" style={{ display: currentPage === 'post' ? 'block' : 'none'}}>
            <PostBanner />
            <PostComments />
        </div>
    );
    
}

function PostBanner() {
  const {
    postState: { post, setPosts },
    commentState: { comments, commentIDs },
    communityState: { communities },
    flairState: { linkFlairs, linkFlairIDs },
    showPageFunctions: { showCreateCommentPage, showPost },
    loginState: { login },
    userState: { user }
  } = useContext(PhredditContext);
  // console.log(post);
  const [votes, setVotes] = useState(post?.votes);
  useEffect(() => {
    setVotes(post.votes);
  }, [post._id, post.votes]);
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const userCanVote = canVote(user);
  const repUser = post.postedBy;

  const cannotVoteRestriction = () => {
    if(user===null) {
      window.alert("Please log in to vote. Click Phreddit logo for login options.")
    } else {
      window.alert("Reputation too low! You cannot vote.")
    } 
  }

  useEffect(() => {
    if (!user) {
      setUpvoted(false);
      setDownvoted(false);
      return;
    }
    if (user.upvotedPosts.includes(post._id)) {
      setUpvoted(true);
      setDownvoted(false);
    } else if (user.downvotedPosts.includes(post._id)) {
      setDownvoted(true);
      setUpvoted(false);
    } else {
      setUpvoted(false);
      setDownvoted(false);
    }
  }, [post._id, user, user?.upvotedPosts.length, user?.downvotedPosts.length]);

  const upvote = () => {
    let updatedVotes = votes;
    let direction = 0;
  
    if (upvoted) {
      updatedVotes -= 1;
      setUpvoted(false);
      direction = -5;
      user.upvotedPosts.splice(user.upvotedPosts.indexOf(post._id), 1);
    } else if (downvoted) {
      updatedVotes += 2;
      setUpvoted(true);
      setDownvoted(false);
      direction = 15;
      user.downvotedPosts.splice(user.downvotedPosts.indexOf(post._id), 1);
      user.upvotedPosts.push(post._id);
    } else {
      updatedVotes += 1;
      setUpvoted(true);
      direction = 5;
      user.upvotedPosts.push(post._id);
      console.log("Upvote --> Prep update");
      console.log("Upvoted? " + upvoted);
    }
    console.log("Before server called: Upvoted? " + upvoted);
    console.log("Call to Update Server");
    setVotes(updatedVotes);
    console.log("After server called: Upvoted? " + upvoted);
    updateVotes(post, repUser, updatedVotes, direction);
    
  };
  
  const downvote = () => {
    let updatedVotes = votes;
    let direction = 0;
  
    if (downvoted) {
      updatedVotes += 1;
      setDownvoted(false);
      direction = 10;
      user.downvotedPosts.splice(user.downvotedPosts.indexOf(post._id), 1);
      // console.log(user.downvotedComments);
    } else if (upvoted) {
      updatedVotes -= 2;
      setDownvoted(true);
      setUpvoted(false);
      direction = -15;
      user.upvotedPosts.splice(user.upvotedPosts.indexOf(post._id), 1);
      user.downvotedPosts.push(post._id);
      // console.log(user.downvotedComments);
    } else {
      updatedVotes -= 1;
      setDownvoted(true);
      direction = -10;
      user.downvotedPosts.push(post._id);
      // console.log(user.downvotedComments);
    }
  
    setVotes(updatedVotes);
    updateVotes(post, repUser, updatedVotes, direction);
  };
  
  const updateVotes = async (post, repUser, newVotes, direction) => {
    console.log("Update Server");
    await axios.post("http://127.0.0.1:8000/posts/updateVotes", {
      repUserID: repUser._id,
      direction: direction,
      votes: newVotes,
      postID: post._id,
      userUpVotes: user.upvotedPosts,
      userDownVotes: user.downvotedPosts,
      userID: user._id
    });
    const response = await axios.get(`http://127.0.0.1:8000/posts/${post._id}`);
    const updatedPost = response.data;
    const postArrayRes = await axios.get("http://127.0.0.1:8000/get/posts");
    setPosts(postArrayRes.data);
    // console.log(updatedPost);
    showPost(updatedPost);
  };

  const postCommunity = findCommunity(post, communities);
    const flair = findFlair(post, linkFlairs, linkFlairIDs);
    const commentCount = countPostComments(post, commentIDs, comments);
    const addComment = () => {
      showCreateCommentPage(post, post);
    }
    const parsedPost = useParsedPostContent(post.content);

    return (
        <div className="container" id="post-banner">
            <p className="post-banner">{postCommunity} | {getTimeAgo(post.postedDate)}</p>
            <p className="post-content">Posted by: {post.postedBy?.displayName}</p>
            <h2 className="post-title">{post.title}</h2>
            {flair && <p className="post-flair">{flair.content}</p>}
            <p className="post-content">{parsedPost}</p>
            <p className="post-views-comments">Views: {post.views} | Comments: {commentCount} | Votes: {votes} </p>
            <div id="post-interact">
              <button id="add-comment" style = {{paddingRight:"10px", display: login? 'block' : 'none'}} onClick={login===true?addComment:loginRestrictionError}>
                  Add a Comment
              </button>
              <i className="material-icons" style={{ cursor: "pointer", width: "25px", height: "25px", fontSize: "25px", color:upvoted?"#FF4500":"gray", display: login? 'block' : 'none' }} onClick={userCanVote?upvote:cannotVoteRestriction}>arrow_circle_up</i>
              <p className="reply-button" style={{ paddingLeft:"5px",paddingRight:"10px", display: login? 'block' : 'none'}} >{votes}</p>
              <i className="material-icons" style={{ cursor: "pointer", width: "25px", height: "25px", fontSize: "25px", color:downvoted?"#FF4500":"gray", display: login? 'block' : 'none' }} onClick={userCanVote?downvote:cannotVoteRestriction}>arrow_circle_down</i>
            </div>

            <div className="divider-container">
                <div className="post-divider"></div>
            </div>
            <h3 className="subsection-heading">Comments</h3>
        </div>
    );
}

function PostComments() {
  const {
    postState: { post },
    commentState: { comments, commentIDs },
  } = useContext(PhredditContext);
  if (!post || !post.commentIDs || !comments) {
      console.log("PostComments: No post or comments found", post);
      return null; // Prevents crashing if post or comments are missing
    }
  
    // Get all nested comments related to this post
    const postComments = arrayOfPostComments(post, comments, commentIDs);
    // console.log(postComments);
    
    return (
      <div className="container" id="post-comments">
        {postComments.filter(c => c && c._id).map((comment) => (
          <Comment 
            key={comment?._id} 
            comment={comment} 
            depth={countCommentDepth(comment, postComments)}
            
          />
        ))}
      </div>
    );
}

function Comment({comment, depth}) {
  const [votes, setVotes] = useState(comment?.votes);
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const {
    postState: { post },
    showPageFunctions: { showCreateCommentPage },
    loginState: { login },
    userState: { user }
  } = useContext(PhredditContext);

  useEffect(() => {
    // console.log("UseEffect Called");
    if (!user) {
      setUpvoted(false);
      setDownvoted(false);
      return;
    }
    if (user.upvotedComments.includes(comment?._id)) {
      setUpvoted(true);
      setDownvoted(false);
    } else if (user.downvotedComments.includes(comment?._id)) {
      setDownvoted(true);
      setUpvoted(false);
    } else {
      setUpvoted(false);
      setDownvoted(false);
    }
    // console.log("Upvoted? " + upvoted)
  }, [comment._id, user, user?.upvotedComments.length, user?.downvotedComments.length]);

  const userCanVote = canVote(user);
  const repUser = comment.commentedBy;

  const reply = () => {
    showCreateCommentPage(comment, post)
  }

  const cannotVoteRestriction = () => {
    if(user===null) {
      window.alert("Please log in to vote. Click Phreddit logo for login options.")
    } else {
      window.alert("Reputation too low! You cannot vote.")
    } 
  }

  const upvote = () => {
    let updatedVotes = votes;
    let direction = 0;
  
    if (upvoted) {
      updatedVotes -= 1;
      setUpvoted(false);
      direction = -5;
      user.upvotedComments.splice(user.upvotedComments.indexOf(comment?._id), 1);
      // console.log(user.upvotedComments);
    } else if (downvoted) {
      updatedVotes += 2;
      setUpvoted(true);
      setDownvoted(false);
      direction = 15;
      user.downvotedComments.splice(user.downvotedComments.indexOf(comment?._id), 1);
      user.upvotedComments.push(comment?._id);
      // console.log(user.upvotedComments);
    } else {
      updatedVotes += 1;
      setUpvoted(true);
      direction = 5;
      user.upvotedComments.push(comment?._id);
      // console.log("Upvote --> Prep update");
      // console.log("Upvoted? " + upvoted);
      // console.log(user.upvotedComments);
    }
    // console.log("Before server called: Upvoted? " + upvoted);
    // console.log("Call to Update Server");
    setVotes(updatedVotes);
    // console.log("After server called: Upvoted? " + upvoted);
    updateVotes(comment, repUser, updatedVotes, direction);
  };
  
  const downvote = () => {
    let updatedVotes = votes;
    let direction = 0;
  
    if (downvoted) {
      updatedVotes += 1;
      setDownvoted(false);
      direction = 10;
      user.downvotedComments.splice(user.downvotedComments.indexOf(comment?._id), 1);
      // console.log(user.downvotedComments);
    } else if (upvoted) {
      updatedVotes -= 2;
      setDownvoted(true);
      setUpvoted(false);
      direction = -15;
      user.upvotedComments.splice(user.upvotedComments.indexOf(comment?._id), 1);
      user.downvotedComments.push(comment?._id);
      // console.log(user.downvotedComments);
    } else {
      updatedVotes -= 1;
      setDownvoted(true);
      direction = -10;
      user.downvotedComments.push(comment?._id);
      // console.log(user.downvotedComments);
    }
  
    setVotes(updatedVotes);
    updateVotes(comment, repUser, updatedVotes, direction);
  };
  
  const updateVotes = async (comment, repUser, newVotes, direction) => {
    console.log("Update Server");
    await axios.post("http://127.0.0.1:8000/comments/updateVotes", {
      repUserID: repUser._id,
      direction: direction,
      votes: newVotes,
      commentID: comment?._id,
      userUpVotes: user.upvotedComments,
      userDownVotes: user.downvotedComments,
      userID: user._id
    });
  };

  const parsedComment = useParsedCommentContent(comment.content);
  return (
    <div className="post-comment" id={comment?._id} style={{flexDirection: "column",marginLeft: `${depth * 30 + 10}px`}}>
      <p className="post-comment-banner">{comment.commentedBy?.displayName} | {getTimeAgo(comment.commentedDate)}</p>
      <p className="post-comment-content">{parsedComment}</p>
      <div id="comment-interact">
        <p className="reply-button" style={{ cursor: "pointer", paddingRight:"10px", display: login? 'block' : 'none'}} onClick={login===true?reply:loginRestrictionError}>Reply</p>
        <i className="material-icons" style={{ cursor: "pointer", width: "25px", height: "25px", fontSize: "25px", color:upvoted?"#FF4500":"gray", display: login? 'block' : 'none' }} onClick={userCanVote?upvote:cannotVoteRestriction}>arrow_circle_up</i>
        <p className="reply-button" style={{ paddingLeft:"5px",paddingRight:"10px"}} >{login? votes : 'Votes: ' + votes}</p>
        <i className="material-icons" style={{ cursor: "pointer", width: "25px", height: "25px", fontSize: "25px", color:downvoted?"#FF4500":"gray", display: login? 'block' : 'none' }} onClick={userCanVote?downvote:cannotVoteRestriction}>arrow_circle_down</i>
      </div>
    </div>
  );
}
  


export { PostPageView };