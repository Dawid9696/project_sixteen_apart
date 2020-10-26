/** @format */

import Head from "next/head";
import { Fragment } from "react";
import useSWR from "swr";
import styled from "styled-components";
import { GetStaticProps } from "next";
import Card from "../components/Card";

const Shop: React.FC = ({ newRings }: any) => {
	const { data }: any = useSWR(`http://localhost:5000/Apart/Shop/newProducts/ring`, { initialData: newRings });
	return (
		<Fragment>
			<Head>
				<title>Shop</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>
			<ShopApp>
				<FilterTab></FilterTab>
				<ShopContent>
					{data.map((item, index) => (
						<Card key={index} item={item} />
					))}
				</ShopContent>
			</ShopApp>
		</Fragment>
	);
};
export default Shop;

export const getStaticProps: GetStaticProps = async (context) => {
	const res = await fetch("http://localhost:5000/Apart/Shop/newProducts/ring");
	const newRings = await res.json();
	return {
		props: {
			newRings,
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

const ShopApp = styled.div`
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: row;
	width: 100vw;
	border: 1px solid red;
`;

const FilterTab = styled.div`
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	width: 20vw;
	border: 1px solid red;
`;

const ShopContent = styled.div`
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	width: 60vw;
	border: 1px solid red;
`;
