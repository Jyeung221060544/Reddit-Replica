import React, { useContext, useState, useEffect } from "react";
import { PhredditContext } from "./context";
import api from '../api';
import ConfirmWindow from "./confirm";

function EditCommunity() {
    const {
        showPageFunctions: { currentPage },
        editState:{editUser}
    } = useContext(PhredditContext);
    return (
        <div className="container main" id="create-community-page" style={{ display: currentPage === 'edit-community' ? 'block' : 'none', width:editUser?"100%":"100%", height:editUser?"100%":"100%"}}>
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
                <h2>Edit a Community</h2>
            </div>
            <CommunityNameInquiry />
            <DescriptionInquiry />
            {/* <UsernameInquiry /> */}
            <div style={{display:"flex", gap:"20px"}}>
                <SubmitButton />
                <DeleteButton/>
                <CancelEditButton />
            </div>
        </div>
    );
}

function CommunityNameInquiry() {
    const {
        editState:{editCommunity},
        showPageFunctions: {currentPage}
    } = useContext(PhredditContext);
    const [name, setName] = useState(editCommunity?.name)
    useEffect(()=> {
        if(editCommunity?.name) {
            setName(editCommunity?.name);
        }
    }, [editCommunity, currentPage]);

    return (
        <div className="input-container">
            <p className="label">Community Name *</p>
            <input 
                id="edit-community-name-input" 
                className="input-textbox" 
                type="text"
                value={name || ""}
                onChange={(e)=>{setName(e.target.value)}}
            />
            <p className="input-note">Max Length: 100 characters</p>
        </div>
    );
}

function DescriptionInquiry() {
    const {
        editState:{editCommunity},
        showPageFunctions: {currentPage}
    } = useContext(PhredditContext);
    const [description, setDescription] = useState(editCommunity?.description)
    useEffect(()=> {
        if(editCommunity?.description) {
            setDescription(editCommunity?.description);
        }
    }, [editCommunity, currentPage]);
    return (
        <div className="input-container">
            <p className="label">Description *</p>
            <textarea 
                id="edit-community-description-input" 
                className="input-textbox" 
                rows="5" 
                cols="33"
                value={description || ""}
                onChange={(e)=>{setDescription(e.target.value)}}
            ></textarea>
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
        showPageFunctions: { showCommunityPage, currentPage },
        communityState: { communities, setCommunities },
        userState: { user, setUser },
        editState: { editCommunity, setEditCommunity }
    } = useContext(PhredditContext);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");

    const [oldCommunityName, setOldCommunityName] = useState("");
    useEffect(()=>{
        if(editCommunity){
            setOldCommunityName(editCommunity.name);
        }
    }, [editCommunity, currentPage]);
    const makeCommunity = async () => {
        let community_name = document.getElementById("edit-community-name-input").value;
        let community_description = document.getElementById("edit-community-description-input").value;
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
            if(communities[i].name != oldCommunityName){
                if(community_name == communities[i].name){
                    build += "Community Name Taken\n";
                    communityExisits = true;
                    break;
                }
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
          
              setConfirmMessage(build+"\nTry again!");
              setShowConfirm(true);
              return;
        } else {
            try {
                const response = await api.post("/editcommunity", {
                    name: community_name,
                    description: community_description,
                    communityID: editCommunity._id
                });

                const newCommunity = response.data;
                setEditCommunity(newCommunity);
                
                const updatedCommunities = await api.get("/get/communities");
                setCommunities(updatedCommunities.data);

                const updatedUserResponse = await api.get(`/user/${user._id}`);
                setUser(updatedUserResponse.data);

                showCommunityPage(newCommunity);
            } catch (err) {
                console.error("Failed to create community:", err);
                alert("Something went wrong while creating the community.");
            }
        }
    }
    return (
        <>
        <div className="button-container">
            <input id="create-community-button-input" className="submit-button" type="button"  value="Edit Community" onClick={makeCommunity}/>
        </div>
        {showConfirm && (
            <ConfirmWindow
                title="Error Editing Community"
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
        communityState: { setCommunities },
        userState: { user, setUser },
        editState: { editCommunity },
        showPageFunctions: { handleShowUserProfilePage },
    } = useContext(PhredditContext);

    const [showConfirm, setShowConfirm] = useState(false);

    const deleteCommunity = async () => {
        try {
            const res = await api.delete(`/delete/community/${editCommunity._id}`);
            if (res.status === 200) {
                const updatedCommunities = await api.get("/get/communities");
                const updatedUser = await api.get(`/user/${user._id}`);
                setCommunities(updatedCommunities.data);
                setUser(updatedUser.data);
                handleShowUserProfilePage();
            } else {
                alert("Error deleting community.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete community.");
        }
    };

    return (
        <>
            <div className="button-container">
                <input
                    id="create-post-button-input"
                    className="submit-button"
                    type="button"
                    value="Delete Community"
                    onClick={() => setShowConfirm(true)} // ✅ trigger confirm
                />
            </div>
            {showConfirm && (
                <ConfirmWindow
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete ${editCommunity.name} and all its content?`}
                    onConfirm={() => {
                        deleteCommunity();
                        setShowConfirm(false);
                    }}
                    onCancel={() => setShowConfirm(false)}
                    confirmButtonMessage="Confirm"
                />
            )}
        </>
    );
}


export { EditCommunity }