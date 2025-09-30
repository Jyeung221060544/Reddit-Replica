import React, { useContext, useState } from "react";
import { PhredditContext } from "./context";
import { arrayOfPostCommentsTime } from "../helperFunctions";
import axios from 'axios';
import ConfirmWindow from "./confirm";

function CreatePostPageView() {
    const {
        showPageFunctions: { currentPage }
    } = useContext(PhredditContext);
    return (
        <div className="container main" id="create-post-page" style={{ display: currentPage === 'create-post' ? 'block' : 'none'}}>
            <div className="container" id="create-post-page-inner">
                <Contents />
            </div>
        </div>
    );
      
}

function Contents() {
    return (
        <div id="create-post-body">
            <Title />
            <CommunityInquiry />
            <TitleInquiry />
            <SelectFlairInquiry />
            <NewFlairInquiry />
            <ContentInquiry />
            {/* <UserInquiry /> */}
            <SubmitButton />
        </div>
    );
}

function Title() {
    return (
        <div className="create-title"  id="content-banner">
            <h2>Create a New Post</h2>
        </div>
    );
}

function CommunityInquiry() {
    const { 
        communityState: { communities },
        loginState: {login},
        userState: { user },
    } = useContext(PhredditContext);

    var sortCommunityByUser = [];
    if(login){
        const userCommunityIDs = new Set(user.communityIDs.map(c => c._id?.toString() || c.toString()));
        sortCommunityByUser = [...communities].sort((a, b) => {
            const aJoined = userCommunityIDs.has(a._id?.toString());
            const bJoined = userCommunityIDs.has(b._id?.toString());

            if (aJoined && !bJoined) return -1;  // a before b
            if (!aJoined && bJoined) return 1;   // b before a
            return 0; // Keep original relative order if same
        });

    } else {
        sortCommunityByUser = communities;
    }

    return (
        <div className="dropdown-container">
            <label className="label" htmlFor="Communities">Select Community * </label>
            <select id="create-post-select-community-input" className="input-textbox"type="text"> 
                {sortCommunityByUser.map((community) => {
                    return <CommunityOptions key={community._id} community={community} />
                })}
            </select>
        </div>
    );
}

function CommunityOptions({community}) {
    return (
        <option value={community._id}>{community.name}</option>
    );
}

function TitleInquiry() {
    return (
        <div className="input-container">
            <br />
            <label className="label">Title * </label>
            <input id="create-post-title-input" className="input-textbox"type="text" />
            <p className="input-note">Max Length: 100 characters</p>
        </div>
    );
}

function SelectFlairInquiry() {
    const { flairState: { linkFlairs } } = useContext(PhredditContext);
    return (
        <div className="dropdown-container">
            <br />
            <label className="label" htmlFor="Flair">Select Existing Flair</label>
            <select id="create-post-select-flair-input" className="input-textbox" name="flairs">
                <option value="no-flair" defaultValue>no flair</option>
                {linkFlairs.map((linkFlair) => {
                    return <FlairOptions key={linkFlair._id} linkFlair={linkFlair} />
                })}
            </select>
        </div>
    );
}

function FlairOptions({linkFlair}) {
    return (
        <option value={linkFlair._id}>{linkFlair.content}</option>
    );
}

function NewFlairInquiry() {
    return (
        <div className="input-container">
            <label className="label">Or Create a New Flair </label>
            <input id="create-post-new-flair-input" className="input-textbox" type="text" />
            <p className="input-note">Optional, Max Length: 30 characters</p>
        </div>
    );
}

function ContentInquiry() {
    return (
        <div className="input-container">
            <br />
            <label className="label">Content *</label>
            <textarea id="create-post-content-input" className="input-textbox" rows="5" cols="33"></textarea>
        </div>
    );
}

function UserInquiry() {
    const {
        userState: {user}
    } = useContext(PhredditContext);
    return (
        <div className="input-container">
            <br />
            <label className="label">Username * </label>
            <input id="create-post-username-input" className="input-textbox" type="text" value={(user===null)?"":user.displayName}/>
        </div>
    );
}

function SubmitButton() {
    const {
        postState: { setPosts, setActivePosts, setNewestPosts, setOldestPosts, setPostIDs },
        flairState: { linkFlairs, linkFlairIDs, setLinkFlairs, setLinkFlairIDs },
        communityState: {setCommunities},
        showPageFunctions: { handleShowHomePage },
        commentState: {commentIDs},
        userState: {user, setUser, setUsers}
    } = useContext(PhredditContext);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");

    const makePost = async () => {
        let post_community = document.getElementById("create-post-select-community-input").value;
        let post_title = document.getElementById("create-post-title-input").value;
        document.getElementById("create-post-title-input").value = "";
        let post_flair = document.getElementById("create-post-select-flair-input").value;
        let new_post_flair = document.getElementById("create-post-new-flair-input").value;
        document.getElementById("create-post-new-flair-input").value = "";
        let post_content = document.getElementById("create-post-content-input").value;
        document.getElementById("create-post-content-input").value = "";
        let post_user = user.displayName;
        // document.getElementById("create-post-username-input").value = "";

        let build = "";
        //Error checks on hyperlinks
        const pattern = /\[(.*?)\]\((.*?)\)/g;
        const hyperlinks = [...post_content.matchAll(pattern)];
        let hyperlinkIssue=false;

        for(const link of hyperlinks) {
            const [_, text, url] = link;

            if (!text.trim()) {
                build+="The text inside [] cannotbe empty for hyperlinks \n"
                hyperlinkIssue=true;
            }
            if (!/^https?:\/\//.test(url)) {
               build+="The hyperlink must start with 'http://' or 'https://'\n"
               hyperlinkIssue=true;
            }
        }

        if(post_title === "" || post_title.length > 100 || post_content === "" || post_user === "" || (post_flair != "no-flair" && new_post_flair != "") || (post_flair === "no-flair" && new_post_flair.length > 30) || hyperlinkIssue){
            
            if(post_title == "") {
              build += "Please enter a title!\n";
            }
            if(post_title.length > 100) {
              build += "Title exceeded maximum capacity!\n";
            }
            if((post_flair != "no-flair" && new_post_flair != "")) {
              build += "Please pick a Flair or No Flair to create a new Flair!\n";
            }
            if((post_flair === "no-flair" && new_post_flair.length > 30)) {
              build += "Flair exceeded maximum capacity!\n";
            }
            if(post_content === "") {
              build += "Please enter post content!\n";
            }
            if(post_user === "") {
              build += "Please enter username!\n";
            }
        
            setConfirmMessage(build+"\nTry Again!");
            setShowConfirm(true);
            return;
        } else {
            try {
                var postFlair;
                if(post_flair === "no-flair" && new_post_flair === ""){
                    postFlair = null;
                } else if(post_flair != "no-flair" && new_post_flair == ""){
                    postFlair = linkFlairs[linkFlairIDs.indexOf(post_flair)];
                } else if(post_flair == "no-flair" && new_post_flair != ""){
                    const flairRes = await axios.post("http://127.0.0.1:8000/addlinkflair", {
                        content: new_post_flair
                    });
                    setLinkFlairs(prev => [...prev, flairRes.data]);
                    setLinkFlairIDs(prev => [...prev, flairRes._id]);
                    postFlair = flairRes.data;
                } 
    
                const postRes = await axios.post("http://127.0.0.1:8000/addpost", {
                    title: post_title,
                    content: post_content,
                    linkFlairID: postFlair?._id,
                    postedBy: user,
                    postedDate: new Date(),
                    communityID: post_community,
                    userID: user._id
                });
    
                const allPosts = await axios.get("http://127.0.0.1:8000/get/posts");
                const posts = allPosts.data;
    
                setPosts(posts);
                setPostIDs(posts.map(p => p._id));
                setNewestPosts([...posts].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate)));
                setOldestPosts([...posts].sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate)));
                setActivePosts([...posts].sort((a, b) => {
                    const postComments1 = arrayOfPostCommentsTime(a, a.commentIDs, commentIDs);
                    const postComments2 = arrayOfPostCommentsTime(b, b.commentIDs, commentIDs);
                    return Math.max(...postComments2, 0) - Math.max(...postComments1, 0);
                }));
    
                const updatedCommunities = await axios.get("http://127.0.0.1:8000/get/communities");
                setCommunities(updatedCommunities.data);
    
                const [usersRes, updatedUserResponse] = await Promise.all([
                    axios.get("http://127.0.0.1:8000/get/users"),
                    axios.get(`http://127.0.0.1:8000/user/${user._id}`)
                  ]);
                setUsers(usersRes.data);
                setUser(updatedUserResponse.data);

                handleShowHomePage();
            } catch (err) {
                console.error("Error submitting post:", err);
                alert("Failed to submit post.");
            }
        }
    }

    return (
        <>
        <div className="button-container">
            <input id="create-post-button-input" className="submit-button" type="button"  value="Submit Post" onClick={makePost}/>
        </div>
        {showConfirm && (
                    <ConfirmWindow
                        title="Error Creating Post"
                        message={confirmMessage}
                        onConfirm={() => setShowConfirm(false)}
                        onCancel={() => setShowConfirm(false)}
                        confirmButtonMessage="Okay"
                    />
                )}
        </>
    );

}
export { CreatePostPageView };