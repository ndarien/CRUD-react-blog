import React, { useState, useContext } from "react";
import { withRouter } from "react-router-dom";
import Axios from "axios";
import Page from "./Page";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

function CreatePost(props) {
	const [title, setTitle] = useState();
	const [body, setBody] = useState();
	const appDispatch = useContext(DispatchContext);
	const appState = useContext(StateContext);

	async function handleNewPost(e) {
		e.preventDefault();

		try {
			const response = await Axios.post("/create-post", {
				title,
				body,
				token: appState.user.token
			});
			//Redirect to post
			appDispatch({
				type: "flashMessage",
				value: "Your post has been created!"
			});
			props.history.push(`/post/${response.data}`);
			console.log("New post created!");
		} catch (e) {
			console.log("There was an error");
		}
	}

	return (
		<Page title="New Post">
			<form onSubmit={handleNewPost}>
				<div className="form-group">
					<label htmlFor="post-title" className="text-muted mb-1">
						<small>Title</small>
					</label>
					<input
						onChange={e => setTitle(e.target.value)}
						autoFocus
						name="title"
						id="post-title"
						className="form-control form-control-lg form-control-title"
						type="text"
						placeholder=""
						autoComplete="off"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="post-body" className="text-muted mb-1 d-block">
						<small>Body Content</small>
					</label>
					<textarea
						onChange={e => setBody(e.target.value)}
						name="body"
						id="post-body"
						className="body-content tall-textarea form-control"
						type="text"
					></textarea>
				</div>

				<button className="btn btn-primary">Save New Post</button>
			</form>
		</Page>
	);
}

export default withRouter(CreatePost);
