/** @format */

import Head from "next/head";
import { Fragment } from "react";
import useSWR from "swr";
import styled from "styled-components";
import { GetStaticProps } from "next";
import Card from "../components/Card";

const Shop: React.FC = ({ newRings }: any) => {
	const { data }: any = useSWR(`http://localhost:3000/api/newProducts/ring`, { initialData: newRings });
	return (
		<Fragment>
			<Head>
				<title>Shop</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>
			<ShopApp>
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
	const res = await fetch("http://localhost:3000/api/newProducts/ring");
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

const ShopApp = styled(BasicOptions)`
	flex-direction: row;
	width: 100vw;
`;

const ShopContent = styled(BasicOptions)`
	flex-direction: row;
	flex-wrap: wrap;
`;
