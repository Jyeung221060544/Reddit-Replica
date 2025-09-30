import { useMemo } from "react"


export function loginRestrictionError(){
  window.alert("Please login to continue!");
}
export function getTimeAgo(dateString) {
  const now = new Date();
  const then = new Date(dateString);

  const seconds = Math.floor((now - then) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  // Calculate calendar-based years and months
  let years = now.getFullYear() - then.getFullYear();
  let months = now.getMonth() - then.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const daysDiff = now.getDate() - then.getDate();
  if (daysDiff < 0) {
    months -= 1;
    if (months < 0) {
      months += 12;
      years -= 1;
    }
  }

  if (years > 0) return `${years} year${years !== 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months !== 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
}


export function countPostComments(post, commentIDs, comments){
  let comment_count = 0;
  if(post){
    var length = post.commentIDs.length;
  }
  if(length == 0){
    return 0;
  } else {
    comment_count += length;
    for(let i = 0; i < length; i++){
      comment_count += countPostComments(comments[commentIDs.indexOf(post.commentIDs[i]._id)], commentIDs, comments)
    }
  }
  return comment_count;
}

  
export function arrayOfPostCommentsTime(post, comments, commentIDs, postComments = []) {
  let length = post?.commentIDs.length;
  if (length === 0) {
      return postComments;
  }

  for (let i = 0; i < length; i++) {
      // Handle both ObjectId and full comment object
      const id = typeof post.commentIDs[i] === "object" ? post.commentIDs[i]._id : post.commentIDs[i];
      const commentIndex = commentIDs.findIndex(cid => cid.toString() === id.toString());

      if (commentIndex !== -1) {
          const comment = comments[commentIndex];
          if (comment?.commentedDate) {
              postComments.push(new Date(comment.commentedDate).getTime());
              arrayOfPostCommentsTime(comment, comments, commentIDs, postComments);
          }
      }
  }

  return postComments;
}


export function arrayOfPostComments(post, comments, commentIDs, postComments = []) {
  if (commentIDs===undefined) {
    return;
  }
  // console.log("LOOK HERE: "+ commentIDs);
  let length = post?.commentIDs?.length;
    if (length === 0) {
        return postComments;
    } else {
        for (let i = 0; i < length; i++) {
            const commentIndex = commentIDs.indexOf(post.commentIDs[i]._id);
            if (commentIndex !== -1) {
                const comment = comments[commentIndex];
                postComments.push(comment);
                arrayOfPostComments(comment, comments, commentIDs, postComments);
            }
        }
    }
    return postComments;
}


export function countCommentDepth(commentID, postComments) {
    let depth = 0;
    let parentComment = postComments.find(c =>
      c?.commentIDs.some(id => id._id.toString() === commentID._id.toString())
    );
    // console.log(parentComment);
    while (parentComment) {
      depth++;
      parentComment = postComments.find(c =>
        c?.commentIDs.some(id => id._id.toString() === parentComment._id.toString())
      );
      // console.log(parentComment);
    }
  
    return depth;
}


export function findCommunity(post, communities) {
  let post_community;
  for (let i = 0; i < communities.length; i++){
    if(communities[i]?.postIDs.includes(post?._id)){
      post_community = communities[i].name;
      break;
    }
  }
  return post_community;
}

export function findCommunityObject(post, communities) {
  let post_community;
  for (let i = 0; i < communities.length; i++){
    if(communities[i]?.postIDs.includes(post?._id)){
      post_community = communities[i];
      break;
    }
  }
  return post_community;
}

export function findFlair(post, flairs, flairIDs) {
    return (post?.linkFlairID)?flairs[flairIDs.indexOf(post?.linkFlairID)]:null
}

export function getPostHeadingHome(post, post_community) {
    const timeText = getTimeAgo(post.postedDate);
    
    return <p className="post-banner">{post_community} | {post.postedBy.displayName} | {timeText}</p>;
}

export function getPostHeadingUser(post, post_community) {
  const timeText = getTimeAgo(post.postedDate);
  return <p className="post-banner">{post_community} | {timeText}</p>;
}

export function getPostHeadingCommunity(post) {
  const timeText = getTimeAgo(post.postedDate);
  return <p className="post-banner">{post.postedBy.displayName} | {timeText}</p>;
}

export function getCommentHeading(comment) {
  const timeText = getTimeAgo(comment.commentedDate);
  return <p className="post-banner">{timeText}</p>;
}
export function getCommunityHeading(community) {
  const timeText = getTimeAgo(community.startDate);
  return <p className="post-banner">{timeText}</p>;
}
export function getUserHeading(user) {
  const timeText = getTimeAgo(user.startDate);
  return <p className="post-banner">{user.firstName} {user.lastName} | {user.email} | {timeText}</p>;
}

//Nav Bar Functions

export function createCommunityTab(community, displayCommunityPage, currentCommunity, currentPage) {
    
    return (
      <div
        className="community-tab"
        id={community._id}
        style={{backgroundColor: (currentCommunity&&(currentCommunity._id===community._id)&&currentPage ==="community" ? "#FF4500" : null), color: (currentCommunity&&(currentCommunity._id===community._id)&&currentPage ==="community" ? "white" : null)}}
        onClick={() => displayCommunityPage(community)}
      >
        <h3>{community.name}</h3>
      </div>
    );
}



export function hyperlinks(link, text) {
    return <a href={link}>{text}</a>;
}



export function newestCommunityPostArray(community, posts, postIDs){
  let communityPostArray = []
  let community_posts = community.postIDs;
  for(let i = 0; i < community_posts.length; i++){
    let post = posts[postIDs.indexOf(community_posts[i])];
    communityPostArray.push(post);
  }
  communityPostArray.sort(function(a, b){return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()});
  return communityPostArray;
}

export function oldestCommunityPostArray(community, posts, postIDs){
  let communityPostArray = []
  let community_posts = community.postIDs;
  for(let i = 0; i < community_posts.length; i++){
    let post = posts[postIDs.indexOf(community_posts[i])];
    communityPostArray.push(post);
  }
  communityPostArray.sort(function(a, b){return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime()});
  return communityPostArray;
}

export function activeCommunityPostArray(community, posts, postIDs, comments, commentIDs){
  let communityPostArray = []
  let community_posts = community.postIDs;
  for(let i = 0; i < community_posts.length; i++){
    let post = posts[postIDs.indexOf(community_posts[i])];
    communityPostArray.push(post);
  }
  communityPostArray.sort(function(a, b){
    let postComments1 = arrayOfPostComments(a, comments, commentIDs);
    let newestComment1 = Math.max(...postComments1);

    let postComments2 = arrayOfPostComments(b, comments, commentIDs);
    let newestComment2 = Math.max(...postComments2);
    return newestComment2 - newestComment1;
  });
  return communityPostArray;
}



export function useParsedDescription(description) {
  return useMemo(() => {
    const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let build = [];
    let lastIndex = 0;

    description.replace(pattern, (match, text, url, index) => {
      const textBefore = description.substring(lastIndex, index);
      build.push(...insertLineBreaks(textBefore, `before-${index}`));
      build.push(
        <a key={`link-${index}`} href={url} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      );
      lastIndex = index + match.length;
    });

    build.push(...insertLineBreaks(description.substring(lastIndex), `after-${lastIndex}`));
    return build;
  }, [description]);
}



export function useParsedCommentContent(content) {
  return useMemo(() => {
    const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let build = [];
    let lastIndex = 0;

    content.replace(pattern, (match, text, url, index) => {
      const textBefore = content.substring(lastIndex, index);
      build.push(...insertLineBreaks(textBefore, `before-${index}`));
      build.push(
        <a key={`link-${index}`} href={url} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      );
      lastIndex = index + match.length;
    });

    build.push(...insertLineBreaks(content.substring(lastIndex), `after-${lastIndex}`));
    return build;
  }, [content]);
}

export function useParsedPostContent(content) {
  return useMemo(() => {
    const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let build = [];
    let lastIndex = 0;

    content.replace(pattern, (match, text, url, index) => {
      const textBefore = content.substring(lastIndex, index);
      build.push(...insertLineBreaks(textBefore, `before-${index}`));
      build.push(
        <a key={`link-${index}`} href={url} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      );
      lastIndex = index + match.length;
    });

    build.push(...insertLineBreaks(content.substring(lastIndex), `after-${lastIndex}`));
    return build;
  }, [content]);
}

export function renderPostDisplayContent(post) {
  let post_content = post.content;
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let build = [];
  let lastIndex = 0;
  post_content.replace(pattern, (match, text, url, index) => {
      build.push(post_content.substring(lastIndex, index)); 
      build.push(<a key={index} href={url} target="_blank" rel="noopener noreferrer">{text}</a>); 
      lastIndex = index + match.length;
  });
  build.push(...insertLineBreaks(post_content.substring(lastIndex))); 
  return build;
}

function insertLineBreaks(text, keyPrefix = "") {
  return text.split('\n').flatMap((part, i) =>
    i === 0 ? [part] : [<br key={`${keyPrefix}-br-${i}`} />, part]
  );
}

export function canVote(user) {
  if(user===null){
    return false;
  }
  if(user.reputation<50) {
    return false;
  }
  return true;

}

export function findPostOfComment(comment, posts, comments) {
  if (!comment || !posts || !comments) return null;

  // Step 1: Walk up the comment hierarchy to get the top-level comment
  let currentComment = comment;
  while (true) {
    const parentComment = comments.find(c =>
      c?.commentIDs.some(id =>
        (typeof id === "object" ? id._id : id).toString() === currentComment._id.toString()
      )
    );
    if (!parentComment) break;
    currentComment = parentComment;
  }

  // Step 2: Find the post that contains this top-level comment
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const topLevelCommentID = currentComment?._id.toString();
    const match = post?.commentIDs.some(id =>
      (typeof id === "object" ? id._id : id).toString() === topLevelCommentID
    );
    if (match) return post;
  }

  return null;
}
