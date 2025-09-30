import React, { useContext, useState, useEffect } from "react";
import { Divider, PostDisplay } from "./classWideComponents";
import { newestCommunityPostArray, oldestCommunityPostArray, activeCommunityPostArray, getTimeAgo, useParsedDescription } from "../helperFunctions.js";
import { PhredditContext } from "./context.js";
import axios from 'axios';

function CommunityPageView() {
    const {
        postState: { posts, postIDs },
        commentState: { comments, commentIDs },
        communityState: { community },
        showPageFunctions: { currentPage }
    } = useContext(PhredditContext);
    const [currentOrder, setCurrentOrder] = useState('newest'); // Default order
    const handleNewstOrder = () => setCurrentOrder('newest');
    const handleOldestOrder = () => setCurrentOrder('oldest');
    const handleActiveOrder = () => setCurrentOrder('active');
    
    if(!community){
        return null;
    } 
    const newest = newestCommunityPostArray(community, posts, postIDs);
    const oldest = oldestCommunityPostArray(community, posts, postIDs);
    const active = activeCommunityPostArray(community, posts, postIDs, comments, commentIDs);
    return (
        <div className="container main" id="community-page" style={{ display: currentPage === 'community' ? 'block' : 'none'}}> 
            <CommunityContentBanner newest={handleNewstOrder} oldest={handleOldestOrder} active={handleActiveOrder} />
            <Divider />
            {currentOrder === 'newest' 
                ? <CommunityPosts posts={newest} />  
                : currentOrder === 'oldest' 
                ? <CommunityPosts posts={oldest} />  
                : <CommunityPosts posts={active} />  
            }
        </div>
    );
    
}

function CommunityContentBanner({newest, oldest, active}) {
    const { communityState: {community} } = useContext(PhredditContext);
    let timeText = getTimeAgo(community.startDate);
    let num_posts = community.postIDs.length;
    const parsedDescription = useParsedDescription(community.description);
    return (
        <div className="container" id="community-content-banner">
            <div className="title" id="community-title">
                <h2> {community.name} </h2>
            </div>
            <div className="container">
                <div id="info" >
                    <p className='community-info'>{parsedDescription}</p>
                    <p className='community-info'>
                        Created By {community.createdBy.displayName} {timeText}
                    </p>
                    <p className='community-info'> {community.memberCount} members | {num_posts} {num_posts===1 ? " Post" : " Posts"}</p>
                    <CommunityJoinOrLeave />
                </div>
                <OrderButtons newest={newest} oldest={oldest} active={active} />
            </div>
        </div>
    );
}

function OrderButtons({newest, oldest, active}) {
   return (
        <div className="container" id="all-posts-header" style={{width:'50%', paddingTop: '25px', paddingBottom: '0px'}}>
            <div id="newest-container">
                <input id="community-newest-button" type="button"  value="Newest" onClick={newest}/>
            </div>
            <div id="oldest-container">
                <input id="community-oldest-button" type="button"  value="Oldest" onClick={oldest}/>
            </div>
            <div id="active-container">
                <input id="community-active-button" type="button"  value="Active" onClick={active}/>
            </div>
        </div>
   );
}

function CommunityPosts({posts}) {
    // console.log(posts);
    return (
        <div>
            <div className="container" id="community-num-posts">
                <h3 className='num-posts-text'>
                    {posts.length === 0 ? "No Posts" : `${posts.length} Post${posts.length > 1 ? "s" : ""}`}
                </h3>
            </div>
            <div className="container" id="community-posts">
                {posts.map((post) => {
                    // console.log(post);
                    if(!post) return;
                    return <PostDisplay key={post._id} post={post} id={"community"}/>
                })}
            </div>
        </div>
    );
    
}

function CommunityJoinOrLeave() {
    const {
        communityState: { community, setCommunity, setCommunities },
        loginState: { login },
        userState: { user, setUser },
        showPageFunctions: { showCommunityPage },
    } = useContext(PhredditContext);

    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        if (login && user && community) {
            setIsMember(
                user.communityIDs.some(
                    (c) => c._id?.toString() === community._id?.toString() || c.toString() === community._id?.toString()
                )
            );
        } else {
            setIsMember(false);
        }
    }, [login, user, community]);
    
    var buttonValue = "";
    if(isMember){
        buttonValue = "Leave Community";
    } else {
        buttonValue = "Join Community";
    }
    const joinOrLeaveButton = async () => {
        console.log(isMember);
        if (isMember) {
            const response = await axios.post("http://127.0.0.1:8000/leavecommunity", {
                communityID: community._id,
                userID: user._id
            });
            const { updatedCommunity, updatedUser } = response.data;
            console.log(updatedCommunity);
            setCommunity(updatedCommunity);
            setUser(updatedUser);
            showCommunityPage(updatedCommunity);
            setIsMember(false);  
            const updatedCommunities = await axios.get("http://127.0.0.1:8000/get/communities");
            setCommunities(updatedCommunities.data);
        } else {
            const response = await axios.post("http://127.0.0.1:8000/joincommunity", {
                communityID: community._id,
                userID: user._id
            });
            const { updatedCommunity, updatedUser } = response.data;
            setCommunity(updatedCommunity);
            setUser(updatedUser);
            showCommunityPage(updatedCommunity);
            setIsMember(true);  
            const updatedCommunities = await axios.get("http://127.0.0.1:8000/get/communities");
            setCommunities(updatedCommunities.data);
        }

        if(isMember){
            buttonValue = "Leave Community";
        } else {
            buttonValue = "Join Community";
        }
    }

    
    return (
        <div className="button-container">
            <input 
            id="join-or-leave-community-button-input" 
            className="submit-button" 
            type="button" 
            value={buttonValue}
            style={{display: login? 'block' : 'none'}}
            onClick={joinOrLeaveButton}/>
        </div>
    );
}

export { CommunityPageView };