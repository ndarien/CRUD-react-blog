import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import Axios from "axios";
import StateContext from "../StateContext";

function Search() {
	const appDispatch = useContext(DispatchContext);
	const [state, setState] = useImmer({
		searchTerm: "",
		results: [],
		show: "none",
		requestCount: 0
	});

	useEffect(() => {
		document.addEventListener("keyup", searchKeyPressHandler);
		//Cleanup function
		return () => document.removeEventListener("keyup", searchKeyPressHandler);
	}, []);

	useEffect(() => {
		if (state.searchTerm.trim()) {
			setState(draft => {
				draft.show = "loading";
			});
			const delay = setTimeout(() => {
				setState(draft => {
					draft.requestCount++;
				});
			}, 600);
			//Cleanup function
			return () => {
				clearTimeout(delay);
			};
		} else {
			setState(draft => {
				draft.show = "none";
			});
		}
	}, [state.searchTerm]);

	useEffect(() => {
		if (state.requestCount) {
			const req = Axios.CancelToken.source();
			async function fetchResults() {
				try {
					const resp = await Axios.post(
						"/search",
						{ searchTerm: state.searchTerm },
						{ cancelToken: req.token }
					);
					setState(draft => {
						draft.results = resp.data;
						draft.show = "results";
					});
				} catch (e) {
					console.log("there was an error");
				}
			}
			fetchResults();
			return () => req.cancel;
		}
	}, [state.requestCount]);

	function searchKeyPressHandler(e) {
		//keycode 27 = escape key
		if (e.keyCode == 27) {
			appDispatch({ type: "searchClose" });
		}
	}

	function handleSearchInput(e) {
		const val = e.target.value;
		setState(draft => {
			draft.searchTerm = val;
		});
	}

	return (
		<div className="search-overlay">
			<div className="search-overlay-top shadow-sm">
				<div className="container container--narrow">
					<label htmlFor="live-search-field" className="search-overlay-icon">
						<i className="fas fa-search"></i>
					</label>
					<input
						onChange={handleSearchInput}
						autoFocus
						type="text"
						autoComplete="off"
						id="live-search-field"
						className="live-search-field"
						placeholder="What are you interested in?"
					/>
					<span
						onClick={() => appDispatch({ type: "searchClose" })}
						className="close-live-search"
					>
						<i className="fas fa-times-circle"></i>
					</span>
				</div>
			</div>

			<div className="search-overlay-bottom">
				<div className="container container--narrow py-3">
					<div
						className={
							"circle-loader " +
							(state.show == "loading" ? "circle-loader--visible" : "")
						}
					></div>
					<div
						className={
							"live-search-results " +
							(state.show == "results" ? "live-search-results--visible" : "")
						}
					>
						{Boolean(state.results.length) && (
							<div className="list-group shadow-sm">
								<div className="list-group-item active">
									<strong>Search Results</strong> ({state.results.length}{" "}
									{state.results.length > 1 ? "items " : "item "}
									found)
								</div>
								{state.results.map(post => {
									const date = new Date(post.createdDate);
									const dateFormatted = `${date.getDate()}/${
										date.getMonth() + 1
									}/${date.getFullYear()}`;
									return (
										<Link
											onClick={() => appDispatch({ type: "searchClose" })}
											key={post._id}
											to={`/post/${post._id}`}
											className="list-group-item list-group-item-action"
										>
											<img className="avatar-tiny" src={post.author.avatar} />{" "}
											<strong>{post.title}</strong>
											<span className="text-muted small">
												{" "}
												by {post.author.username} on {dateFormatted}{" "}
											</span>
										</Link>
									);
								})}
							</div>
						)}
						{!Boolean(state.results.length) && (
							<p className="alert alert-danger text-center shadow-sm">
								There was no results for that search term.
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Search;
