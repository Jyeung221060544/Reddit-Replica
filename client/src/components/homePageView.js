import React, { useContext, useState } from "react";
import { Divider, PostDisplay } from "./classWideComponents";
import { PhredditContext } from "./context";
import { findCommunity } from "../helperFunctions";

function HomePageView() {
    const {
        postState: { newestPosts, oldestPosts, activePosts },
        showPageFunctions: { currentPage }
    } = useContext(PhredditContext);
    const [currentOrder, setCurrentOrder] = useState('newest'); // Default order
    const handleNewstOrder = () => setCurrentOrder('newest');
    const handleOldestOrder = () => setCurrentOrder('oldest');
    const handleActiveOrder = () => setCurrentOrder('active');
    return (
        <div className="container main" id="home-page" style={{ display: currentPage === 'home' ? 'block' : 'none', justifyContent: 'center', alignItems: 'center' }}>
            <HomeContentBanner newest={handleNewstOrder} oldest={handleOldestOrder} active={handleActiveOrder}/>
            <Divider />
            {currentOrder === 'newest' 
                ? <Posts posts={newestPosts}/>
                : currentOrder === 'oldest' 
                ? <Posts posts={oldestPosts} />
                : <Posts posts={activePosts} />
            }
            
        </div>
    );
    
};

function Title() { 
    return (
        <div className="title">
          <h2>All Posts</h2>
        </div>
    );
}

function OrderButtons({newest, oldest, active}) { 
    return (
        <div className="container" id="all-posts-header">
          <div id="newest-container">
            <input id="newest-button" type="button"  value="Newest" onClick={newest}/>
          </div>
          <div id="oldest-container">
            <input id="oldest-button" type="button"  value="Oldest" onClick={oldest}/>
          </div>
          <div id="active-container">
            <input id="active-button" type="button"  value="Active" onClick={active}/>
          </div>
        </div>
    );
}


function Posts({posts}) {
    const { 
        communityState: { communities },
        loginState: {login},
        userState: { user },
    } = useContext(PhredditContext);

    if (!login || !user) {
        // Not logged in: show all posts normally
        return (
            <div>
                <div className="container" id="num-posts">
                    <h3 className='num-posts-text'>
                        {posts.length === 0 ? "No Posts" : `${posts.length} Post${posts.length > 1 ? "s" : ""}`}
                    </h3>
                </div>
                <div className="container" id="posts" style={{ flexDirection: 'column' }}>
                    {posts.map((post) => (
                        <PostDisplay key={post._id} post={post} id={"home"} />
                    ))}
                </div>
            </div>
        );
    }

    const myCommunitiesPosts = posts.filter(post => {
        const community = findCommunity(post, communities);
        return user.communityIDs.some(c => c.name === community);
    });
    
    const otherCommunitiesPosts = posts.filter(post => {
        const community = findCommunity(post, communities);
        return !user.communityIDs.some(c => c.name === community);
    });
    // console.log(myCommunitiesPosts);


    return (
        <div>
            <div className="container" id="num-posts">
                <h3 className='num-posts-text'>
                    {posts.length === 0 ? "No Posts" : `${posts.length} Post${posts.length > 1 ? "s" : ""}`}
                </h3>
            </div>

            <div className="container" id="posts" style={{ flexDirection: 'column' }}>
                {/* Posts from user's communities */}
                {myCommunitiesPosts.length > 0 && (
                    <>
                        <h3 className="sublist-header">Your Communities</h3>
                        {myCommunitiesPosts.map((post) => (
                            <PostDisplay key={post._id} post={post} id={"home"} />
                        ))}
                    </>
                )}

                {/* Divider */}
                {otherCommunitiesPosts.length > 0 && otherCommunitiesPosts.length > 0 && (
                    <Divider />
                )}

                {/* Posts from other communities */}
                {otherCommunitiesPosts.length > 0 && (
                    <>
                        <h3 className="sublist-header">Other Communities</h3>
                        {otherCommunitiesPosts.map((post) => (
                            <PostDisplay key={post._id} post={post} id={"home"} />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

function HomeContentBanner({newest, oldest, active}) {
    return (
        <div className="container" id="content-banner">
            <Title />
            <OrderButtons newest={newest} oldest={oldest} active={active}/>
        </div>
    );
}


export { HomePageView };