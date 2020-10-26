/** @format */

import Head from "next/head";
import { GetStaticProps } from "next";
import useSWR from "swr";
import { Fragment } from "react";
import styled from "styled-components";
import MySlider from "../components/Slider";
import Card from "../components/Card";

const motors = [
	"https://kross.eu/media/cache/filemanager_original/images/wersja_pl/slidery/pro_062020/slider_glowny_desktop_l1.png",
	"https://kross.eu/media/cache/filemanager_original/images/wersja_pl/homepage/slider/slider_4/Slider_darmowa_dostawa_v3_desktop.png",
	"https://kross.eu/media/cache/filemanager_original/images/wersja_pl/homepage/slider/slider_2/rrso_Gowna_Slider_1_desktop.png",
];

const Home: React.FC = ({ newRings }: any) => {
	const { data }: any = useSWR(`http://localhost:5000/Apart/Shop/newProducts/ring`, { initialData: newRings });
	return (
		<Fragment>
			<Head>
				<title>Home</title>
				<meta name='viewport' content='initial-scale=1.0, width=device-width' />
			</Head>
			<HomeApp>
				<MySlider photoWidth='1000px' photoHeight='700px' photos={motors} />
				<News>
					<h3>BESTSELLERY</h3>
					<CardsNews>
						{data.map((item, index) => (
							<Card key={index} item={item} />
						))}
					</CardsNews>
				</News>
			</HomeApp>
		</Fragment>
	);
};
export default Home;

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

const HomeApp = styled.div`
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

const News = styled.div`
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	width: 100vw;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

const CardsNews = styled.div`
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	width: 100vw;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: row;
`;
