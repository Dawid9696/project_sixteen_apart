/** @format */

import { useRouter } from "next/router";
import Head from "next/head";
import React, { useState, useRef } from "react";
import styled from "styled-components";
import { GetServerSideProps } from "next";
import Cookies from "cookies";
import cookieCutter from "cookie-cutter";
import axios from "axios";
import { AiOutlineWoman, AiOutlineMan } from "react-icons/ai";

const Cart = ({ myProfile }) => {
	const inputRef: React.MutableRefObject<any> = useRef();
	const router = useRouter();
	const [photo, setPhoto] = useState({});
	const fileSelectedHandler = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setPhoto(event.target.files[0]);
	};

	const fileUploadHandler = (photo: any) => {
		const fd = new FormData();
		fd.append("avatar", photo, photo.name);
		axios
			.post("http://localhost:5000/Apart/Profile/users/me/avatar", fd, { headers: { Authorization: `Bearer ${cookieCutter.get("myCookie")}` } })
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
				<Photo photo={`http://localhost:5000/Apart/Profile/users/${myProfile._id}/avatar`}>
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

				<button onClick={() => fileUploadHandler(photo)}>ZAPISZ</button>
				{myProfile.sex === "MALE" ? <AiOutlineMan size='50px' color='#38baec' /> : <AiOutlineWoman size='50px' color='#f0659e' />}
			</Profile>
		</React.Fragment>
	);
};
export default Cart;

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
	const cookies = new Cookies(req, res);
	const response = await fetch("http://localhost:5000/Apart/Profile/profile", {
		method: "get",
		headers: {
			Accept: "application/json",
			Authorization: "Bearer " + cookies.get("myCookie"),
		},
	});

	const myProfile = await response.json();

	if (myProfile.error) {
		res.setHeader("Location", "/Login");
		res.statusCode = 302;
		res.end();
		return { props: {} };
	}

	return {
		props: {
			myProfile,
		},
	};
};

const Profile = styled.div`
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	width: 100vw;
`;

const Photo = styled.div`
	position: relative;
	margin: 10px;
	padding: 0px;
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	width: 250px;
	height: 250px;
	border-radius: 50%;
	background-image: ${(props) => `url(${props.photo})`};
	background-size: contain;
	background-repeat: no-repeat;
	background-position: center;
	border: ${(props) => `3px solid ${props.theme.colors.fourth}`};
`;

const AddPhoto = styled.div`
	position: absolute;
	bottom: 20px;
	right: 20px;
	margin: 10px;
	padding: 0px;
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
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
