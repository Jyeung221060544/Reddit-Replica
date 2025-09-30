import React, { useContext } from "react";
import { getPostHeadingHome, getPostHeadingCommunity, findCommunity, findFlair, countPostComments, renderPostDisplayContent} from "../helperFunctions";
import { renderToStaticMarkup } from "react-dom/server";
import { PhredditContext } from "./context";

function Divider() {
    return(
        <div className="divider"></div>
    );
}

// Posts

function PostDisplay({ post, id }) {
    const {
        commentState: { comments, commentIDs },
        communityState: { communities },
        flairState: { linkFlairs, linkFlairIDs },
        showPageFunctions: { showPost }
    } = useContext(PhredditContext);
    const community = findCommunity(post, communities);
    const flair = findFlair(post, linkFlairs, linkFlairIDs);
    const numOfComments = countPostComments(post, commentIDs, comments);
    const updateOnClickFunction = () => {
        showPost(post);
    }
    const extractTextFromJSX = (jsx) => {
        return renderToStaticMarkup(jsx)
            .replace(/<\/?[^>]+(>|$)/g, "")  // Remove HTML tags
            .trim();
    };
    return (
      <div className="post-container" id={`post-${post._id}`} onClick={updateOnClickFunction} >
        <div className="post">
            {/** Get post heading depending on where the posts are displayed (community or else) */}
            {id==="community" ? <PostHeadingCommunity post={post}/> : <PostHeadingHome post={post} community={community}/>}
            
            {/** Title, Flair(if applicable), Content, Views and Comments */}
            <h2 className="post-title">{post.title}</h2>
            {flair && <p className="post-flair">{flair.content}</p>}
            <p className="post-content">{extractTextFromJSX(renderPostDisplayContent(post)).substring(0, 80)}...</p>
            <p className="post-views-comments">
                Views: {post.views} | Comments: {numOfComments} | Votes:  {post.votes}
            </p>
        </div>
      </div>
    );
}

function PostHeadingHome({post, community}) {
    return (
        <div>
            {getPostHeadingHome(post,community)}
        </div>
    );
}

function PostHeadingCommunity({post}) {
    return (
        <div>
            {getPostHeadingCommunity(post)}
        </div>
    );
}


export { Divider, PostDisplay };