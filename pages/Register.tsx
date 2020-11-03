/** @format */

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";
import styled from "styled-components";

const Register = () => {
	const router = useRouter();
	const [name, setName] = useState<string>();
	const [password, setPassword] = useState<string>();
	const [email, setEmail] = useState<string>();
	const [surname, setSurname] = useState<string>();
	const [address, setAddress] = useState<string>();
	const [phone, setPhone] = useState<string>();
	const [city, setCity] = useState<string>();
	const [postalCode, setPostalCode] = useState<string>();
	const [sex, setSex] = useState<string>();
	const [rules, setRules] = useState<boolean>(true);

	const registerUser = (e) => {
		e.preventDefault();
		const data = { name, password, email, surname, address, phone, city, postalCode, sex, rules };
		axios
			.post("http://localhost:3000/api/register", data)
			.then((res) => {
				setName("");
				setPassword("");
				setEmail("");
				setSurname("");
				setAddress("");
				setPhone("");
				setCity("");
				setPostalCode("");
				router.push("/Login");
			})
			.catch(() => window.alert("Mistake"));
	};

	return (
		<React.Fragment>
			<Head>
				<title>Register</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>

			<StyleForm onSubmit={registerUser}>
				<InputDiv>
					<StyledInput type='text' value={email} onChange={(e) => setEmail(e.target.value)} />
					<StyledLabel>E-mail</StyledLabel>
				</InputDiv>
				<InputDiv>
					<StyledInput type='text' value={password} onChange={(e) => setPassword(e.target.value)} />
					<StyledLabel>Password</StyledLabel>
				</InputDiv>
				<InputDiv>
					<StyledInput type='text' value={name} onChange={(e) => setName(e.target.value)} />
					<StyledLabel>Name</StyledLabel>
				</InputDiv>
				<InputDiv>
					<StyledInput type='text' value={surname} onChange={(e) => setSurname(e.target.value)} />
					<StyledLabel>Surname</StyledLabel>
				</InputDiv>
				<InputDiv>
					<StyledInput type='text' value={phone} onChange={(e) => setPhone(e.target.value)} />
					<StyledLabel>Phone</StyledLabel>
				</InputDiv>
				<InputDiv>
					<StyledInput type='text' value={address} onChange={(e) => setAddress(e.target.value)} />
					<StyledLabel>Address</StyledLabel>
				</InputDiv>
				<InputDiv>
					<StyledInput type='text' value={city} onChange={(e) => setCity(e.target.value)} />
					<StyledLabel>City</StyledLabel>
				</InputDiv>
				<InputDiv>
					<StyledInput type='text' value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
					<StyledLabel>Postal Code</StyledLabel>
				</InputDiv>
				<select name='cars' id='cars' onChange={(e) => setSex(e.target.value)}>
					<option value='FAMALE'>Kobieta</option>
					<option value='MALE'>Mężczyzna</option>
				</select>
				<button type='submit' style={{ margin: "10px" }}>
					Zarejestruj się
				</button>
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
	box-shadow: 10px 10px 14px 0px rgba(0, 0, 0, 0.75);
`;

const StyledLabel = styled.label`
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
