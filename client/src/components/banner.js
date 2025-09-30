import {React, useContext, useState} from "react"
import redditLogo from '../Resources/reddit-logo.png';
import { arrayOfPostComments, loginRestrictionError } from "../helperFunctions";
import { PhredditContext } from "./context";
import ConfirmWindow from "./confirm";

function Banner() {
    const {
        editState: {editUser}
    } = useContext(PhredditContext);
    return (
        <div id="banner" className="container" style={{display:(editUser)?"none":"flex"}}>
            <Logo />
            <SearchBar />
            <UserProfile/>
            <Logout />
            <CreateButton />
        </div>

    );
}

function Logo() { 
    const { 
        showPageFunctions: { handleShowWelcomePage },
    } = useContext(PhredditContext);
    return (
        <div id="home-logo">
            <img src={redditLogo} alt="reddit-logo" />
            <h2><span id="logo" style={{ cursor: 'pointer' }} onClick={handleShowWelcomePage}>Phreddit</span></h2>
        </div>
    );
}

function SearchBar() {
    const {
        postState: { posts },
        commentState: { comments, commentIDs },
        showPageFunctions: { showSearchPage }
    } = useContext(PhredditContext);
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            let inputValue = document.getElementById('search-bar').value;
            if(inputValue == ""){
                showSearchPage([], "");
            } else{

                const words = inputValue.split(" ");
                let searchedPosts = [];
                
                for(let i = 0; i < posts.length; i++){
                    let post = posts[i];
                    let postComments = arrayOfPostComments(post, comments, commentIDs);
                    for(let i = 0; i < words.length; i++){
                        if( !(searchedPosts.includes(post)) && (post.title.includes(words[i]) || post.content.includes(words[i])) ){
                            searchedPosts.push(post);
                        }
                    }
                    for(let i = 0; i < words.length; i++){
                        for(let j = 0; j < postComments.length; j++){
                            if( !(searchedPosts.includes(post)) && (postComments[j].content.includes(words[i])) ){
                            searchedPosts.push(post);
                            }
                        }
                    }
                }
                document.getElementById('search-bar').value = "";
                showSearchPage(searchedPosts, inputValue);
            }
            
        }
    };
    return (
        <div id="search-bar-container" style={{borderStyle: 'none'}}>
            <input id="search-bar" type="text" placeholder="Search Phreddit..." onKeyDown={handleKeyDown}/>
            <i className="material-icons" style={{position: 'absolute', left: '55px', top: '25%'}} >search</i>
        </div>
    );
}

function UserProfile () {
    const {
        userState:{user},
        showPageFunctions:{handleShowUserProfilePage}
    } = useContext(PhredditContext);

    const displayName = () => {
        if(user===null) {
            return "Guest";         
        } else {
            return user.displayName;
        }
    };

    return (
        <div id="user-container" style={{cursor:"pointer"}} onClick={(user===null)?()=>{}:handleShowUserProfilePage}>
            <i className="material-icons" style={{ width: "50px", height: "50px", fontSize: "50px", color: "#FF4500", padding:"0px"}} >account_circle</i>
            <p style={{ margin: 0, padding: 0, lineHeight: 1 }}>
                {displayName()}
            </p>
        </div>
    );
}

function Logout () {
    const {
        userState:{user, setUser},
        showPageFunctions: { handleShowWelcomePage },
        loginState: { setLogin }
    } = useContext(PhredditContext);

    const logout = () => {
        setLogin(false);
        setUser(null);
        handleShowWelcomePage();
    }

    //display:(user===null)?"none":"block"
    return (
        <div id="logout-container" style={{cursor: 'pointer', display:(user===null)?"none":"block"}} onClick={logout}>
            <i className="material-icons" style={{ width: "50px", height: "50px", fontSize: "50px", color: "#FF4500", padding:"0px"}} >power_settings_new</i>
            <p className="banner-font" style={{ margin: 0, padding: 0, lineHeight: 1}}>Logout</p>
        </div>
    );
}

function CreateButton() {
    const {
        loginState: {login},
        showPageFunctions: { handleShowCreatePostPage, currentPage }
    } = useContext(PhredditContext);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClick = () => {
        if (login) {
            handleShowCreatePostPage();
        } else {
            setShowConfirm(true);
        }
    };

    return (
        <>
        <div id="create-container">
            <input
                id="create-button"
                type="button"
                value="+ Create Post"
                style={{
                    backgroundColor: currentPage === "create-post" ? "#FF4500" : null,
                    color: currentPage === "create-post" ? "white" : null
                }}
                onClick={handleClick}
            />
        </div>
        {showConfirm && (
            <ConfirmWindow
                title="Login Required"
                message="Please login to continue!"
                onConfirm={() => setShowConfirm(false)}
                onCancel={() => setShowConfirm(false)}
                confirmButtonMessage="Okay"
            />
        )}
        </>
    );
}


export { Banner };