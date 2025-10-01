import React, { useContext, useState } from "react";
import { PhredditContext } from "./context";
import api from '../api';
import ConfirmWindow from "./confirm";
function CreateCommunityPageView() {
    const {
        showPageFunctions: { currentPage }
    } = useContext(PhredditContext);
    return (
        <div className="container main" id="create-community-page" style={{ display: currentPage === 'create-community' ? 'block' : 'none'}}>
            <div className="container" id="create-community-page-inner">
                <Contents />
            </div>
        </div>
    );
}

function Contents() {
    return (
        <div id="create-community-body">
            <div className="create-title" id="content-banner">
                <h2>Create a New Community</h2>
            </div>
            <CommunityNameInquiry />
            <DescriptionInquiry />
            {/* <UsernameInquiry /> */}
            <SubmitButton />
        </div>
    );
}

function CommunityNameInquiry() {
    return (
        <div className="input-container">
            <p className="label">Community Name *</p>
            <input id="create-community-name-input" className="input-textbox" type="text" />
            <p className="input-note">Max Length: 100 characters</p>
        </div>
    );
}

function DescriptionInquiry() {
    return (
        <div className="input-container">
            <p className="label">Description *</p>
            <textarea id="create-community-description-input" className="input-textbox" rows="5" cols="33"></textarea>
            <p className="input-note">Max Length: 500 characters</p>
        </div>
    );
}

function UsernameInquiry() {
    const {
        userState: {user}
    } = useContext(PhredditContext);
    return (
        <div className="input-container">
            <p className="label">Username *</p>
            <input id="create-community-username-input" className="input-textbox" type="text" value={(user===null)?"":user.displayName}/>
        </div>
    );
}
function SubmitButton() {
    const {
        showPageFunctions: { showCommunityPage },
        communityState: { communities, setCommunities },
        userState: {user, setUser, setUsers}
    } = useContext(PhredditContext);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");

    const makeCommunity = async () => {
        let community_name = document.getElementById("create-community-name-input").value;
        document.getElementById("create-community-name-input").value = "";
        let community_description = document.getElementById("create-community-description-input").value;
        document.getElementById("create-community-description-input").value = "";
        let community_user = user.displayName;
        // document.getElementById("create-community-username-input").value = "";
        var build = "";

        //Error checks on hyperlinks
        const pattern = /\[(.*?)\]\((.*?)\)/g;
        const hyperlinks = [...community_description.matchAll(pattern)];
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
        var communityExisits = false;
        for(let i = 0; i < communities.length; i++){
            if(community_name == communities[i].name){
                build += "Community Name Taken\n";
                communityExisits = true;
                break;
            }
        }

        if(community_name == "" || community_name.length > 100 || community_description == "" || community_description.length > 500 || community_user == "" || hyperlinkIssue || communityExisits){
            
            if(community_name === "") {
              build += "Please enter a community name!\n";
            }
            if(community_name.length > 100) {
              build += "Community name exceeded maximum capacity!\n";
            }
            if(community_description == "") {
              build += "Please enter a community description!\n";
            }
            if(community_description.length > 500) {
              build += "Community description exceeded maximum capacity!\n";
            }
            if(community_user == "") {
              build += "Please enter a username!\n";
            }
        
            setConfirmMessage(build);
            setShowConfirm(true);
            return;
        } else {
            try {
                const response = await api.post("/addcommunity", {
                    name: community_name,
                    description: community_description,
                    members: [user],
                    startDate: new Date(),
                    createdBy: user,
                    userID: user._id
                });
                console.log("New Community Data: "+ response.data)
                const newCommunity = response.data;
                setCommunities(prev => [...prev, newCommunity]);
                showCommunityPage(newCommunity);
                const [usersRes, updatedUserResponse] = await Promise.all([
                    api.get("/get/users"),
                    api.get(`/user/${user._id}`)
                  ]);
                setUsers(usersRes.data);
                setUser(updatedUserResponse.data);
            } catch (err) {
                console.error("Failed to create community:", err);
                setConfirmMessage("Something went wrong while creating the community.");
                setShowConfirm(true);
            }
        }
    }
    return (
        <>
        <div className="button-container">
            <input id="create-community-button-input" className="submit-button" type="button"  value="Engender Community" onClick={makeCommunity}/>
        </div>
        {showConfirm && (
            <ConfirmWindow
                title="Error Creating Community"
                message={confirmMessage}
                onConfirm={() => setShowConfirm(false)}
                onCancel={() => setShowConfirm(false)}
                confirmButtonMessage="Okay"
            />
        )}
        </>
    );
}

export { CreateCommunityPageView }