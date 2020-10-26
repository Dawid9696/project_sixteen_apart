/** @format */
import styled from "styled-components";
import Link from "next/link";
interface CardProps {
	item: {
		_id: string;
		productName: string;
		productPrice: number;
		productType: number;
	};
}
const Card: React.FC<CardProps> = ({ item }) => {
	return (
		<AppCard>
			<Link as={`/Product/${item._id}`} href='/Product/[Product]' passHref scroll>
				<Photo photo={`http://localhost:5000/Apart/Shop/product/photo/${item._id}`}></Photo>
			</Link>
			<Title>{item.productName}</Title>
			<Price>{item.productPrice} zł</Price>
		</AppCard>
	);
};

export default Card;

const AppCard = styled.div`
	margin: 10px;
	padding: 0px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	-webkit-box-shadow: 10px 10px 14px 0px rgba(0, 0, 0, 0.75);
	-moz-box-shadow: 10px 10px 14px 0px rgba(0, 0, 0, 0.75);
	box-shadow: 10px 10px 14px 0px rgba(0, 0, 0, 0.75);
	transition: 0.25s;
	:hover {
		transition: 0.25s ease-in-out;
		transform: scale(1.025);
		cursor: pointer;
	}
`;

const Photo = styled.div`
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	width: 250px;
	height: 250px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-image: ${(props) => `url(${props.photo})`};
	background-repeat: no-repeat;
	background-position: center;
`;

const Title = styled.div`
	margin: 5px;
	padding: 0px;
	box-sizing: border-box;
	font-size: 12px;
	color: ${(props) => props.theme.colors.main};
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Price = styled.div`
	margin: 5px;
	padding: 0px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
`;
