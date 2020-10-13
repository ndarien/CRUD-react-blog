import React, { useContext, useEffect, useState } from "react";
import { useParams, Link, withRouter } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import LoadingIcon from "./LoadingIcon";
import Page from "./Page";
import InvalidUrl from "./InvalidUrl";
import Axios from "axios";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function EditPost(props) {
	const appState = useContext(StateContext);
	const appDispatch = useContext(DispatchContext);

	const originalState = {
		title: {
			value: "",
			hasErrors: false,
			errMessage: ""
		},
		body: {
			value: "",
			hasErrors: "",
			errMessage: ""
		},
		isFetching: true,
		isSaving: false,
		id: useParams().id,
		sendCount: 0,
		notFound: false
	};

	function aReducer(draft, action) {
		switch (action.type) {
			case "fetchComplete":
				draft.title.value = action.value.title;
				draft.body.value = action.value.body;
				draft.isFetching = false;
				break;
			case "modifyTitle":
				draft.title.hasErrors = false;
				draft.title.value = action.value;
				break;
			case "modifyBody":
				draft.body.hasErrors = false;
				draft.body.value = action.value;
				break;
			case "submitRequest":
				if (!draft.title.hasErrors && !draft.body.hasErrors) {
					draft.sendCount++;
				}
				break;
			case "saveRequestStarted":
				draft.isSaving = true;
				break;
			case "saveRequestFinished":
				draft.isSaving = false;
				break;
			case "checkTitle":
				if (!action.value.trim()) {
					draft.title.hasErrors = true;
					draft.title.errMessage = "Title cannot be blank!";
				}
				break;
			case "checkBody":
				if (!action.value.trim()) {
					draft.body.hasErrors = true;
					draft.body.errMessage = "Body cannot be blank!";
				}
				break;
			case "invalidUrl":
				draft.notFound = true;
				break;
		}
	}

	const [state, dispatch] = useImmerReducer(aReducer, originalState);

	function handleUpdate(e) {
		e.preventDefault();
		dispatch({ type: "checkTitle", value: state.title.value });
		dispatch({ type: "checkBody", value: state.body.value });
		dispatch({ type: "submitRequest" });
	}

	//Load initial values
	useEffect(() => {
		const req = Axios.CancelToken.source();

		async function fetchPost() {
			try {
				const response = await Axios.get(`/post/${state.id}`, {
					cancelToken: req.token
				});
				if (response.data) {
					dispatch({ type: "fetchComplete", value: response.data });
					if (appState.user.username != response.data.author.username) {
						appDispatch({
							type: "flashMessage",
							value: "You do not have permission to do this!"
						});
						//redirect to homepage
						props.history.push("/");
					}
				} else {
					dispatch({ type: "invalidUrl" });
				}
			} catch (e) {
				console.log("There was an error");
			}
		}
		fetchPost();
		//Cleanup axios call
		return () => {
			req.cancel();
		};
	}, []);

	//Send update request
	useEffect(() => {
		if (state.sendCount) {
			dispatch({ type: "saveRequestStarted" });
			const req = Axios.CancelToken.source();

			async function fetchPost() {
				try {
					const response = await Axios.post(
						`/post/${state.id}/edit`,
						{
							title: state.title.value,
							body: state.body.value,
							token: appState.user.token
						},
						{ cancelToken: req.token }
					);
					dispatch({ type: "saveRequestFinished" });
					appDispatch({ type: "flashMessage", value: "Post was updated!" });
				} catch (e) {
					console.log(e);
				}
			}
			fetchPost();
			//Cleanup axios call
			return () => {
				req.cancel();
			};
		}
	}, [state.sendCount]);

	if (state.notFound) {
		return <InvalidUrl />;
	}

	if (state.isFetching)
		return (
			<Page title="Loading...">
				<LoadingIcon />
			</Page>
		);

	return (
		<Page title="Edit Post">
			<Link className="small font-weight-bold" to={`/post/${state.id}`}>
				&laquo; Return to Post
			</Link>
			<form className="mt-3" onSubmit={handleUpdate}>
				<div className="form-group">
					<label htmlFor="post-title" className="text-muted mb-1">
						<small>Title</small>
					</label>
					<input
						onChange={e =>
							dispatch({ type: "modifyTitle", value: e.target.value })
						}
						onBlur={e =>
							dispatch({ type: "checkTitle", value: e.target.value })
						}
						autoFocus
						name="title"
						id="post-title"
						className="form-control form-control-lg form-control-title"
						type="text"
						placeholder=""
						autoComplete="off"
						value={state.title.value}
					/>
					{state.title.hasErrors && (
						<div className="alert alert-danger small liveValidateMessage">
							{state.title.errMessage}
						</div>
					)}
				</div>

				<div className="form-group">
					<label htmlFor="post-body" className="text-muted mb-1 d-block">
						<small>Body Content</small>
					</label>
					<textarea
						onChange={e =>
							dispatch({ type: "modifyBody", value: e.target.value })
						}
						onBlur={e => dispatch({ type: "checkBody", value: e.target.value })}
						name="body"
						id="post-body"
						className="body-content tall-textarea form-control"
						type="text"
						value={state.body.value}
					></textarea>
					{state.body.hasErrors && (
						<div className="alert alert-danger small liveValidateMessage">
							{state.body.errMessage}
						</div>
					)}
				</div>

				<button disabled={state.isSaving} className="btn btn-primary">
					Update Post
				</button>
			</form>
		</Page>
	);
}

export default withRouter(EditPost);
