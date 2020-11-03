/** @format */

import Head from "next/head";
import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import styled from "styled-components";
import useSWR from "swr";
import { Fragment } from "react";

const Charm: React.FC = ({ product }: any) => {
	const router = useRouter();
	const { data }: any = useSWR(`http://localhost:3000/api/Detail/ring/item/${router.query.Product}`, { initialData: product });
	return (
		<Fragment>
			<Head>
				<title>Charm</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>
			<AppDetailCharm>
				<SectionOne>
					<Photos>
						<Photo photo={`http://localhost:3000/api/product/photo/${data._id}/item/${1}`}></Photo>
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
			</AppDetailCharm>
		</Fragment>
	);
};
export default Charm;

export const getStaticPaths: GetStaticPaths = async () => {
	const res = await fetch("http://localhost:3000/api/Productsids");
	const Products = await res.json();
	const paths = Products.map((item) => ({
		params: { Product: item._id },
	}));
	return { paths, fallback: false };
};
export const getStaticProps: GetStaticProps = async ({ params: { Product } }: any) => {
	const res = await fetch(`http://localhost:3000/api/Detail/ring/item/${Product}`);
	const product = await res.json();
	return {
		props: {
			product,
		},
		revalidate: 1,
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
