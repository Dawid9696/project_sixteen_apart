/** @format */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";
import styled from "styled-components";

type FormData = {
	productName: string;
	productPrice: number;
	productMark: string;
	productStone: string;
	productMaterial: string;
	productType: string;
};

const AddCharm = () => {
	const router = useRouter();
	const [photo, setPhoto] = useState<any>({});
	const { register, setValue, handleSubmit, errors } = useForm<FormData>();
	const onSubmit = ({ productName, productPrice, productMark, productStone, productMaterial, productType, productDescription }) => {
		const price = parseInt(productPrice);
		const data = { productName, productPrice: price, productMark, productStone, productMaterial, productType, productDescription };
		axios
			.post("http://localhost:3000/api/addProduct", data)
			.then((res) => {
				fileUploadHandler(photo, res.data._id);
			})
			.catch((err) => window.alert("Mistake"));
	};

	const fileSelectedHandler = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setPhoto(event.target.files);
	};

	const fileUploadHandler = (photo: any, id: string) => {
		const fd = new FormData();
		for (let i = 0; i < photo.length; i++) {
			fd.append("product", photo[i], photo[i].name);
		}
		axios
			.post(`http://localhost:3000/api/product/photo/${id}`, fd)
			.then(() => router.push("/Shop"))
			.catch(() => {
				window.alert("Nie udane");
			});
	};
	return (
		<React.Fragment>
			<Head>
				<title>Add product</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>
			<StyleForm onSubmit={handleSubmit(onSubmit)}>
				<h3>Dodaj nowy produkt</h3>
				<InputDiv>
					<StyledInput name='productName' ref={register({ required: true, minLength: 3, maxLength: 150 })} />
					<StyledLabel>Nazwa</StyledLabel>
				</InputDiv>
				{errors.productName?.type === "required" && "Name is required"}
				{errors.productName?.type === "minLength" && "Too short"}
				{errors.productName?.type === "minLength" && "Too long"}
				<InputDiv>
					<StyledInput name='productPrice' type='number' ref={register({ required: true, min: 0, max: 10000 })} />
					<StyledLabel>Cena</StyledLabel>
				</InputDiv>
				{errors.productPrice?.type === "required" && "Price is required"}
				{errors.productPrice?.type === "min" && "Value too low"}
				{errors.productPrice?.type === "max" && "Value too high"}
				<InputDiv>
					<StyledInput name='productMark' ref={register({ required: true })} />
					<StyledLabel>Marka</StyledLabel>
				</InputDiv>
				{errors.productMark?.type === "required" && "Mark is required"}
				<InputDiv>
					<StyledInput name='productStone' ref={register({ required: true })} />
					<StyledLabel>Kamień</StyledLabel>
				</InputDiv>
				{errors.productStone?.type === "required" && "Stone is required"}
				<InputDiv>
					<StyledInput name='productMaterial' ref={register({ required: true })} />
					<StyledLabel>Materiał</StyledLabel>
				</InputDiv>
				<p>Opis produktu</p>
				<InputDiv>
					<StyledInput name='productDescription' type='textarea' ref={register({ required: true })} />
				</InputDiv>
				{errors.productMaterial?.type === "required" && "Material is required"}

				<select name='productType' ref={register({ required: true })}>
					<option value='watch'>Zegarek</option>
					<option value='ring'>Pierscionek</option>
				</select>
				<h5>Dodaj zdjecia</h5>
				<input
					type='file'
					multiple
					onChange={(e: any) => {
						fileSelectedHandler(e);
					}}
				/>
				{errors.productType?.type === "required" && "Type is required"}
				<Button type='submit' style={{ margin: "10px" }}>
					Dodaj produkt
				</Button>
			</StyleForm>
		</React.Fragment>
	);
};
export default AddCharm;

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
