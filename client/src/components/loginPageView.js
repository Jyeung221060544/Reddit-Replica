import React, { useContext, useState } from "react";
import { PhredditContext } from "./context";
import { arrayOfPostCommentsTime } from "../helperFunctions";
import axios from 'axios';
import ConfirmWindow from "./confirm";

function LoginPageView() {
    const {
        showPageFunctions: { currentPage }
    } = useContext(PhredditContext);
    return (
        <div className="" id="login-page" style={{ display: currentPage === 'login-page' ? 'block' : 'none'}}>
            <div className="container" id="login-page-inner">
                <Contents />
            </div>
        </div>
    );
      
}

function Contents() {
    return (
        <div id="login-body">
            <Title />
            <div id="login-wrapper">
                <EmailInquiry/>
                <PasswordInquiry/>
                <SubmitButton />
            </div>
        </div>
    );
}

function Title() {
    return (
        <div>
            <h1 className='welcome-title'>Login</h1>
        </div>
    );
}

function EmailInquiry() {
    return (
        <div className="input-container">
            <br />
            <label className="label">Email * </label>
            <input id="login-email-input" className="input-textbox"type="text" />
            {/*<p className="input-note">Max Length: 100 characters</p>*/}
        </div>
    );
}

function PasswordInquiry() {
    return (
        <div className="input-container">
            <br />
            <label className="label">Password * </label>
            <input id="login-password-input" className="input-textbox"type="text" />
            {/*<p className="input-note">Max Length: 100 characters</p>*/}
        </div>
    );
}


function SubmitButton() {
    const {
        userState: {setUser},
        showPageFunctions: { handleShowHomePage },
        loginState: {setLogin},
    } = useContext(PhredditContext);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");

    const logingin = async () => {
        let email = document.getElementById("login-email-input").value;
        let password = document.getElementById("login-password-input").value;
        document.getElementById("login-email-input").value = "";
        document.getElementById("login-password-input").value = "";

        try {
            const response = await axios.post("http://localhost:8000/login", {
                email,
                password
            });

            const user = response.data;
            setUser(user);
            setLogin(true);
            handleShowHomePage();
        } catch (err) {
            const message = err.response?.data?.error || "Login failed.";
            setConfirmMessage(message);
            setShowConfirm(true);
            console.error("Login failed:", message);
        }
    };

    return (
        <>
        <div className="button-container">
            <input id="create-post-button-input" className="submit-button" type="button"  value="Login" onClick={logingin}/>
        </div>
        {showConfirm && (
            <ConfirmWindow
                title="Error Logging In"
                message={confirmMessage}
                onConfirm={() => setShowConfirm(false)}
                onCancel={() => setShowConfirm(false)}
                confirmButtonMessage="Okay"
            />
        )}
        </>
    );

}
export { LoginPageView };