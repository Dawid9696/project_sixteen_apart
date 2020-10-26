/** @format */

import Router, { useRouter } from "next/router";
import Head from "next/head";
import React from "react";
import styled from "styled-components";
import { GetServerSideProps } from "next";
import Cookies from "cookies";

const AddCharm = ({ cart }) => {
	console.log(cart);
	return (
		<React.Fragment>
			<Head>
				<title>Charm</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>
			<div>AdCharm</div>
		</React.Fragment>
	);
};
export default AddCharm;

// export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
// 	const cookies = new Cookies(req, res);
// 	const response = await fetch("http://localhost:5000/Apart/Profile/profile", {
// 		method: "get",
// 		headers: {
// 			Accept: "application/json",
// 			Authorization: "Bearer " + cookies.get("myCookie"),
// 		},
// 	});

// 	const cart = await response.json();
// 	if (cart.error) {
// 		res.setHeader("Location", "/Login");
// 		res.statusCode = 302;
// 		res.end();
// 		return { props: {} };
// 	}

// 	return {
// 		props: {
// 			cart,
// 		},
// 	};
// };
