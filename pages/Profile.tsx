/** @format */

import Router, { useRouter } from "next/router";
import Head from "next/head";
import React, { useState, useRef } from "react";
import styled from "styled-components";
import { GetServerSideProps } from "next";
import cookieCutter from "cookie-cutter";
import axios from "axios";

const Cart = ({ myProfile }) => {
	const inputRef: React.MutableRefObject<any> = useRef();
	const router = useRouter();
	const [photo, setPhoto] = useState({});
	const fileSelectedHandler = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setPhoto(event.target.files[0]);
		console.log(photo);
	};

	const fileUploadHandler = (photo: any) => {
		const fd = new FormData();
		fd.append("avatar", photo, photo.name);
		axios
			.post("http://localhost:3000/api/users/me/avatar", fd, { headers: { Authorization: `Bearer ${cookieCutter.get("myCookie")}` } })
			.then(() => router.reload())
			.catch(() => window.alert("Nie udane"));
	};
	const fileUploadAction = () => inputRef.current.click();
	return (
		<React.Fragment>
			<Head>
				<title>{myProfile.fullname}</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>
			<Profile>
				<Photo photo={`http://localhost:3000/api/users/${myProfile._id}/avatar`}>
					<AddPhoto onClick={fileUploadAction}>+</AddPhoto>
				</Photo>
				<h3>{myProfile.fullname}</h3>
				<ul>
					<li>
						<p>
							<b>Email:</b> {myProfile.email}
						</p>
					</li>
					<li>
						<p>
							<b>Phone</b> {myProfile.phone}
						</p>
					</li>
				</ul>
				<input
					hidden
					type='file'
					onChange={(e: any) => {
						fileSelectedHandler(e);
					}}
					ref={inputRef}
				/>

				<AddButton onClick={() => fileUploadHandler(photo)}>ZAPISZ</AddButton>
			</Profile>
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

	const myProfile = await response.json();

	return {
		props: {
			myProfile,
		},
	};
};

const BasicOptions = styled.div`
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
`;

const Profile = styled(BasicOptions)`
	width: 100vw;
`;

const Photo = styled(BasicOptions)`
	position: relative;
	margin: 10px;
	width: 250px;
	height: 250px;
	border-radius: 50%;
	background-image: ${(props) => `url(${props.photo})`};
	background-size: contain;
	background-repeat: no-repeat;
	background-position: center;
	border: ${(props) => `3px solid ${props.theme.colors.fourth}`};
`;

const AddPhoto = styled(BasicOptions)`
	position: absolute;
	bottom: 20px;
	right: 20px;
	margin: 10px;
	font-size: 40px;
	color: white;
	width: 50px;
	height: 50px;
	border-radius: 50%;
	background-size: contain;
	background-repeat: no-repeat;
	background-position: center;
	background-color: #80808090;
	:hover {
		cursor: pointer;
		background-color: black;
	}
`;

const AddButton = styled(BasicOptions)`
	margin: 10px;
	padding: 10px;
	font-size: 40px;
	min-width: 300px;
	color: white;
	background-size: contain;
	background-repeat: no-repeat;
	background-position: center;
	background-color: grey;
	transition: 0.25s;
	:hover {
		cursor: pointer;
		background-color: black;
	}
`;
