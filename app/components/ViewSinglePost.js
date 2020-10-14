import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, withRouter } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";
import LoadingIcon from "./LoadingIcon";
import Page from "./Page";
import InvalidUrl from "./InvalidUrl";
import Axios from "axios";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function ViewSinglePost(props) {
	const appState = useContext(StateContext);
	const appDispatch = useContext(DispatchContext);

	const [isLoading, setIsLoading] = useState(true);
	const [post, setPost] = useState();
	const { id } = useParams();

	useEffect(() => {
		const req = Axios.CancelToken.source();

		async function fetchPost() {
			try {
				const response = await Axios.get(`/post/${id}`, {
					cancelToken: req.token
				});
				setPost(response.data);
				setIsLoading(false);
			} catch (e) {
				console.log("There was an error");
			}
		}
		fetchPost();
		//Cleanup axios call
		return () => {
			req.cancel();
		};
	}, [id]);

	if (!isLoading && !post) {
		return <InvalidUrl />;
	}

	if (isLoading)
		return (
			<Page title="Loading...">
				<LoadingIcon />
			</Page>
		);

	const date = new Date(post.createdDate);
	const dateFormatted = `${date.getDate()}/${
		date.getMonth() + 1
	}/${date.getFullYear()}`;

	function isOwner() {
		if (appState.loggedIn) {
			return appState.user.username == post.author.username;
		}
		return false;
	}

	async function handleDelete() {
		const confirmDelete = window.confirm(
			"Are you sure you want to delete this post?"
		);
		if (confirmDelete) {
			try {
				const response = await Axios.delete(`/post/${id}`, {
					data: { token: appState.user.token }
				});
				if (response.data == "Success") {
					//Display message
					appDispatch({
						type: "flashMessage",
						value: "Your post has been succesfully deleted."
					});
					//Redirect to profile
					props.history.push(`/profile/${appState.user.username}`);
				}
			} catch (e) {
				console.log("There was an error");
			}
		}
	}

	return (
		<Page title={post.title}>
			<div className="d-flex justify-content-between">
				<h2>{post.title}</h2>
				{isOwner() && (
					<span className="pt-2">
						<Link
							to={`/post/${post._id}/edit`}
							data-tip="Edit Post"
							data-for="edit"
							className="text-primary mr-2"
						>
							<i className="fas fa-edit"></i>
						</Link>
						<ReactTooltip id="edit" className="custom-tooltip" />{" "}
						<Link
							onClick={handleDelete}
							className="delete-post-button text-danger"
							data-tip="Delete Post"
							data-for="delete"
						>
							<i className="fas fa-trash"></i>
						</Link>
						<ReactTooltip id="delete" className="custom-tooltip" />
					</span>
				)}
			</div>

			<p className="text-muted small mb-4">
				<Link to={`/profile/${post.author.username}`}>
					<img className="avatar-tiny" src={post.author.avatar} />
				</Link>
				Posted by{" "}
				<Link to={`/profile/${post.author.username}`}>
					{post.author.username}
				</Link>{" "}
				on {dateFormatted}
			</p>

			<div className="body-content">
				<ReactMarkdown
					source={post.body}
					allowedTypes={[
						"paragraph",
						"strong",
						"emphasis",
						"text",
						"heading",
						"list",
						"listItem"
					]}
				/>
			</div>
		</Page>
	);
}

export default withRouter(ViewSinglePost);
