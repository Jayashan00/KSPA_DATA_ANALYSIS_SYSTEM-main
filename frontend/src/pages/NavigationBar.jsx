import React, { useRef, useEffect } from "react";
import './NavigationBar.css'; // ✅ plain CSS
import {Link, useNavigate} from 'react-router-dom';

function NavigationBar() {
    const menu = useRef();
    const navbar = useRef();

    const menuHandler = () => {
        menu.current.classList.toggle("shownNav");
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                navbar.current.classList.add("navbarScroll");
            } else {
                navbar.current.classList.remove("navbarScroll");
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const Navigate = useNavigate();

    return (
        <div className="nav_wrapper" ref={navbar}>
            <div className="logo">
                <span>KSPA </span>PAPER MILL
            </div>

            {/* <ul ref={menu}>
                <li>Home</li>
                <li>Services</li>
                <li>Rooms</li>
                <li>FoodMenu</li>
                <li>Amenities</li>
                <li>Testimonial</li>
                <li>About Us</li>
            </ul> */}

            <div className="Nav_btns">
                <button onClick={()=>Navigate('/Login')}>LogIn</button>
                {/* <i
                    className="ri-menu-4-line"
                    id="bars"
                    onClick={menuHandler}
                ></i> */}
            </div>
        </div>
    );
}

export default NavigationBar;
