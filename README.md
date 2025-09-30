
# Phreddit Application 

## Instructions to Setup and Run Project

1. Visit [this GitHub repository](https://github.com/ckane-sbu-s25-cse316/project-s25-redditpremium4) and fork a copy to your GitHub repository.
2. Clone the project onto your local machine. Make sure it is in a place where it is easily accessible.   
3. The following dependencies are necessary for you to run this application successfully:  
   - Node.js (React)
   - Express  
   - MongoDB  
   - bcrypt  
   - axios  
4. The following are step-by-step instructions for installation of necessary dependencies:
    - Install Node.js
        - Follow [Node.js' official instructions](https://nodejs.org/en/download) for your platform
        - Ensure `node` and `npm` are available in your system's PATH
    - Install MongoDB
        - Follow [MongoDB's official instructions](https://www.mongodb.com/docs/manual/installation/?msockid=17e9116122d96ece042604fe23d86f8c) for your platform
        - Also install the MongoDB Shell from [Mongod's official instructions](https://www.mongodb.com/docs/mongodb-shell/install/#std-label-mdb-shell-install)
        - Ensure `mongod` and `mongosh` are available in your system's PATH
5. Open the terminal and navigate to the directory where your application is located.
    - Enter `cd client`
        - Install the following dependencies: `npm install` and `npm install axios`
    - On the server-side, `cd server`
        - Install the following dependencies: `npm install`, `npm install express mongoose bcrypt`
        - After installing the necessary dependencies, run 
            - `node init.js mongodb://127.0.0.1:27017/phreddit [Admin's Email Address] [Admin's Display Name] [Admin's Password]`
            - `nodemon server/server.js`
            - Note: Whenever you want to reset the database, run `node reset.js` and then repeat the 2 steps above!
            - Note: Email addresses must ended in @gmail.com.
6. Go back to client `cd client` and run `npm start`.
7. You are all ready to go! Have reddting with premium!



## Team Member 1 Contribution
### Jason Yeung
1. UML diagrams
2. Implemented all helper function logics in client/helperfunctions.js
3. Implemented the following:
    - Create Account
    - Login Function
    - Guest Functions
    - Upvotes
    - Sort by Communities/Newest/Oldest/Active Posts
    - Joining and Leaving Community
    - Search Functions/Algorithms
    - Create Post/Community/Comment
4. Setup Project
## Team Member 2 Contribution
### Vivian Zhu

1. Defined schemas
2. Implemented all CSS, React Components, and Pages (frontend design)
3. Implemented the following:
    - Logout Function
    - Guest Functions
    - Downvotes
    - User Profile Page View
    - Confirm Windows
    - Edit Post/Community/Comment
    - Delete Post/Community/Comment
4. README.md
