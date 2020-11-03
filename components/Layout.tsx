/** @format */

import styled from "styled-components";

import Navbar from "./Navbar/Navbar";

const Layout: React.FC<any> = ({ children, item }) => {
	return (
		<AppLayout>
			<Navbar user={item} />
			{children}
		</AppLayout>
	);
};

export default Layout;

const AppLayout = styled.div`
	margin: 0px;
	padding: 5px;
	box-sizing: border-box;
	width: 100vw;
	min-height: 100vh;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	flex-direction: column;
`;
