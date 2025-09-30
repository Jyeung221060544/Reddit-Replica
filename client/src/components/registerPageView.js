
import React, { useContext, useState } from "react";
import { PhredditContext } from "./context";
import { arrayOfPostCommentsTime } from "../helperFunctions";
import axios from 'axios';
import ConfirmWindow from "./confirm";

function RegisterPageView() {
    const {
        showPageFunctions: { currentPage }
    } = useContext(PhredditContext);
    return (
        <div className="" id="register-page" style={{ display: currentPage === 'register-page' ? 'block' : 'none'}}>
            <div className="container" id="register-page-inner">
                <Contents />
            </div>
        </div>
    );
      
}

function Contents() {
    return (
        <div id="register-body">
            <Title />
            <FirstNameInquiry />
            <LastNameInquiry />
            <EmailInquiry/>
            <DisplayNameInquiry/>
            <SecretPasswordInquiry/>
            <PasswordConfirmationInquiry/>
            <SubmitButton />
        </div>
    );
}

function Title() {
    return (
        <div>
            <h1 className='welcome-title'>Register</h1>
        </div>
    );
}

function FirstNameInquiry() {
    return (
        <div className="input-container">
            <br />
            <label className="label">First Name * </label>
            <input id="register-firstname-input" className="input-textbox"type="text" />
            {/*<p className="input-note">Max Length: 100 characters</p>*/}
        </div>
    );
}

function LastNameInquiry() {
    return (
        <div className="input-container">
            <br />
            <label className="label">Last Name * </label>
            <input id="register-lastname-input" className="input-textbox"type="text" />
            {/*<p className="input-note">Max Length: 100 characters</p>*/}
        </div>
    );
}

function EmailInquiry() {
    return (
        <div className="input-container">
            <br />
            <label className="label">Email * </label>
            <input id="register-email-input" className="input-textbox"type="text" />
            {/*<p className="input-note">Max Length: 100 characters</p>*/}
        </div>
    );
}

function DisplayNameInquiry() {
    return (
        <div className="input-container">
            <br />
            <label className="label">Display Name * </label>
            <input id="register-displayname-input" className="input-textbox"type="text" />
            {/*<p className="input-note">Max Length: 100 characters</p>*/}
        </div>
    );
}

function SecretPasswordInquiry() {
    return (
        <div className="input-container">
            <br />
            <label className="label">Secret Password * </label>
            <input id="register-password-input" className="input-textbox"type="text" />
            {/*<p className="input-note">Max Length: 100 characters</p>*/}
        </div>
    );
}

function PasswordConfirmationInquiry() {
    return (
        <div className="input-container">
            <br />
            <label className="label">Confirm Secret Password * </label>
            <input id="register-passwordconfirmation-input" className="input-textbox"type="text" />
            {/*<p className="input-note">Max Length: 100 characters</p>*/}
        </div>
    );
}


function SubmitButton() {
    const {
        userState: {users, setUsers},
        showPageFunctions: { handleShowWelcomePage },
    } = useContext(PhredditContext);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");

    const makeUser = async () => {
        let firstName = document.getElementById("register-firstname-input").value;
        document.getElementById("register-firstname-input").value = "";
        let lastName = document.getElementById("register-lastname-input").value;
        document.getElementById("register-lastname-input").value = "";
        let displayName = document.getElementById("register-displayname-input").value;
        document.getElementById("register-displayname-input").value = "";
        let email = document.getElementById("register-email-input").value;
        document.getElementById("register-email-input").value = "";
        let password1 = document.getElementById("register-password-input").value;
        document.getElementById("register-password-input").value = "";
        let password2 = document.getElementById("register-passwordconfirmation-input").value;
        document.getElementById("register-passwordconfirmation-input").value = "";

        let build = "";
        let error = false;
        if(!email.endsWith("@gmail.com")){
            build += "Invalid Email!\n";
            error = true;
        }
        if(password1.includes(firstName) || password1.includes(lastName) || password1.includes(displayName) || password1.includes(email.substring(0,email.indexOf("@")))){
            build += "Password cannot contain your first or last name, display name, or email ID!\n";
            error = true;
        }
        if(password1 != password2){
            build += "Passwords don't match!\n";
            error = true;
        }
        for(let i = 0; i < users.length; i++){
            if(email == users[i].email || displayName == users[i].displayName){
                if(email == users[i].email){
                    build += "Email already exists!\n";
                    error = true;
                }
                if(displayName == users[i].displayName){
                    build += "Display name taken!\n";
                    error = true;
                }
                break;
            }
        }
        if(error){
            setConfirmMessage(build+"\nTry Again!");
            setShowConfirm(true);
        } else {
            try {
                const response = await axios.post("http://127.0.0.1:8000/register", {
                    firstName: firstName,
                    lastName: lastName,
                    displayName: displayName,
                    startDate: new Date(),
                    email: email,
                    hashPassword: password1 
                });
                console.log("New User Data: "+ response.data)
                const newUser = response.data;
                setUsers(prev => [...prev, newUser]);
                handleShowWelcomePage();
            } catch (err) {
                console.error("Error creating user:", err);
                alert("Failed to create user.");
            }
        }

    };
    return (
        <>
        <div className="button-container">
            <input id="create-post-button-input" className="submit-button" type="button"  value="Register" onClick={makeUser}/>
        </div>
        {showConfirm && (
            <ConfirmWindow
                title="Error Registering User"
                message={confirmMessage}
                onConfirm={() => setShowConfirm(false)}
                onCancel={() => setShowConfirm(false)}
                confirmButtonMessage="Okay"
            />
        )}
        </>
    );

}

export { RegisterPageView };