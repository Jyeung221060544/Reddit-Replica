// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const Community = require('./models/communities');
const Post = require('./models/posts');
const Comment = require('./models/comments');
const LinkFlair = require('./models/linkflairs');
const User = require('./models/users');

// --- ✅ Deployment-ready config ---
const PORT = process.env.PORT || 8000;
const mongoDB = process.env.MONGODB_URI;
if (!mongoDB) {
  console.error('MONGODB_URI is not set!');
  process.exit(1);
}

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:3000']; // dev default

// --- ✅ Connect to MongoDB (local OR Atlas from MONGODB_URI) ---
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB.'));

// --- App + middleware ---
const app = express();
app.set('trust proxy', 1); // plays nice with Render/Heroku proxies
app.use(express.json());
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser tools (no Origin) and listed frontends
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('CORS blocked'));
    },
    credentials: true,
  })
);

app.get("/", function (req, res) {
    console.log("Get request received at '/'");
    res.send("Hello Phreddit!")
});

app.get("/get/posts", async (req, res)=> {
    console.log("Fetching Posts...");
    try {
        const posts = await Post.find().populate('postedBy').populate('commentIDs');
        res.json(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).send("Internal server error");
    }
    console.log("Done");
});

app.get("/get/communities", async (req, res)=> {
    console.log("Fetching Communities...");
    try {
        const communities = await Community.find().populate('members').populate('createdBy');
        res.json(communities);
    } catch (err) {
        console.error("Error fetching communities:", err);
        res.status(500).send("Internal server error");
    }
    console.log("Done");
});

app.get("/get/comments", async (req, res)=> {
    console.log("Fetching Comments...");
    try {
        const comments = await Comment.find().populate('commentIDs').populate('commentedBy');
        res.json(comments);
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).send("Internal server error");
    }
    console.log("Done");
});

app.get("/get/linkflairs", async (req, res)=> {
    console.log("Fetching LinkFlairs...");
    try {
        const flairs = await LinkFlair.find();
        res.json(flairs);
    } catch (err) {
        console.error("Error fetching link flairs:", err);
        res.status(500).send("Internal server error");
    }
    console.log("Done");
});

app.get("/get/users", async (req, res)=> {
    console.log("Fetching users...");
    try {
        const users = await User.find()
            .populate('communityIDs')
            .populate({
                path: 'postIDs',
                populate: { path: 'postedBy' } 
            })
            .populate('commentIDs');

        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).send("Internal server error");
    }
    console.log("Done");
});

function createComment(commentObj) {
    let newCommentDoc = new Comment({
        content: commentObj.content,
        commentedBy: commentObj.commentedBy,
        commentedDate: commentObj.commentedDate,
        commentIDs: commentObj.commentIDs,
    });
    return newCommentDoc.save();
}
app.post("/addcomment", async (req, res) => {
    const { content, commentedBy, commentedDate, parentID, parentType, userID } = req.body;
    try {
        const comment = { 
            content: content,
            commentIDs: [],
            commentedBy: commentedBy,
            commentedDate: commentedDate,
        };
        let commentRef = await createComment(comment);
        const update = {
            $push: {
                commentIDs: {
                    $each: [commentRef],
                    $position: 0
                }
            }
        };
        if (parentType === "post") {
            await Post.findByIdAndUpdate(parentID, update);
        } else if (parentType === "comment") {
            await Comment.findByIdAndUpdate(parentID, update);
        }
        await User.findByIdAndUpdate(userID, { $push: { commentIDs: commentRef } });
        res.status(201).json(commentRef);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create comment" });
    }
});

app.post("/editcomment", async (req, res) => {
    const { 
        content,
        commentID
    } = req.body;

    try {
        // Update the comment
        const updatedComment = await Comment.findByIdAndUpdate(
            commentID,
            {
                content
            },
            { new: true }
        );

        if (!updatedComment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Re-fetch populated comment for front-end use
        const populatedComment = await Comment.findById(commentID).populate('commentIDs').populate('commentedBy');

        res.status(200).json(populatedComment);
    } catch (err) {
        console.error("Error editing comment:", err);
        res.status(500).json({ error: "Failed to edit comment" });
    }
});

function createCommunity(communityObj) {
    let newCommunityDoc = new Community({
        name: communityObj.name,
        description: communityObj.description,
        postIDs: communityObj.postIDs,
        startDate: communityObj.startDate,
        members: communityObj.members,
        createdBy: communityObj.createdBy
    });
    return newCommunityDoc.save();
}

app.post("/addcommunity", async (req, res) => {
    const { name, description, members, startDate, createdBy, userID } = req.body;

    try {
        const community = {
            name: name,
            description: description,
            postIDs: [],
            startDate: startDate,
            members: members,
            memberCount: 1,
            createdBy: createdBy
        };
        let communityRef = await createCommunity(community);

        await User.findByIdAndUpdate(userID, { $push: { communityIDs: communityRef } });

        res.status(201).json(communityRef);
    } catch (err) {
        console.error("Error creating community:", err);
        res.status(500).json({ error: "Failed to create community" });
    }
});

app.post("/editcommunity", async (req, res) => {
    const { 
        name,
        description,
        communityID
    } = req.body;

    try {
        // Update the community
        const updatedCommunity = await Community.findByIdAndUpdate(
            communityID,
            {
                name,
                description,
            },
            { new: true }
        );

        if (!updatedCommunity) {
            return res.status(404).json({ error: "Community not found" });
        }

        // Re-fetch populated community for front-end use
        const populatedCommunity = await Community.findById(communityID).populate('members').populate('createdBy');

        res.status(200).json(populatedCommunity);
    } catch (err) {
        console.error("Error editing community:", err);
        res.status(500).json({ error: "Failed to edit community" });
    }
});

function createLinkFlair(linkFlairObj) {
    let newLinkFlairDoc = new LinkFlair({
        content: linkFlairObj.content,
    });
    return newLinkFlairDoc.save();
}

app.post("/addlinkflair", async (req, res) => {
    const { content } = req.body;
    try {
        const linkFlair = { 
            content: content, 
        };
        let flairRef = await createLinkFlair(linkFlair);

        res.status(201).json(flairRef);
    } catch (err) {
        res.status(500).json({ error: "Could not create flair" });
    }
});

function createPost(postObj) {
    let newPostDoc = new Post({
        title: postObj.title,
        content: postObj.content,
        postedBy: postObj.postedBy,
        postedDate: postObj.postedDate,
        views: postObj.views,
        linkFlairID: postObj.linkFlairID,
        commentIDs: postObj.commentIDs,
    });
    return newPostDoc.save();
}

app.post("/addpost", async (req, res) => {
    const { title, content, linkFlairID, postedBy, postedDate, communityID, userID } = req.body;
    try {
        const post = { 
            title: title,
            content: content,
            linkFlairID: linkFlairID,
            postedBy: postedBy,
            postedDate: postedDate,
            commentIDs: [],
            views: 0,
        };
        let postRef = await createPost(post);

        await Community.findByIdAndUpdate(communityID, { $push: { postIDs: postRef._id } });
        await User.findByIdAndUpdate(userID, { $push: { postIDs: postRef } });
        res.status(201).json(postRef);
    } catch (err) {
        res.status(500).json({ error: "Failed to create post" });
    }
});

app.post("/editpost", async (req, res) => {
    const { 
        title, 
        content, 
        linkFlairID, 
        postID, 
        newCommunityID, 
        oldCommunityID
    } = req.body;

    try {
        // Update the post
        const updatedPost = await Post.findByIdAndUpdate(
            postID,
            {
                title,
                content,
                linkFlairID,
            },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ error: "Post not found" });
        }

        // If community has changed, update references
        if (oldCommunityID !== newCommunityID) {
            await Community.findByIdAndUpdate(
                oldCommunityID,
                { $pull: { postIDs: postID } }
            );

            await Community.findByIdAndUpdate(
                newCommunityID,
                { $addToSet: { postIDs: postID } }
            );
        }

        // Re-fetch populated post for front-end use
        const populatedPost = await Post.findById(postID).populate('postedBy').populate('commentIDs');

        res.status(200).json(populatedPost);
    } catch (err) {
        console.error("Error editing post:", err);
        res.status(500).json({ error: "Failed to edit post! Try again." });
    }
});

function createUser(userObj) {
    let newUserDoc = new User({
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        communityIDs: userObj.communityIDs,
        postIDs: userObj.postIDs,
        commentIDs: userObj.commentIDs,
        startDate: userObj.startDate,
        reputation: userObj.reputation,
        displayName: userObj.displayName,
        email: userObj.email,
        hashPassword: userObj.hashPassword,
    });
    return newUserDoc.save();
}

app.post("/register", async (req, res) => {
    const { firstName, lastName, displayName, startDate, email, hashPassword } = req.body;
    try {
        const passwordHash = await bcrypt.hash(hashPassword, 10);
        const user = { 
            firstName: firstName,
            lastName: lastName,
            communityIDs: [],
            postIDs: [],
            commentIDs: [],
            startDate: startDate,
            reputation: 100,
            displayName: displayName,
            email: email,
            hashPassword: passwordHash,
        };
        let userRef = await createUser(user);
        res.status(201).json(userRef);
    } catch (err) {
        res.status(500).json({ error: "Failed to create user! Try again." });
    }
});

app.get("/posts/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        .populate({
            path: 'commentIDs',
            populate: {
            path: 'commentIDs', 
            populate: {
                path: 'commentIDs'
            }
            }
        }).populate('postedBy').exec();
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.json(post);
    } catch (err) {
        console.error("Error fetching post by ID:", err);
        res.status(500).json({ error: "Failed to fetch post" });
    }
});

app.post("/updateViews", async (req, res) => {
    const { views, postID } = req.body;
    // console.log(views);
    // console.log(postID);
    try {
        await Post.findByIdAndUpdate(
            postID,
            { views: views },
        );

        res.send("done");
    } catch (err) {
        res.status(500).json({ error: "Cannot update views" });
    }
});

app.post("/comments/updateVotes", async (req, res) => {
    const { repUserID, direction, votes, commentID, userUpVotes, userDownVotes, userID } = req.body;
    // console.log("Update vote request:", req.body);
    try {
        await Comment.findByIdAndUpdate(commentID, { votes: votes });

        let repUser = await User.findByIdAndUpdate(
            repUserID,
            {
              $inc: { reputation: direction },
            },
            { new: true }
        );
        let user = await User.findByIdAndUpdate(
            userID,
            {
              $set: {
                upvotedComments: userUpVotes,
                downvotedComments: userDownVotes
              }
            },
            { new: true }
        );
        // console.log("votes:", votes);
        // console.log("reputation:", repUser.reputation);
        // console.log("userUpVotes:", user.upvotedComments);
        res.send("done");
    } catch (err) {
        console.error("Vote update error:", err);
        res.status(500).json({ error: "Cannot update votes" });
    }
});



app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email })
        .populate('communityIDs')
        .populate({
            path: 'postIDs',
            populate: { path: 'postedBy' } 
        })
        .populate('commentIDs');;
        if (!user) return res.status(401).json({ error: "Invalid email! Try again." });

        const isMatch = await bcrypt.compare(password, user.hashPassword);
        if (!isMatch) return res.status(401).json({ error: "Invalid password. Try again." });

        res.status(200).json(user); // Only return safe fields
    } catch (err) {
        console.error("Login failed:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.post("/posts/updateVotes", async (req, res) => {
    const { repUserID, direction, votes, postID, userUpVotes, userDownVotes, userID } = req.body;
    console.log("Update vote request:", req.body);
    try {
        
        let post = await Post.findByIdAndUpdate(
            postID, 
            { votes: votes },
            { new: true }
        );
        // console.log(post.votes);
        let repUser = await User.findByIdAndUpdate(
            repUserID,
            {
              $inc: { reputation: direction },
            },
            { new: true }
        );
        
        let user = await User.findByIdAndUpdate(
            userID,
            {
              $set: {
                upvotedPosts: userUpVotes,
                downvotedPosts: userDownVotes
              }
            },
            { new: true }
        );
        // console.log("votes:", votes);
        // console.log("reputation:", repUser.reputation);
        // console.log("userUpVotes:", user.upvotedComments);
        res.send("done");
    } catch (err) {
        res.status(500).json({ error: "Cannot update votes" });
    }
});

app.post("/leavecommunity", async (req, res) => {
    const { communityID, userID } = req.body;
    try {
        await User.findByIdAndUpdate(
            userID,
            { $pull: { communityIDs: communityID } }
        );

        await Community.findByIdAndUpdate(
            communityID,
            { $pull: { members: userID }, $inc: { memberCount: -1 } }
        );
        const updatedCommunity = await Community.findById(communityID).populate('members').populate('createdBy');
        // console.log(updatedCommunity);
        const updatedUser = await User.findById(userID).populate('communityIDs').populate('postIDs').populate('commentIDs');

        res.status(200).json({ updatedCommunity, updatedUser });
    } catch (err) {
        console.error("Error leaving community:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/joincommunity", async (req, res) => {
    const { communityID, userID } = req.body;
    try {
        const communityObj = await Community.findById(communityID);
        const userObj = await User.findById(userID);

        await User.findByIdAndUpdate(
            userID,
            { $addToSet: { communityIDs: communityObj } }
        );

        await Community.findByIdAndUpdate(
            communityID,
            { $addToSet: { members: userObj }, $inc: { memberCount: 1 } }
        );

        const updatedCommunity = await Community.findById(communityID).populate('members').populate('createdBy');
        const updatedUser = await User.findById(userID).populate('communityIDs').populate('postIDs').populate('commentIDs');

        res.status(200).json({ updatedCommunity, updatedUser });
    } catch (err) {
        console.error("Error joining community:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        .populate('communityIDs')
        .populate({
            path: 'postIDs',
            populate: { path: 'postedBy' } 
        })
        .populate('commentIDs');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Error fetching user by ID:", err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

app.delete("/delete/user/:id", async (req, res) => {
    try {
        const userID = req.params.id;
        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ error: "User not found" });

        await Comment.deleteMany({ _id: { $in: user.commentIDs } });
        await Post.deleteMany({ _id: { $in: user.postIDs } });
        await Community.deleteMany({ createdBy: userID });

        await Community.updateMany(
            { members: userID },
            { $pull: { members: userID } }
        );

        await User.findByIdAndDelete(userID);
        res.status(200).json({ message: "User and associated data deleted successfully." });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ error: "Server error deleting user." });
    }
});

app.delete("/delete/comment/:id", async (req, res) => {
    const commentID = req.params.id;

    try {
        const deletedComments = new Set();
        async function collectChildComments(id) {
            const comment = await Comment.findById(id);
            if (!comment) return;

            deletedComments.add(comment._id.toString());

            for (const child of comment.commentIDs) {
                await collectChildComments(child._id || child);
            }
        }

        await collectChildComments(commentID);
        await Comment.deleteMany({ _id: { $in: Array.from(deletedComments) } });
        await User.updateMany(
            {},
            { $pull: { commentIDs: { $in: Array.from(deletedComments) } } }
        );
        await Post.updateMany(
            {},
            { $pull: { commentIDs: commentID } }
        );
        await Comment.updateMany(
            {},
            { $pull: { commentIDs: commentID } }
        );

        res.status(200).json({ message: "Comment and its replies deleted." });

    } catch (err) {
        console.error("Error deleting comment and replies:", err);
        res.status(500).json({ error: "Failed to delete comment." });
    }
});

app.delete("/delete/community/:id", async (req, res) => {
    try {
        const communityID = req.params.id;
        const community = await Community.findById(communityID);
        if (!community) return res.status(404).json({ error: "Community not found" });

        const deletedComments = new Set();

        // Recursively collect all nested comment IDs from a given comment
        async function collectChildComments(commentID) {
            const comment = await Comment.findById(commentID);
            if (!comment) return;
            deletedComments.add(comment._id.toString());
            for (const child of comment.commentIDs) {
                await collectChildComments(child._id || child);
            }
        }

        for (const postID of community.postIDs) {
            const post = await Post.findById(postID);
            if (post) {
                for (const commentID of post.commentIDs) {
                    await collectChildComments(commentID._id || commentID);
                }
                await Post.findByIdAndDelete(postID);
                await User.updateMany({}, { $pull: { postIDs: postID } });
            }
        }

        await Comment.deleteMany({ _id: { $in: Array.from(deletedComments) } });
        await User.updateMany({}, { $pull: { commentIDs: { $in: Array.from(deletedComments) } } });

        await User.updateMany({}, { $pull: { communityIDs: communityID } });
        await Community.findByIdAndDelete(communityID);

        res.status(200).json({ message: "Community, posts, and comments deleted." });

    } catch (err) {
        console.error("Error deleting community:", err);
        res.status(500).json({ error: "Server error deleting community." });
    }
});

// backend/server.js (append this route handler)

app.delete("/delete/post/:id", async (req, res) => {
    const postID = req.params.id;
    try {
        const post = await Post.findById(postID);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const deletedComments = new Set();

        async function collectNestedComments(commentID) {
            const comment = await Comment.findById(commentID);
            if (!comment) return;

            deletedComments.add(comment._id.toString());

            for (const child of comment.commentIDs) {
                await collectNestedComments(child._id || child);
            }
        }

        for (const commentID of post.commentIDs) {
            await collectNestedComments(commentID._id || commentID);
        }

        await Comment.deleteMany({ _id: { $in: Array.from(deletedComments) } });
        await User.updateMany({}, { $pull: { commentIDs: { $in: Array.from(deletedComments) } } });

        await Community.updateMany({}, { $pull: { postIDs: postID } });
        await User.updateMany({}, { $pull: { postIDs: postID } });

        await Post.findByIdAndDelete(postID);

        res.status(200).json({ message: "Post and related comments deleted successfully." });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ error: "Failed to delete post." });
    }
});

// --- Admin reset & reseed (protected) ---
app.post('/admin/reset', async (req, res) => {
  try {
    if (req.headers['x-admin-token'] !== process.env.ADMIN_RESET_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 1) wipe all data
    const del = await Promise.all([
      Community.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      LinkFlair.deleteMany({}),
      User.deleteMany({}),
    ]);

    // 2) reseed minimal data (admin + a flair + a community + a post)
    const [firstName, ...rest] = (process.env.SEED_ADMIN_NAME || 'Admin').split(' ');
    const lastName = rest.join(' ') || 'User';
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@gmail.com';
    const plainPw = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
    const pwHash = await bcrypt.hash(plainPw, 10);

    const admin = await new User({
      firstName,
      lastName,
      communityIDs: [],
      postIDs: [],
      commentIDs: [],
      startDate: new Date('2000-01-01T05:00:00Z'),
      reputation: 1000,
      displayName: process.env.SEED_ADMIN_NAME || 'Admin',
      email,
      hashPassword: pwHash,
      isAdmin: true,
      upvotedComments: [],
      downvotedComments: [],
      upvotedPosts: [],
      downvotedPosts: []
    }).save();

    const flair = await new LinkFlair({ content: 'General' }).save();

    const community = await new Community({
      name: 'Admin Channel',
      description: 'For Testing',
      postIDs: [],
      startDate: new Date('2017-01-04T13:32:00Z'),
      members: [admin._id],
      memberCount: 1,
      createdBy: admin._id
    }).save();

    const post = await new Post({
      title: 'Admin',
      content: 'Admin testing',
      linkFlairID: flair._id,
      postedBy: admin._id,
      postedDate: new Date('2023-09-09T18:24:00Z'),
      commentIDs: [],
      views: 0,
      votes: 0
    }).save();

    // wire refs
    await User.findByIdAndUpdate(admin._id, { $push: { communityIDs: community._id, postIDs: post._id } });
    await Community.findByIdAndUpdate(community._id, { $push: { postIDs: post._id } });

    res.json({
      dropped: {
        communities: del[0].deletedCount,
        posts: del[1].deletedCount,
        comments: del[2].deletedCount,
        flairs: del[3].deletedCount,
        users: del[4].deletedCount
      },
      admin: { email, displayName: admin.displayName },
      community: { id: community._id, name: community.name },
      post: { id: post._id, title: post.title }
    });
  } catch (e) {
    console.error('Admin reset failed:', e);
    res.status(500).json({ error: 'Reset failed' });
  }
});



app.listen(PORT, () => console.log(`Server listening on port ${PORT}...`));

