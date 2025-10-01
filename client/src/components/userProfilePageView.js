import React, { useContext, useState, useEffect } from "react";
import { arrayOfPostCommentsTime, findCommunity, getTimeAgo, getPostHeadingUser, getCommentHeading, getCommunityHeading, getUserHeading, findPostOfComment } from "../helperFunctions";
import { PhredditContext } from "./context";
import ConfirmWindow from "./confirm";
import api from '../api';

function UserProfilePageView() {
    const {
        showPageFunctions:{currentPage, handleShowUserProfilePage},
        userState:{user},
        editState: {editUser, setListing}
    } = useContext(PhredditContext);

    useEffect(() => {
        if (user && editUser) {
            handleShowUserProfilePage();
            console.log("User: " + user.displayName);
            console.log("Page Changed.");
        }

    }, [user, editUser]);

    useEffect(() => {
        setListing("post");
    }, [user,currentPage]);

    return(
        <div className= "container main" style={{
            display:(currentPage==='user-profile' && user!==null)?'block':'none', width:editUser?"100%":"80%"}}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <UserInformation />
                <BackButton/>
            </div>
            <ToggleButtons/>
            <div class="divider"></div>
            <div style={{alignItems:"center"}}>
                <PostListing />
                <CommentListing />
                <CommunityListing />
                <UserListing />
            </div>
        </div>
        
    );
}

function UserInformation() {
    const {
        userState: { user }
    } = useContext(PhredditContext);

    const timeAgo = getTimeAgo(user?.startDate);
    return (
        <div className="container" id="community-content-banner">
            <div className="title" id="community-title">
                <h2> Welcome, {user?.displayName} </h2>
            </div>
            <div className="container">
                <div id="info" >
                    <p className='community-info'>Email Address:     {user?.email}</p>
                    <p className='community-info'>Member Since:      {timeAgo}</p>
                    <p className='community-info'>Reputation:        {user?.reputation}</p>
                </div>
            </div>
        </div>
    );
}

function ToggleButtons() {

    const {
        userState: { user },
        editState: { listing, setListing }
    } = useContext(PhredditContext);

    const getButtonStyle = (type) => ({
        backgroundColor: listing === type ? "#FF4500" : "lightgray",
        color: listing === type ? "white" : "black"
    });

    return (
        <div className="container" id="user-header">
          <div >
            <input id="post-button" type="button"  value="Posts" onClick={()=>{setListing("post")}} style={getButtonStyle("post")}/>
          </div>
          <div >
            <input id="community-button" type="button"  value="Communities" onClick={()=>{setListing("community")}} style={getButtonStyle("community")}/>
          </div>
          <div >
            <input id="comment-button" type="Button"  value="Comments" onClick={()=>{setListing("comment")}} style={getButtonStyle("comment")}/>
          </div>
          <div >
            <input id="user-button" type="Button"  value="Users" style={{...getButtonStyle("user"), display: user?.isAdmin ? "block" : "none"}} onClick={()=>{setListing("user")}}/>
          </div>
        </div>
    );
}

function PostListing() {
    const {
        userState: { user },
        editState: { listing }
    } = useContext(PhredditContext);
    
    const posts = user?.postIDs;

    return (
        <div className="container" style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', display:(listing==="post")?"flex":"none"}}>
            <h2 className="post-title">{user?.displayName}'s Posts</h2>
            {posts && posts.length > 0 ? (
                posts.map((post) => <PostItem key={post?._id} post={post}/>)):(<p>No posts to display.</p>)}
        </div>
    );
}

function CommunityListing() {
    const {
        userState: {user},
        editState: { listing },
        communityState: {communities}
    } = useContext(PhredditContext);

    const createdCommunities = communities?.filter(c =>
        (c?.createdBy?._id || c?.createdBy) === user?._id
    );

    return (
        <div className="container" style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', display:(listing==="community")?"flex":"none"}}>
            <h2 className="post-title">{user?.displayName}'s Communities</h2>
            {createdCommunities && createdCommunities.length > 0 ? (
                createdCommunities.map((community) => (
                    <CommunityItem key={community?._id} community={community} />
                ))) : (<p>No communities to display.</p>)}
        </div>
    );
}

function CommentListing() {
    const {
        userState: {user},
        editState: { listing }
    } = useContext(PhredditContext);

    const comments = user?.commentIDs;
    return (
        <div className="container" style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', display:(listing==="comment")?"flex":"none"}}>
            <h2 className="post-title">{user?.displayName}'s Comments</h2>
            {comments && comments.length > 0 ? (
                comments.map((comment) => (
                    <CommentItem key={comment?._id} comment={comment} />))) : (<p>No comments to display.</p>)}
        </div>
    );
}

function UserListing() {
    const {
        userState: { users },
        editState: { listing }
    } = useContext(PhredditContext);


    return (
        <div className="container" style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', display:(listing==="user")?"flex":"none"}}>
            <h2 className="post-title">Users</h2>
            {users&&users.map((cUser)=>{
                return <UserItem key={cUser?._id} cUser={cUser}/>
            })}
        </div>
    );
}

function PostItem({post}) {
    const {
        communityState: {communities},
        showPageFunctions: {handleShowEditPostPage},
        editState: {setEditPost}
    }= useContext(PhredditContext);

    const community = findCommunity(post, communities);

    const clickPost = () => {
        setEditPost(post);
        // console.log("Post: " + post);
        handleShowEditPostPage();
    }

    return (
        <div className="post-container" id={`post-${post?._id}`} onClick={clickPost} >
        <div className="post">
            <div>
                {getPostHeadingUser(post,community)}
            </div>
            <h2 className="post-title">{post?.title}</h2>
            <p className="post-content">{post?.content.substring(0, 80)}</p>
        </div>
        </div>
    );
}

function CommentItem({comment}) {
    //FIND POST NAME + Length 20 of Substrings
    const {
        showPageFunctions: {handleShowEditCommentPage},
        editState: {setEditComment},
        commentState: {comments},
        postState: {posts, setPost}
    }= useContext(PhredditContext);

    const preview = comment?.content.length > 20
        ? comment?.content?.substring(0, 20) + "..."
        : comment?.content;
    let postOfComment = findPostOfComment(comment, posts, comments);
    let postTitle = postOfComment?.title;
    const clickComment = () => {
        setEditComment(comment);
        console.log("Comment: " + comment);
        setPost(postOfComment);
        handleShowEditCommentPage();
    }
    return (
        <div className="post-container" id={`comment-${comment?._id}`} onClick={clickComment} >
        <div className="post">
            <div>
                {getCommentHeading(comment)}
            </div>
            <h2 className="post-title">Post: {postTitle}</h2>
            <h2 className="post-content">Comment: {preview}</h2>
        </div>
        </div>
    );
}

function CommunityItem({community}) {
    const {
        showPageFunctions: {handleShowEditCommunityPage},
        editState: {setEditCommunity}
    }= useContext(PhredditContext);

    const clickCommunity = () => {
        setEditCommunity(community);
        console.log("Community: " + community);
        handleShowEditCommunityPage();
    }
    return (
        <div className="post-container" id={`community-${community?._id}`} onClick={clickCommunity} >
        <div className="post">
            <div>
                {getCommunityHeading(community)}
            </div>
            <h2 className="post-title">{community?.name}</h2>
            <p className="post-content">{community.description}</p>
        </div>
        </div>
    );
}

function UserItem({cUser}) { 
    const {
        communityState: {setCommunities},
        postState: {setPosts, setPostIDs, setNewestPosts, setOldestPosts, setActivePosts},
        commentState: {setComments, commentIDs},
        userState : {user, setUser, storeAdmin, setStoreAdmin, setUsers}, 
        showPageFunctions: {handleShowUserProfilePage},
        editState: {setEditUser}
    } = useContext(PhredditContext);
    const [showConfirm, setShowConfirm] = useState(false);
  
    const clickUser = () => {
        if(user.isAdmin) {
            setStoreAdmin(user);
        }
        setUser(cUser);
        setEditUser(true);
    }

    const deleteUser = async (e) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/delete/user/${cUser._id}`, {
              method: "DELETE"
            });
            if (res.ok) {
                const updatedCommunities = await api.get("/get/communities");
                const updatedUsers = await api.get("/get/users");
                const updatedPosts = await api.get("/get/posts");
                const updatedComments = await api.get("/get/comments");
                setUsers(updatedUsers.data);
                setCommunities(updatedCommunities.data);
                setComments(updatedComments.data);
                const posts = updatedPosts.data;
                // console.log(posts);
                setPosts(posts);
                setPosts(posts);
                setPostIDs(posts.map(p => p._id));
                setNewestPosts([...posts].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate)));
                setOldestPosts([...posts].sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate)));
                setActivePosts([...posts].sort((a, b) => {
                    const postComments1 = arrayOfPostCommentsTime(a, a.commentIDs, commentIDs);
                    const postComments2 = arrayOfPostCommentsTime(b, b.commentIDs, commentIDs);
                    return Math.max(...postComments2, 0) - Math.max(...postComments1, 0);
                }));
            } else {
                const msg = await res.json();
                alert("Error: " + msg.error);
            }
        } catch (err) {
        console.error(err);
        alert("Failed to delete user.");
        }
    }

    if(cUser.isAdmin) {
        return null;
    }
    return (
        <>
        <div 
            className="post-container" 
            id={`user-${cUser?._id}`} 
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            onClick={clickUser} > {/**Log in as user, disable all other functions, show user profile page where there is an add button to return to admin */}
        <div className="post">
            <div>
                {getUserHeading(cUser)}
            </div>
            <h2 className="post-title">{cUser?.displayName}</h2>
            <p className="post-content">Reputation: {cUser?.reputation}</p>
        </div>
        <div className="button-container">
            <input id="create-post-button-input" className="submit-button" type="button"  value="Delete User" onClick={(e)=>{e.stopPropagation();setShowConfirm(true);}}/>
        </div>
        </div>
            {showConfirm && (
            <ConfirmWindow
            title="Confirm Deletion"
            message={`Are you sure you want to delete ${cUser.displayName} and all related data?`}
            onConfirm={() => {
                deleteUser();
                setShowConfirm(false);
            }}
            onCancel={() => setShowConfirm(false)}
            confirmButtonMessage="Confirm"
            />
            )}
        </>
    );
}

function BackButton() {
    const {
        userState: {storeAdmin, setUser},
        editState: {setEditUser, editUser}

    } = useContext(PhredditContext);

    const clickBack = () => {
        setUser(storeAdmin);
        setEditUser(false);
    }
    return (
        <div className="button-container">
            <input id="create-post-button-input" className="submit-button" type="button"  value="Back to Admin" onClick={clickBack} style={{display:editUser?"block":"none", marginRight:"90px"}}/>
        </div>
    );
}

export {UserProfilePageView}

