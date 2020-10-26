/** @format */

import Head from "next/head";
import { GetStaticProps, GetStaticPaths } from "next";
import axios from "axios";
import { useRouter } from "next/router";
import styled from "styled-components";
import useSWR from "swr";
import { Fragment } from "react";
import { useForm } from "react-hook-form";

type FormData = {
	comment: string;
};

const Charm: React.FC = ({ product }: any) => {
	const router = useRouter();
	const { data }: any = useSWR(`http://localhost:5000/Apart/Shop/Detail/ring/item/${router.query.Product}`, { initialData: product });
	const { register, setValue, handleSubmit, errors } = useForm<FormData>();
	const onSubmit = ({ comment }) => {
		const data = { comment };
		axios
			.post("http://vps-3afd9694.vps.ovh.net:5000/Pandora/login", data)
			.then((res) => {
				router.push("/");
			})
			.catch((err) => window.alert("Mistake"));
	};
	return (
		<Fragment>
			<Head>
				<title>Charm</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>
			<AppDetailCharm>
				<SectionOne>
					<Photos>
						<Photo photo={`http://localhost:5000/Apart/Shop/product/photo/${data._id}`}></Photo>
					</Photos>
					<Infos>
						<Title>{data.productName}</Title>
						<Access access={data.productAccess ? "Green" : "Red"}>{data.productAccess ? "Dostępny" : "Wkrótce"}</Access>
						<Price>{data.productPrice} zł</Price>
						<Options>
							<Cart>DO KOSZYKA</Cart>
							<WishList>ŻYCZENIE</WishList>
						</Options>
						<p style={{ margin: "2px" }}>lub zamów telefonicznie</p>
						<Phone>798 106 570</Phone>
						<p>Dostawa GRATIS | Wysyłka w 10 dni</p>
					</Infos>
				</SectionOne>
				<SectionTwo>
					<Descrpiton>
						<h5>Opis produktu</h5>
						<DescriptionText>Marka: {data.productMark}</DescriptionText>
						<DescriptionText>Kamień: {data.productStone}</DescriptionText>
						<DescriptionText>Surowiec: {data.productMaterial}</DescriptionText>
						<DescriptionProduct>{data.productDescription}</DescriptionProduct>
					</Descrpiton>
				</SectionTwo>
				<SectionThree>
					<h3>Komentarze:</h3>
					<Comments>
						{!data.comments ? (
							<p>Brak komentarzy</p>
						) : (
							data.comments.map((item, index) => {
								<CommentCard key={index} item={item} />;
							})
						)}
					</Comments>
					<AddComment>
						<StyleForm onSubmit={handleSubmit(onSubmit)}>
							<Input
								placeholder='Komentarz ...'
								name='comment'
								ref={register({ required: true, minLength: 3, maxLength: 20, pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g })}
							/>
							{errors.comment?.type === "required" && "Your input is required"}
							{errors.comment?.type === "minLength" && "Too short"}
							{errors.comment?.type === "minLength" && "Too long"}
							{errors.comment?.type === "pattern" && "Enter proper format !"}

							<Button type='submit' style={{ margin: "10px" }}>
								Zaloguj się
							</Button>
						</StyleForm>
					</AddComment>
				</SectionThree>
			</AppDetailCharm>
		</Fragment>
	);
};
export default Charm;

export const getStaticPaths: GetStaticPaths = async () => {
	const res = await fetch("http://localhost:5000/Apart/Shop/Productsids");
	const Products = await res.json();
	const paths = Products.map((item) => ({
		params: { Product: item._id },
	}));
	return { paths, fallback: false };
};
export const getStaticProps: GetStaticProps = async ({ params: { Product } }: any) => {
	const res = await fetch(`http://localhost:5000/Apart/Shop/Detail/ring/item/${Product}`);
	const product = await res.json();
	return {
		props: {
			product,
		},
		revalidate: 1,
	};
};

const CommentCard: React.FC<any> = ({ item }: any) => {
	return (
		<Comment>
			<ProfilePhoto>
				<PhotoComment></PhotoComment>
			</ProfilePhoto>
			<Content>
				<Info></Info>
				<Text></Text>
			</Content>
		</Comment>
	);
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

const AppDetailCharm = styled(BasicOptions)`
	padding: 20px;
	width: 100vw;
	min-height: 100vh;
	justify-content: flex-start;
`;

const SectionOne = styled(BasicOptions)`
	width: 100vw;
	flex-direction: row;
	@media (max-width: 768px) {
		flex-direction: column;
	}
`;

const Photos = styled(BasicOptions)`
	width: 30vw;
	@media (max-width: 768px) {
		width: 100vw;
	}
`;

const Photo = styled(BasicOptions)`
	width: 300px;
	height: 300px;
	background-image: ${(props) => `url(${props.photo})`};
	background-size: contain;
`;

const Infos = styled(BasicOptions)`
	width: 40vw;
	justify-content: flex-start;
	@media (max-width: 768px) {
		width: 100vw;
	}
`;
const Title = styled(BasicOptions)`
	margin: 20px;
	font-size: 25px;
	color: ${(props) => props.theme.colors.main};
	font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Arial, sans-serif;
	width: 100%;
`;

const Access = styled(BasicOptions)`
	margin: 5px;
	font-size: 15px;
	color: ${(props) => props.access};
	font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Arial, sans-serif;
	width: 100%;
`;
const Price = styled(BasicOptions)`
	margin: 5px;
	box-sizing: border-box;
	font-size: 20px;
	color: red;
	font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Arial, sans-serif;
	width: 100%;
`;
const Options = styled(BasicOptions)`
	margin: 10px;
	width: 100%;
	flex-direction: row;
`;
const Cart = styled(BasicOptions)`
	margin: 5px;
	padding: 10px;
	width: 30%;
	background-color: ${(props) => props.theme.colors.fourth};
`;
const WishList = styled(BasicOptions)`
	padding: 8px;
	width: 20%;
	border: ${(props) => `2px solid ${props.theme.colors.fourth}`};
`;
const Phone = styled(BasicOptions)`
	font-size: 20px;
	color: ${(props) => props.theme.colors.fourth};
	font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Arial, sans-serif;
	width: 40vw;
`;

const SectionTwo = styled(BasicOptions)`
	margin: 10px;
	font-size: 20px;
	width: 100vw;
`;

const Descrpiton = styled(BasicOptions)`
	font-size: 20px;
	width: 60vw;
`;

const DescriptionText = styled(BasicOptions)`
	margin: 5px;
	font-size: 20px;
	width: 100%;
`;

const DescriptionProduct = styled(BasicOptions)`
	margin: 5px;
	font-size: 20px;
	width: 100%;
`;

const SectionThree = styled(BasicOptions)`
	font-size: 20px;
	width: 100vw;
`;

const Comments = styled(BasicOptions)`
	font-size: 20px;
	width: 100vw;
`;

const AddComment = styled(BasicOptions)`
	font-size: 20px;
	width: 100vw;
`;
const StyleForm = styled(BasicOptions)`
	font-size: 20px;
	width: 100vw;
`;
const StyledInput = styled(BasicOptions)`
	font-size: 20px;
	width: 100vw;
`;

const Input = styled.input`
	font-size: 20px;
	width: 100vw; ;
`;

const Button = styled.button`
	padding: 0px;
	box-sizing: border-box;
	font-size: 20px;
	width: 100vw;
	display: flex;
	align-items: center;
	flex-direction: column;
`;

const Comment = styled(BasicOptions)`
	font-size: 20px;
	width: 100vw;
`;

const ProfilePhoto = styled(BasicOptions)`
	font-size: 20px;
	width: 100vw;
`;

const PhotoComment = styled(BasicOptions)`
	font-size: 20px;
	width: 100vw;
`;

const Content = styled(BasicOptions)`
	font-size: 20px;
	width: 100vw;
`;
const Info = styled(BasicOptions)`
	font-size: 20px;
	width: 100vw;
`;
const Text = styled(BasicOptions)`
	font-size: 20px;
	width: 100vw;
`;
