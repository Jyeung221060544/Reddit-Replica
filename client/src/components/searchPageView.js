import React, { useContext, useState } from "react";
import { Divider, PostDisplay } from "./classWideComponents";
import { arrayOfPostCommentsTime, findCommunity } from "../helperFunctions";
import { PhredditContext } from "./context";

function SearchPageView() {
    const {
        showPageFunctions: { currentPage },
        searchState: { searchArray },
        commentState: { comments, commentIDs },
    } = useContext(PhredditContext);
    const [currentOrder, setCurrentOrder] = useState('newest'); // Default order
    const handleNewstOrder = () => setCurrentOrder('newest');
    const handleOldestOrder = () => setCurrentOrder('oldest');
    const handleActiveOrder = () => setCurrentOrder('active');
    var newest = [];
    var oldest = [];
    var active = [];
    
    if(searchArray.length != 0){
        for(let i = 0; i < searchArray.length; i++){
            newest.push(searchArray[i]);
            oldest.push(searchArray[i]);
            active.push(searchArray[i]);
        }
        newest.sort(function(a, b){return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()});
        oldest.sort(function(a, b){return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime()});
        active.sort(function(a, b){
            let postComments1 = arrayOfPostCommentsTime(a, comments, commentIDs);
            let newestComment1 = Math.max(...postComments1);
        
            let postComments2 = arrayOfPostCommentsTime(b, comments, commentIDs);
            let newestComment2 = Math.max(...postComments2);
            return newestComment2 - newestComment1;
        });
    }
    
    return (
        <div className="container main" id="search-page" style={{ display: currentPage === 'search' ? 'block' : 'none', justifyContent: 'center', alignItems: 'center' }}>
            <SearchContentBanner newest={handleNewstOrder} oldest={handleOldestOrder} active={handleActiveOrder}/>
            <Divider />
            {currentOrder === 'newest' 
                ? <SearchPosts posts={newest} />
                : currentOrder === 'oldest' 
                ? <SearchPosts posts={oldest} />
                : <SearchPosts posts={active} />
            }
            
        </div>
    );
    
}

function SearchContentBanner({newest, oldest, active}) {
    const {
        searchState: { searchArray, searchValue:input }
    } = useContext(PhredditContext);
    return (
        <div className="container" id="content-banner">
            <div className="title" id="search-title">
                {searchArray.length === 0 || input == ""
                ? <h2>No results found for: "{input}" </h2>
                : <h2>Results for: "{input}" </h2>
                }
            </div>
            <OrderButtons newest={newest} oldest={oldest} active={active}/>
        </div>
    );
    
}

function OrderButtons({newest, oldest, active}) {
    return (
        <div className="container" id="all-posts-header">
            <div id="newest-container">
                <input id="search-newest-button" type="button"  value="Newest" onClick={newest} />
            </div>
            <div id="oldest-container">
                <input id="search-oldest-button" type="button"  value="Oldest" onClick={oldest} />
            </div>
            <div id="active-container">
                <input id="search-active-button" type="button"  value="Active" onClick={active} />
            </div>
        </div>
    );
    
}

function SearchPosts({posts}) {
    const { 
        communityState: { communities },
        loginState: {login},
        userState: { user },
    } = useContext(PhredditContext);

    if (!login || !user) {
        // Not logged in: show all posts normally
        return (
            <div>
                <div className="container" id="search-num-posts">
                    <h3 className='num-posts-text'>
                        {posts.length === 0 ? "No Posts" : `${posts.length} Post${posts.length > 1 ? "s" : ""}`}
                    </h3>
                </div>
                <div className="container" id="search-posts">
                    {posts.map((post) => {
                        return <PostDisplay key={post._id} post={post} id={"search"} />
                    })}
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

    return (
        <div>
            <div className="container" id="search-num-posts">
                <h3 className='num-posts-text'>
                    {posts.length === 0 ? "No Posts" : `${posts.length} Post${posts.length > 1 ? "s" : ""}`}
                </h3>
            </div>
            <div className="container" id="search-posts">
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

export{ SearchPageView };