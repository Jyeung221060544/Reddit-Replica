import React, { useContext } from "react";
import { PhredditContext } from "./context";

import axios from 'axios';

function WelcomePageView() {
    const {
        showPageFunctions: { currentPage }
    } = useContext(PhredditContext);
    return (
        <div className="" id="welcome-page" style={{ display: currentPage === 'welcome-page' ? 'block' : 'none'}}>
            <div className="container" id="welcome-page-inner">
                <Contents />
            </div>
        </div>
    );
}

function Contents() {
    return(
        <div id="welcome-body">
            <Title/>
            <div id="welcome-button-wrapper">
                <RegisterButton />
                <LoginButton />
                <GuestButton />
            </div>
        </div>
    );
}

function Title() {
    return(
        <section>
            <h1 className="welcome-title">Welcome to Phreddit.</h1> <br></br>
            <h3 id="welcome-joke"> where Reddit is Premium</h3>
        </section>
    );
}

function RegisterButton() {
    const {
        showPageFunctions: {handleShowRegisterPage}
    } = useContext(PhredditContext);

    return (
        <div className="welcome-button-container">
            <input
                id="register-button"
                className="welcome-button"
                type="button"
                value="Register"
                onClick={handleShowRegisterPage}
            />
        </div>
    );
}


function LoginButton() {
    const {
        showPageFunctions: {handleShowHomePage, handleShowLoginPage},
        loginState: { login }
    } = useContext(PhredditContext);
    return(
        <div className="welcome-button-container">
            <input
                id="login-button"
                className="welcome-button"
                type="button"
                value="Login"
                onClick={login===true?handleShowHomePage:handleShowLoginPage}
            />
        </div>
    );
}

function GuestButton() {
    const {
        showPageFunctions: { handleShowHomePage },
        userState: { setUser },
        loginState: { setLogin }
    } = useContext(PhredditContext);
    const handleClickButton = () => {
        setLogin(false);
        setUser(null);
        handleShowHomePage();
    }
    return(
        <div className="welcome-button-container">
            <input
                id="guest-button"
                className="welcome-button"
                type="button"
                value="Continue as Guest"
                onClick={handleClickButton}
            />
        </div>
    );
}

export { WelcomePageView };