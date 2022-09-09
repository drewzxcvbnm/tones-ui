import React, { useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import MainKeyboard from 'ProtocolList/MainKeyboard';
import "./Login.css"

export default function Login() {

    function credReducer (state: any, action: { type: any; payload: any; }){
        switch(action.type){
            case "username": return { ...state, username: [action.payload]}
            case "password": return { ...state, password: [action.payload]}
            default: break;
        }
    }

    const [credentials, setCredentials] = useReducer(credReducer, {username:"", password:""});
    const [input, setInput] = useState("");
    const [showKeyboard, setShowKeyboard] = useState(false);

    const handleInput = (e:React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            type: e.target.name,
            payload: e.target.value
        })
    }

    const handleFocus  = (e:React.FocusEvent<HTMLInputElement>) => {
        console.log("Focus event!!!");
        setInput(e.target.name);
        console.log("Name: "+e.target.name)
        console.log("Value: "+e.target.value)
        console.log("The input state will not be rerendered for now: "+input);
        setShowKeyboard(true)
    }

    return (
        <div id="background">
            <div className="login-form" >
                <form>
                    <label htmlFor="username">
                        <input  id="username" type="text" placeholder="Enter Username" name="username" 
                        value={credentials.username} onChange={handleInput} required 
                        onFocus={handleFocus}></input>
                        <span>Username</span>
                    </label>
                    <label htmlFor="password">
                        <input id="password" type="password" placeholder="Enter Password" name="password" 
                        value={credentials.password} onChange={handleInput} required
                        onFocus={handleFocus}></input>
                        <span>Password</span>
                    </label>
                    <Link to={'/list'}>
                        <button type="submit">Login</button>
                    </Link>
                </form>
            </div >
            <MainKeyboard inputValue={credentials[`${input}`]?.toString()}
                        show={showKeyboard} 
                        showSetter={setShowKeyboard} 
                        inputSetter={(inp) => {
                            let elem = document.getElementsByName(`${input}`)[0] as HTMLInputElement;
                            setCredentials({
                                type: input,
                                payload: inp
                            })
                        }}
            />
        </div>
    );
}