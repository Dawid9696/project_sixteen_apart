/** @format */

import * as React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import cookieCutter from "cookie-cutter";
import styled from "styled-components";

type FormData = {
	email: string;
	password: string;
};

const Register = () => {
	const router = useRouter();
	const { register, setValue, handleSubmit, errors } = useForm<FormData>();
	const onSubmit = ({ email, password }) => {
		const data = { email, password };
		axios
			.post("localhost:5000/Apart/Profile/login", data)
			.then((res) => {
				localStorage.setItem("cool-jwt", res.data.token);
				cookieCutter.set("myCookie", res.data.token);
				router.push("/");
			})
			.catch((err) => window.alert("Mistake"));
	};

	return (
		<React.Fragment>
			<Head>
				<title>Login</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>

			<StyleForm onSubmit={handleSubmit(onSubmit)}>
				<InputDiv>
					<StyledInput name='email' ref={register({ required: true, minLength: 3, maxLength: 20, pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g })} />
					<StyledLabel>E-mail</StyledLabel>
				</InputDiv>

				{errors.email?.type === "required" && "Your input is required"}
				{errors.email?.type === "minLength" && "Too short"}
				{errors.email?.type === "minLength" && "Too long"}
				{errors.email?.type === "pattern" && "Enter proper format !"}
				<InputDiv>
					<StyledInput
						name='password'
						ref={register({
							required: true,
							minLength: 3,
							maxLength: 20,
							pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
						})}
					/>
					<StyledLabel>Password</StyledLabel>
				</InputDiv>

				{errors.password?.type === "required" && "Your input is required"}
				{errors.password?.type === "minLength" && "Too short"}
				{errors.password?.type === "minLength" && "Too long"}
				{errors.password?.type === "pattern" && "Enter proper format !"}

				<Button type='submit' style={{ margin: "10px" }}>
					Zaloguj się
				</Button>
			</StyleForm>
		</React.Fragment>
	);
};

export default Register;

const StyleForm = styled.form`
	margin: 20px;
	padding: 20px;
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	-webkit-box-shadow: 10px 10px 14px 0px rgba(0, 0, 0, 0.75);
	-moz-box-shadow: 10px 10px 14px 0px rgba(0, 0, 0, 0.75);
	box-shadow: 10px 10px 14px 0px rgba(0, 0, 0, 0.75);
`;

const StyledLabel = styled.form`
	position: absolute;
	margin: 20px;
	padding: 0px;
	left: 0px;
	box-sizing: border-box;
	font-size: 25px;
	transition: 0.5s ease-in-out;
`;

const StyledInput = styled.input`
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	width: 100%;
	height: 40px;
	border: unset;
	text-align: center;
	color: ${(props) => props.theme.colors.main};
`;

const InputDiv = styled.div`
	position: relative;
	margin: 10px;
	padding: 0px;
	width: 30vw;
	box-sizing: border-box;
	border: unset;
	text-align: center;
	display: flex;
	justify-content: center;
	align-items: center;
	border-bottom: 1px solid grey;
	${StyledInput}:focus + ${StyledLabel} {
		transition: 0.5s ease-in-out;
		font-size: 18px;
		transform: translateY(-20px);
	}
	@media (max-width: 768px) {
		width: 70vw;
	}
`;
const Button = styled.button`
	margin: 5px;
	padding: 0px;
	box-sizing: border-box;
	width: 20vw;
	height: 40px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: grey;
	text-align: center;
	border: unset;
	color: white;
	:hover {
		cursor: pointer;
	}
	@media (max-width: 768px) {
		width: 80%;
	}
`;

const Google = styled.div`
	margin: 5px;
	padding: 0px;
	box-sizing: border-box;
	width: 20vw;
	height: 40px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #eb5043;
	text-align: center;
	color: white;
	:hover {
		cursor: pointer;
	}
	@media (max-width: 768px) {
		width: 80%;
	}
`;

const Facebook = styled.div`
	margin: 5px;
	padding: 0px;
	box-sizing: border-box;
	width: 20vw;
	height: 40px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #4c6db4;
	text-align: center;
	color: white;
	:hover {
		cursor: pointer;
	}
	@media (max-width: 768px) {
		width: 80%;
	}
`;
