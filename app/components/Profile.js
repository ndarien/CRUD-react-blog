import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import Page from "./Page";
import ProfilePosts from "./ProfilePosts";
import StateContext from "../StateContext";
import { useImmer } from "use-immer";

function Profile() {
	const appState = useContext(StateContext);

	const { username } = useParams();

	const [state, setState] = useImmer({
		followActionLoading: false,
		startFollowingRequestCount: 0,
		stopFollowingRequestCount: 0,
		profileData: {
			profileUsername: "...",
			profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
			isFollowing: false,
			counts: { postCount: "", followerCount: "", followingCount: "" }
		}
	});

	useEffect(() => {
		const req = Axios.CancelToken.source();
		async function fetchData() {
			try {
				const response = await Axios.post(
					`/profile/${username}`,
					{
						token: appState.user.token
					},
					{
						cancelToken: req.token
					}
				);
				setState(draft => {
					draft.profileData = response.data;
				});
			} catch (e) {
				console.log("There was an error");
			}
		}
		fetchData();
		//Cleanup axios call
		return () => {
			req.cancel();
		};
	}, [username]);

	function startFollowing() {
		setState(draft => {
			draft.startFollowingRequestCount++;
		});
	}

	function stopFollowing() {
		setState(draft => {
			draft.stopFollowingRequestCount++;
		});
	}

	useEffect(() => {
		if (state.startFollowingRequestCount) {
			setState(draft => {
				draft.followActionLoading = true;
			});
			const req = Axios.CancelToken.source();
			async function fetchData() {
				try {
					const response = await Axios.post(
						`/addFollow/${state.profileData.profileUsername}`,
						{
							token: appState.user.token
						},
						{
							cancelToken: req.token
						}
					);
					setState(draft => {
						draft.profileData.isFollowing = true;
						draft.profileData.counts.followerCount++;
						draft.followActionLoading = false;
					});
				} catch (e) {
					console.log("There was an error");
				}
			}
			fetchData();
			//Cleanup axios call
			return () => {
				req.cancel();
			};
		}
	}, [state.startFollowingRequestCount]);

	useEffect(() => {
		if (state.stopFollowingRequestCount) {
			setState(draft => {
				draft.followActionLoading = true;
			});
			const req = Axios.CancelToken.source();
			async function fetchData() {
				try {
					const response = await Axios.post(
						`/removeFollow/${state.profileData.profileUsername}`,
						{
							token: appState.user.token
						},
						{
							cancelToken: req.token
						}
					);
					setState(draft => {
						draft.profileData.isFollowing = false;
						draft.profileData.counts.followerCount--;
						draft.followActionLoading = false;
					});
				} catch (e) {
					console.log("There was an error");
				}
			}
			fetchData();
			//Cleanup axios call
			return () => {
				req.cancel();
			};
		}
	}, [state.stopFollowingRequestCount]);

	return (
		<Page title="Profile">
			<h2>
				<img className="avatar-small" src={state.profileData.profileAvatar} />{" "}
				{state.profileData.profileUsername}
				{appState.loggedIn &&
					!state.profileData.isFollowing &&
					appState.user.username != state.profileData.profileUsername &&
					state.profileData.profileUsername != "..." && (
						<button
							onClick={startFollowing}
							disabled={state.followActionLoading}
							className="btn btn-primary btn-sm ml-2"
						>
							Follow <i className="fas fa-user-plus"></i>
						</button>
					)}
				{appState.loggedIn &&
					state.profileData.isFollowing &&
					appState.user.username != state.profileData.profileUsername &&
					state.profileData.profileUsername != "..." && (
						<button
							onClick={stopFollowing}
							disabled={state.followActionLoading}
							className="btn btn-danger btn-sm ml-2"
						>
							Unfollow <i className="fas fa-user-times"></i>
						</button>
					)}
			</h2>
			<div className="profile-nav nav nav-tabs pt-2 mb-4">
				<a href="#" className="active nav-item nav-link">
					Posts: {state.profileData.counts.postCount}
				</a>
				<a href="#" className="nav-item nav-link">
					Followers: {state.profileData.counts.followerCount}
				</a>
				<a href="#" className="nav-item nav-link">
					Following: {state.profileData.counts.followingCount}
				</a>
			</div>

			<ProfilePosts />
		</Page>
	);
}

export default Profile;
