import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="layout">
            <Navbar />
            <div className="content-wrapper">
                <Sidebar />
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
