import React from "react";
import { NavLink } from "react-router-dom";


export function Header() {
    return (
        <div className="main-header-wrapper">
            <header className="main-header">
                <h1 className="e-shop">e-sh<span className="colored">o</span>p</h1>
                <div className="horizontal-line"></div>
                <div className="nav-btn-container">
                    <NavLink className="nav-btn" exact to={`/`}>home</NavLink>
                </div>
            </header>
        </div>
    )
}