
# Phreddit Application 

## Instructions to Setup and Run Project

1. Visit [this GitHub repository](https://github.com/Jyeung221060544/Reddit-Replica) and fork a copy to your GitHub repository.
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
            - `npm install`
            - `npm install express`
            - `npm install mongoose`
            - `npm install nodemon`
            - `npm install bcrypt`
            - `node init.js mongodb://127.0.0.1:27017/phreddit [Admin's Email Address] [Admin's Display Name] [Admin's Password]`
            - `nodemon server/server.js`
            - Note: Whenever you want to reset the database, run `node reset.js` and then repeat the 2 steps above!
            - Note: Email addresses must ended in @gmail.com.
6. Go back to client `cd client` and run `npm start`.
7. You are all ready to go! Have reddting with premium!