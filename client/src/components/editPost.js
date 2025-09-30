import React, { useContext, useState,useEffect } from "react";
import { PhredditContext } from "./context";
import { arrayOfPostCommentsTime, findCommunityObject, findFlair } from "../helperFunctions";
import axios from 'axios';
import ConfirmWindow from "./confirm";

function EditPost() {
    const {
        showPageFunctions: { currentPage },
        editState: {editUser}
    } = useContext(PhredditContext);
    
    return (
        <div className="container main" id="create-post-page" style={{ display: currentPage === 'edit-post' ? 'block' : 'none', width:editUser?"100%":"100%", height:editUser?"100%":"100%"}}>
            <div className="container" id="create-post-page-inner">
                <Contents />
            </div>
        </div>
    );
      
}

function Contents() {
    const [flair, setFlair] = useState("no-flair");
    const [communityID, setCommunityID] = useState("");

    return (
        <div id="create-post-body">
            <Title />
            <CommunityInquiry communityID={communityID} setCommunityID={setCommunityID} />
            <TitleInquiry />
            <SelectFlairInquiry flair={flair} setFlair={setFlair} />
            <NewFlairInquiry />
            <ContentInquiry />
            {/* <UserInquiry /> */}
            <div style={{display:"flex", gap:"20px"}}>
                <SubmitButton flair={flair} communityID={communityID} />
                <DeleteButton/>
                <CancelEditButton />
            </div>
        </div>
    );
}

function Title() {
    return (
        <div className="create-title"  id="content-banner">
            <h2>Edit a Post</h2>
        </div>
    );
}

function CommunityInquiry({ communityID, setCommunityID }) {
    const { 
        communityState: { communities },
        loginState: {login},
        userState: { user },
        editState: { editPost },
        showPageFunctions:{currentPage}
    } = useContext(PhredditContext);

    useEffect(() => {
        if (editPost) {
            const communityObj = findCommunityObject(editPost, communities);
            if (communityObj) {
                setCommunityID(communityObj._id);
            }
        }
    }, [editPost, currentPage]);


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
            <select 
                id="create-post-select-community-input" 
                className="input-textbox"type="text" 
                value={communityID}
                onChange={(e)=>{setCommunityID(e.target.value)}}
                > 
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
    const {
        editState:{editPost},
        showPageFunctions:{currentPage}
    } = useContext(PhredditContext);
    const [title, setTitle] = useState(editPost?.title);

    useEffect(()=>{
        if(editPost?.title){
            setTitle(editPost.title);
        }
    }, [editPost, currentPage, editPost?.title]);

    return (
        <div className="input-container">
            <br />
            <label className="label">Title * </label>
            <input 
                id="edit-post-title-input" 
                className="input-textbox"
                type="text"
                value={title || ""}
                onChange={(e)=>{setTitle(e.target.value)}}
                />
            <p className="input-note">Max Length: 100 characters</p>
        </div>
    );
}

function SelectFlairInquiry({ flair, setFlair }) {
    const { 
        flairState: { linkFlairs, linkFlairIDs },
        editState: { editPost },
        showPageFunctions: {currentPage}
    } = useContext(PhredditContext);
    useEffect(() => {
        if (editPost?.linkFlairID) {
            const found = findFlair(editPost, linkFlairs, linkFlairIDs);
            setFlair(found?._id || "no-flair");
        } else {
            setFlair("no-flair");
        }
    }, [editPost, currentPage, linkFlairIDs, linkFlairs]);
    // console.log(flair);
    return (
        <div className="dropdown-container">
            <br />
            <label className="label" htmlFor="Flair">Select Existing Flair</label>
            <select 
                id="create-post-select-flair-input" 
                className="input-textbox" 
                name="flairs" 
                value={flair}
                onChange={(e)=>{setFlair(e.target.value)}}
                >
                <option value="no-flair">no flair</option>
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
    const [newFlair, setNewFlair] = useState('');
    const {
        showPageFunctions: {currentPage},
        editState: {editPost}

    } = useContext(PhredditContext);
    useEffect(()=>{
        setNewFlair('');
    }, [currentPage, editPost]);
    
    return (
        <div className="input-container">
            <label className="label">Or Create a New Flair </label>
            <input 
                id="create-post-new-flair-input" 
                className="input-textbox" 
                type="text" 
                value={newFlair}
                onChange={(e)=>{setNewFlair(e.target.value)}}
                />
            <p className="input-note">Optional, Max Length: 30 characters</p>
        </div>
    );
}

function ContentInquiry() {
    const {
        editState: { editPost },
        showPageFunctions: {currentPage}
    } = useContext(PhredditContext);
    const [content, setContent] = useState(editPost?.content);
    useEffect(()=>{
        if(editPost?.content) {
            setContent(editPost.content);
        }
    },[editPost, currentPage, editPost?.content])
    return (
        <div className="input-container">
            <br />
            <label className="label">Content *</label>
            <textarea 
                id="edit-post-content-input" 
                className="input-textbox" 
                rows="5" 
                cols="33" 
                value={content || ""}
                onChange={(e)=>{setContent(e.target.value)}}
            ></textarea>
        </div>
    );
}


function SubmitButton({ flair, communityID }) {
    const {
        postState: { setPosts, setActivePosts, setNewestPosts, setOldestPosts, setPostIDs },
        flairState: { linkFlairs, linkFlairIDs, setLinkFlairs, setLinkFlairIDs },
        communityState: {setCommunities, communities},
        showPageFunctions: { handleShowHomePage, currentPage },
        commentState: {commentIDs},
        userState: {user, setUsers, setUser},
        editState: {editPost, setEditPost}
    } = useContext(PhredditContext);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");


    const [oldCommunity, setOldCommunity] = useState(null);
    useEffect(()=>{
        if(editPost){
            const communityObj = findCommunityObject(editPost, communities);
            setOldCommunity(communityObj);
        }
    }, [editPost, currentPage]);

    // console.log(oldCommunity);
    const makePost = async () => {
        let post_community = communityID;
        let post_title = document.getElementById("edit-post-title-input").value;
        let post_flair = flair;
        let new_post_flair = document.getElementById("create-post-new-flair-input").value;
        let post_content = document.getElementById("edit-post-content-input").value;
        let post_user = user.displayName;
        // document.getElementById("create-post-username-input").value = "";

        // console.log("Community: " + post_community);
        // console.log("Title: " + post_title);
        // console.log("Flair: " + post_flair);
        // console.log("Content: " + post_content);

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
          
            setConfirmMessage(build+"\nTry again!");
            setShowConfirm(true);
            
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
    
                const postRes = await axios.post("http://127.0.0.1:8000/editpost", {
                    title: post_title,
                    content: post_content,
                    linkFlairID: postFlair,
                    newCommunityID: post_community,
                    oldCommunityID: oldCommunity._id,
                    postID: editPost._id
                });
                setEditPost(postRes.data);
    
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

                // const updatedUsers = axios.get("http://127.0.0.1:8000/get/users");
                // setUsers(updatedUsers.data);

                const updatedUserResponse = await axios.get(`http://127.0.0.1:8000/user/${user._id}`);
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
            <input id="create-post-button-input" className="submit-button" type="button"  value="Edit Post" onClick={makePost}/>
        </div>
        {showConfirm && (
            <ConfirmWindow
                title="Error Editing Post"
                message={confirmMessage}
                onConfirm={() => setShowConfirm(false)}
                onCancel={() => setShowConfirm(false)}
                confirmButtonMessage="Okay"
            />
        )}
        </>
    );

}

function CancelEditButton() {
    const{
        showPageFunctions:{handleShowUserProfilePage},
    } = useContext(PhredditContext);
    return(
        <div className="button-container">
            <input id="create-post-button-input" className="submit-button" type="button"  value="Cancel Edit" onClick={handleShowUserProfilePage} />
        </div>
    );
}

function DeleteButton() {
    const {
        postState: { setPosts, setPostIDs, setNewestPosts, setOldestPosts, setActivePosts },
        commentState: { commentIDs },
        communityState: { setCommunities },
        userState: { user, setUser },
        editState: { editPost },
        showPageFunctions: { handleShowUserProfilePage },
    } = useContext(PhredditContext);

    const [showConfirm, setShowConfirm] = useState(false);
    const deletePost = async () => {
        try {
            const res = await axios.delete(`http://127.0.0.1:8000/delete/post/${editPost._id}`);
            if (res.status === 200) {

                const [postsRes, communitiesRes, userRes] = await Promise.all([
                    axios.get("http://127.0.0.1:8000/get/posts"),
                    axios.get("http://127.0.0.1:8000/get/communities"),
                    axios.get(`http://127.0.0.1:8000/user/${user._id}`),
                ]);

                const posts = postsRes.data;
                setPosts(posts);
                setPostIDs(posts.map(p => p._id));
                setNewestPosts([...posts].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate)));
                setOldestPosts([...posts].sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate)));
                setActivePosts([...posts].sort((a, b) => {
                    const postComments1 = arrayOfPostCommentsTime(a, a.commentIDs, commentIDs);
                    const postComments2 = arrayOfPostCommentsTime(b, b.commentIDs, commentIDs);
                    return Math.max(...postComments2, 0) - Math.max(...postComments1, 0);
                }));
                setCommunities(communitiesRes.data);
                setUser(userRes.data);

                handleShowUserProfilePage();
            } else {
                alert("Failed to delete post.");
            }
        } catch (err) {
            console.error(err);
            alert("Error occurred while deleting post.");
        }
    };

    return (
        <>
            <div className="button-container">
                <input id="create-post-button-input" className="submit-button" type="button" value="Delete Post" onClick={() => setShowConfirm(true)} />
            </div>
            {showConfirm && (
                <ConfirmWindow
                    title="Confirm Post Deletion"
                    message="Are you sure you want to delete this post and all associated comments?"
                    onConfirm={() => {
                        deletePost();
                        setShowConfirm(false);
                    }}
                    onCancel={() => setShowConfirm(false)}
                    confirmButtonMessage="Confirm"
                />
            )}
        </>
    );
}

export { EditPost };