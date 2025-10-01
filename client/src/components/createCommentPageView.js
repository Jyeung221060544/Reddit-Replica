import React, { useContext } from "react";
import { PhredditContext } from "./context";
import api from '../api';

function CreateCommentPageView() {
    const { showPageFunctions: { currentPage } } = useContext(PhredditContext);
    
    return (
        <div className="container main" id="create-comment-page" style={{ display: currentPage === 'create-comment' ? 'block' : 'none'}}>
            <div className="container" id="create-comment-page-inner">
                <Contents />
            </div>
      </div>
    );
}

function Contents() {
    return (
        <div id="create-comment-body">
            <div className="create-title" id="content-banner">
                <h2>Add a Comment</h2>
            </div>
            <CommentInquiry />
            {/* <UsernameInquiry /> */}
            <SubmitButton />
        </div>
    );
}

function CommentInquiry() {
    return (
        <div className="input-container">
            <p className="label">Comment *</p>
            <textarea id="create-comment-content-input" className="input-textbox" rows="5" cols="33"></textarea>
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

function SubmitButton() {
    const {
        commentState: { setComments, setCommentIDs, comment, comments },
        postState: { post, setPost },
        showPageFunctions: { showPost },
        refreshControl: { setRefreshTrigger },
        userState: {user, setUser, setUsers},
    } = useContext(PhredditContext);
    const makeComment = async () => {
        let comment_content = document.getElementById("create-comment-content-input").value;
        document.getElementById("create-comment-content-input").value = "";
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

            window.alert(build);
        } else {
            try {
                const response = await api.post("/addcomment", {
                    content: comment_content,
                    commentedBy: user,
                    commentedDate: new Date(),
                    parentID: comment._id,
                    parentType: comment.type,
                    userID: user._id
                });
                // console.log("New Comment Data: "+ response.data)
                // const newComment = response.data;

                const updatedComments = await api.get("/get/comments");
                setComments(updatedComments.data);
                setCommentIDs(comments.map(comment => comment._id));
              
                const updatedPostResponse = await api.get(`/posts/${post._id}`);
                setPost(updatedPostResponse.data);
                showPost(updatedPostResponse.data);
                setRefreshTrigger(prev => !prev);
                
                const [usersRes, updatedUserResponse] = await Promise.all([
                    api.get("/get/users"),
                    api.get(`/user/${user._id}`)
                  ]);
                setUsers(usersRes.data);
                setUser(updatedUserResponse.data);
            } catch (err) {
                console.error("Failed to submit comment:", err);
                alert("Something went wrong when submitting the comment.");
            }
        }
    }
    return (
        <div className="button-container">
            <input id="create-comment-button-input" className="submit-button" type="button"  value="Submit Comment" onClick={makeComment}/>
        </div>
    );
}

export { CreateCommentPageView }