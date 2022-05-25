import './NavigationBar.css'
import { useEffect, useState } from 'react';
import { CenteringFlexBox } from 'common/components'

function NavBarItem(props: any | { route: String }) {
    let id = props.isSelected ? "selected-navbar-item" : undefined;
    const isOpen = props.isOpen
    let route = { href: props.route }
    return (
        <a id={id} {...route} className={`nav-item-link ${isOpen ? 'nav-item-link-open' : 'nav-item-link-closed'}`}>
            <div className="nav-item">
                <div><span className={`fas fa-${props.icon}`}></span></div>
                {isOpen &&
                    <div className="nav-item-txt-box">{props.text}</div>
                }
            </div>
        </a>
    );
}


const setMainMargin = (mgl: String) => {
    // @ts-ignore
    document.getElementById("main").style.marginLeft = mgl;
}

export default function NavigationBar() {
    const [isOpen, setOpen] = useState(false)
    useEffect(() => {
        const w = getComputedStyle(document.documentElement).getPropertyValue("--navbar-width")
        if (!isOpen) setMainMargin("75px")
        else setMainMargin(w)
    })
    return (
        <div id="navbar" className={`sidenav ${isOpen ? 'sidenav-open' : 'sidenav-closed'}`}>
            {!isOpen &&
                <>
                    <CenteringFlexBox className="openbtn" onClick={() => setOpen(true)}>
                        &#9776;
                    </CenteringFlexBox>
                    <div id="openbtn-buffer"></div>
                </>
            }
            {isOpen && <>
                <div id="upper-nav">
                    <div className="side">
                        <button className="closebtn" onClick={() => setOpen(false)} >&times;</button>
                    </div>
                </div>
                <div className="user-prof">
                    <span className="fas fa-user"></span>
                    <div>Test Username</div>
                </div>
            </>}
            <div id="navbar-menu" className={`${isOpen ? 'navbar-menu-open' : 'navbar-menu-closed'}`}>
                <div style={{ flexGrow: 1 }}></div>
                <NavBarItem isOpen={isOpen} isSelected icon="list" text="Protocol List" route="/list" />
                <NavBarItem isOpen={isOpen} icon="edit" text="Create Protocol" />
                <NavBarItem isOpen={isOpen} icon="history" text="History" route="/history" />
                <NavBarItem isOpen={isOpen} icon="user-cog" text="Profile Settings" />
                <NavBarItem isOpen={isOpen} icon="cogs" text="System Settings" />
                <NavBarItem isOpen={isOpen} icon="file" text="Reports" />
                <NavBarItem isOpen={isOpen} icon="sign-out-alt" text="Log out" route="/" />
                <div style={{ flexGrow: 2 }}></div>
            </div>
        </div>
    )
}

