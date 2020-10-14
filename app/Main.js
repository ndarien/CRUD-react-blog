import React, { useState, useReducer, useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import Axios from "axios";
Axios.defaults.baseURL = "http://localhost:8080";

import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Footer from "./components/Footer";
import About from "./components/About";
import Terms from "./components/Terms";
import Home from "./components/Home";
import CreatePost from "./components/CreatePost";
import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessages from "./components/FlashMessages";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import Search from "./components/Search";
import InvalidUrl from "./components/InvalidUrl";

import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

function Main() {
	const initialState = {
		loggedIn: Boolean(localStorage.getItem("appToken")),
		flashMessages: [],
		user: {
			token: localStorage.getItem("appToken"),
			username: localStorage.getItem("appUsername"),
			avatar: localStorage.getItem("appAvatar")
		},
		isSearchOpen: false
	};

	function ourReducer(draft, action) {
		switch (action.type) {
			case "login":
				draft.loggedIn = true;
				draft.user = action.data;
				break;
			case "logout":
				draft.loggedIn = false;
				break;
			case "flashMessage":
				draft.flashMessages.push(action.value);
				break;
			case "searchOpen":
				draft.isSearchOpen = true;
				break;
			case "searchClose":
				draft.isSearchOpen = false;
				break;
		}
	}

	const [state, dispatch] = useImmerReducer(ourReducer, initialState);

	useEffect(() => {
		if (state.loggedIn) {
			localStorage.setItem("appToken", state.user.token);
			localStorage.setItem("appUsername", state.user.username);
			localStorage.setItem("appAvatar", state.user.avatar);
		} else {
			localStorage.removeItem("appToken");
			localStorage.removeItem("appUsername");
			localStorage.removeItem("appAvatar");
		}
	}, [state.loggedIn]);

	return (
		<StateContext.Provider value={state}>
			<DispatchContext.Provider value={dispatch}>
				<BrowserRouter>
					<FlashMessages messages={state.flashMessages} />
					<Header />
					<Switch>
						<Route path="/" exact>
							{state.loggedIn ? <Home /> : <HomeGuest />}
						</Route>
						<Route path="/create-post">
							<CreatePost />
						</Route>
						<Route path="/post/:id" exact>
							<ViewSinglePost />
						</Route>
						<Route path="/post/:id/edit" exact>
							<EditPost />
						</Route>
						<Route path="/profile/:username">
							<Profile />
						</Route>
						<Route path="/about-us">
							<About />
						</Route>
						<Route path="/terms">
							<Terms />
						</Route>
						<Route>
							<InvalidUrl />
						</Route>
					</Switch>
					<CSSTransition
						timeout={350}
						in={state.isSearchOpen}
						classNames="search-overlay"
						unmountOnExit
					>
						<Search />
					</CSSTransition>
					<Footer />
				</BrowserRouter>
			</DispatchContext.Provider>
		</StateContext.Provider>
	);
}

ReactDOM.render(<Main />, document.querySelector("#app"));

if (module.hot) {
	module.hot.accept();
}
