import React, { useContext, useState, useEffect } from "react";
import { PhredditContext } from "./context";
import axios from 'axios';
import ConfirmWindow from "./confirm";

function EditComment() {
    const { 
        showPageFunctions: { currentPage },
        editState: {editUser}
    } = useContext(PhredditContext);
    
    return (
        <div className="container main" id="create-comment-page" style={{ display: currentPage === 'edit-comment' ? 'block' : 'none', width:editUser?"100%":"100%", height:editUser?"100%":"100%"}}>
            <div className="container" id="create-comment-page-inner">
                <Contents />
            </div>
      </div>
    );
}

function Contents() {
    const [commentID, setCommentID] = useState(null); 
    return (
        <div id="create-comment-body">
            <div className="create-title" id="content-banner">
                <h2>Edit a Comment</h2>
            </div>
            <CommentInquiry setCommentID={setCommentID} />
            {/* <UsernameInquiry /> */}
            <div style={{display:"flex", gap:"20px"}}>
                <SubmitButton commentID={commentID} />
                <DeleteButton/>
                <CancelEditButton />
            </div>
        </div>
    );
}

function CommentInquiry({ setCommentID }) {
    const {
        editState: {editComment},
        showPageFunctions: {currentPage}
    } = useContext(PhredditContext)
    const [content, setContent] = useState(editComment?.content);

    useEffect(()=> {
        if(editComment?.content) {
            setContent(editComment?.content);
        }
        if (editComment) {
            setCommentID(editComment._id);
        }
    }, [editComment, currentPage])
    
    return (
        <div className="input-container">
            <p className="label">Comment *</p>
            <textarea 
                id="edit-comment-content-input" 
                className="input-textbox" 
                rows="5" 
                cols="33"
                value={content || ""}
                onChange={(e)=>{setContent(e.target.value)}}
                ></textarea>
            <p className="input-note">Max Length: 500 characters</p>
        </div>
    );
}

function UsernameInquiry() {
    const {
        userState: {user},
    } = useContext(PhredditContext);
    return (
        <div className="input-container">
            <p className="label">Username *</p>
            <input id="create-comment-username-input" className="input-textbox" type="text" value={(user===null)?"":user.displayName}/>
        </div>
    );
}

function SubmitButton({ commentID }) {
    const {
        commentState: { setComments, setCommentIDs, comments },
        postState: { post, setPost },
        showPageFunctions: { showPost, handleShowUserProfilePage },
        refreshControl: { setRefreshTrigger },
        userState: {user, setUser},
        editState: { editComment, setEditComment, editUser }
    } = useContext(PhredditContext);

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    
    

    const makeComment = async () => {
        let comment_content = document.getElementById("edit-comment-content-input").value;
        let comment_user = user.displayName;
        // document.getElementById("create-comment-username-input").value = "";
        let build = "";
        //Error checks on hyperlinks
        const pattern = /\[(.*?)\]\((.*?)\)/g;
        const hyperlinks = [...comment_content.matchAll(pattern)];
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
        // console.log("Hyperlinks");
        // console.log(hyperlinks);

        if(comment_content == "" || comment_content.length > 500 || comment_user == "" || hyperlinkIssue){

            if(comment_content == "") {
                build += "Please enter a comment!\n";
                }
                if(comment_content.length > 500) {
                build += "Comment is too long!\n";
                }

            setConfirmMessage(build+"\nTry again!");
            setShowConfirm(true);

        } else {
            try {
                const response = await axios.post("http://127.0.0.1:8000/editcomment", {
                    content: comment_content,
                    commentID: commentID
                });

                const newComment = response.data;
                setEditComment(newComment);

                const updatedComments = await axios.get("http://127.0.0.1:8000/get/comments");
                setComments(updatedComments.data);
                setCommentIDs(updatedComments.data.map(comment => comment._id));

                const updatedUserResponse = await axios.get(`http://127.0.0.1:8000/user/${user._id}`);
                setUser(updatedUserResponse.data);

                if(!editUser){
                    const updatedPostResponse = await axios.get(`http://127.0.0.1:8000/posts/${post._id}`);
                    setPost(updatedPostResponse.data);
                    showPost(updatedPostResponse.data);
                } else {
                    handleShowUserProfilePage();
                }
                
                
            } catch (err) {
                console.error("Failed to submit comment:", err);
                alert("Something went wrong when submitting the comment.");
            }
        }
    }

    return (
        <>
        <div className="button-container">
            <input id="create-comment-button-input" className="submit-button" type="button"  value="Submit Comment" onClick={makeComment}/>
        </div>
        {showConfirm && (
            <ConfirmWindow
                title="Error Editing Comment"
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
        editState: { editComment },
        userState: { user, setUser },
        postState: { setPosts },
        showPageFunctions: { handleShowUserProfilePage },
    } = useContext(PhredditContext);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const deleteComment = async () => {
        try {
            await axios.delete(`http://127.0.0.1:8000/delete/comment/${editComment._id}`);
            const updatedUser = await axios.get(`http://127.0.0.1:8000/user/${user._id}`);
            const updatedPosts = await axios.get("http://127.0.0.1:8000/get/posts");
            setPosts(updatedPosts.data);
            setUser(updatedUser.data);
            handleShowUserProfilePage();
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete comment.");
        }
    };

    return (
        <>
        <div className="button-container">
            <input id="create-post-button-input" className="submit-button" type="button"  value="Delete Comment" onClick={deleteComment}/>
        </div>
            {showConfirm && (
                <ConfirmWindow
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete this comment?`}
                    onConfirm={() => {
                        deleteComment();
                        setShowConfirm(false);
                    }}
                    onCancel={() => setShowConfirm(false)}
                    confirmButtonMessage="Confirm"
                />
            )}
        </>
        
    );
}

export { EditComment }