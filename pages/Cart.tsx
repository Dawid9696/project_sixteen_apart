/** @format */

import Router from "next/router";
import Head from "next/head";
import React from "react";
import { GetServerSideProps } from "next";

const Cart = ({ cart }) => {
	return (
		<React.Fragment>
			<Head>
				<title>Cart</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>
			<div>Twój koszyk</div>
		</React.Fragment>
	);
};
export default Cart;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const cookie = ctx.req?.headers.cookie;

	const response = await fetch("http://localhost:3000/api/profile", {
		method: "get",
		headers: {
			cookie: cookie!,
		},
	});

	if (response.status === 401 && !ctx.req) {
		Router.replace("/Login");
		return {};
	}

	if (response.status === 401 && ctx.req) {
		ctx.res?.writeHead(302, {
			Location: "http://localhost:3000/Login",
		});
		ctx.res?.end();
		return;
	}

	const cart = await response.json();

	return {
		props: {
			cart,
		},
	};
};
