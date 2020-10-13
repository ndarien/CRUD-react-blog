import React from "react";
import { Link } from "react-router-dom";
import Page from "./Page";

function InvalidUrl() {
	return (
		<Page title="Page not found!">
			<div className="text-center">
				<h2>The page you are looking for cannot be found.</h2>
				<p className="lead text-muted">
					Return to the <Link to="/">Homepage</Link>.
				</p>
			</div>
		</Page>
	);
}

export default InvalidUrl;
