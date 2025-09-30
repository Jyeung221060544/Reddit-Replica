import React, { useContext, useState } from "react";
import { Divider } from "./classWideComponents";
import { createCommunityTab, loginRestrictionError } from "../helperFunctions";
import { PhredditContext } from "./context";
import ConfirmWindow from "./confirm";
function NavBar() {
    const {
        showPageFunctions: { currentPage },
        editState: {editUser}
    } = useContext(PhredditContext);
    return (
        <nav className="container" style={{ display: (currentPage === 'welcome-page'||currentPage==='login-page'||currentPage==='register-page'||editUser)? 'none' : 'block'}}>
            <HomeButton />
            <br />
            <Divider />
            <br />
            <CommunitiesNav/>
        </nav>
    );
}

function HomeButton() {
    const {
        showPageFunctions: { handleShowHomePage, currentPage }
    } = useContext(PhredditContext);
    return (
        <div className="tabs" id="home-nav" style={{backgroundColor: (currentPage==="home" ? "#FF4500" : null), color: (currentPage==="home" ? "white" : null)}} onClick={handleShowHomePage}>
            <i className="material-icons">home</i>
            <h3>Home</h3>
        </div>
    );
}

function CommunitiesNav() {
    return (
        <div>
            <div>
                <h3 className="section-header" style={{fontWeight: '600'}}>COMMUNITIES</h3>
            </div>
            <CreateCommunityButton />
            <ListofCommunities />
        </div>
    );
}

function CreateCommunityButton() {
    const {
        loginState: { login },
        showPageFunctions: { handleShowCreateCommunityPage, currentPage }
    } = useContext(PhredditContext);

     const [showConfirm, setShowConfirm] = useState(false);
    
        const handleClick = () => {
            if (login) {
                handleShowCreateCommunityPage();
            } else {
                setShowConfirm(true);
            }
        };
    return (
        <>
        <div>
            {console.log("Current Page: " + currentPage)}
        <div className="tabs" id="create-community" 
            style={{backgroundColor: (currentPage==="create-community" ? "#FF4500" : null), color: (currentPage==="create-community" ? "white" : null)}} 
            onClick={handleClick}> 
            <i className="material-icons">add</i>
            <h3 style={{backgroundColor: (currentPage==="create-community" ? "#FF4500" : null), color: (currentPage==="create-community" ? "white" : null)}} >Create Community</h3>
        </div>
        </div>
        {showConfirm && (
            <ConfirmWindow
                title="Login Required"
                message="Please login to continue!"
                onConfirm={() => setShowConfirm(false)}
                onCancel={() => setShowConfirm(false)}
                confirmButtonMessage="Okay"
            />
        )}
        </>
    );
}

function ListofCommunities() {
    const {
        communityState: { communities },
        loginState: {login},
        userState: { user },
    } = useContext(PhredditContext);
    const [isActive, setIsActive] = useState(false);
    const toggleList = () => setIsActive(!isActive);

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
        <div className="tabs" id="list-communities">
            <div id="community-list-button-container" onClick={toggleList}>
                <i className="material-icons">list</i>
                <input id="community-list-button" type="button"  value="List of Communities" style={{display:'flex', flexShrink: 1, minWidth: 0}}/>
            </div>
             {isActive && (
                <div className="community-list" style={{width:"100%"}}>
                    {sortCommunityByUser.map((community)=> (
                        <CommunityTab key={community._id} community={community} />
                    ))}
                </div>
             )}
        </div>
    );
}

/**Pass props here (destructured) */
function CommunityTab({community}) {
    const {
        showPageFunctions: { showCommunityPage, currentPage },
        communityState: { community: currentCommunity }
      } = useContext(PhredditContext);
    return (
        <div>
            {createCommunityTab(community, showCommunityPage, currentCommunity, currentPage)}
        </div>
    );
}

export { NavBar };