import Axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import LoadingIcon from "./LoadingIcon";

function ProfilePosts() {
	const { username } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		const req = Axios.CancelToken.source();

		async function fetchPosts() {
			try {
				const response = await Axios.get(`/profile/${username}/posts`, {
					cancelToken: req.token
				});
				setPosts(response.data);
				setIsLoading(false);
			} catch (e) {
				console.log("There was an error");
			}
		}
		fetchPosts();
		//Cleanup axios call
		return () => {
			req.cancel();
		};
	}, []);

	if (isLoading)
		return (
			<div>
				<LoadingIcon />
			</div>
		);

	return (
		<div className="list-group">
			{posts.map(post => {
				const date = new Date(post.createdDate);
				const dateFormatted = `${date.getDate()}/${
					date.getMonth() + 1
				}/${date.getFullYear()}`;
				return (
					<Link
						key={post._id}
						to={`/post/${post._id}`}
						className="list-group-item list-group-item-action"
					>
						<img className="avatar-tiny" src={post.author.avatar} />{" "}
						<strong>{post.title}</strong>
						<span className="text-muted small"> on {dateFormatted} </span>
					</Link>
				);
			})}
		</div>
	);
}

export default ProfilePosts;
