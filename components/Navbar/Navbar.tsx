/** @format */

import styled from "styled-components";
import Link from "next/link";
import Cookies from "js-cookie";
import cookieCutter from "cookie-cutter";
import axios from "axios";
import { useRouter } from "next/router";
import { Fragment } from "react";

import { CgProfile, CgShoppingCart, CgHeart, CgLogIn, CgFileAdd, CgLogOut } from "react-icons/cg";

export default function Navbar() {
	const router = useRouter();
	const admin = Cookies.get("user");
	const Logout = () => {
		axios
			.post("http://localhost:5000/Apart/Profile/logoutAll", "", { headers: { Authorization: `Bearer ${Cookies.get("myCookie")}` } })
			.then((res) => {
				Cookies.remove("myCookie");
				Cookies.remove("user");
				router.push("/Login");
			})
			.catch((err) => window.alert("Mistake"));
	};
	return (
		<Nav>
			<Logo>
				<Link href={"/"} passHref scroll>
					<Image logo='https://www.apart.pl/img/logo.gif'></Image>
				</Link>
			</Logo>
			<Navigator>
				<Link href={"/"} passHref scroll>
					<NavOption>HOME</NavOption>
				</Link>
				<Link href={"/Shop"} passHref scroll>
					<NavOption>SKLEP</NavOption>
				</Link>
				<Link href={"/Contact"} passHref scroll>
					<NavOption>KONTAKT</NavOption>
				</Link>
			</Navigator>
			<Panel>
				<Input />
				{Cookies.get("myCookie") ? (
					<Fragment>
						{admin && (
							<Link href={"/AddCharm"} passHref scroll>
								<PanelOption>
									<CgFileAdd size='30px' />
								</PanelOption>
							</Link>
						)}
						<Link href={"/Profile"} passHref scroll>
							<PanelOption>
								<CgProfile size='30px' />
							</PanelOption>
						</Link>
						<Link href={"/WishList"} passHref scroll>
							<PanelOption>
								<CgHeart size='30px' />
							</PanelOption>
						</Link>
						<Link href={"/Cart"} passHref scroll>
							<PanelOption>
								<CgShoppingCart size='30px' />
							</PanelOption>
						</Link>

						<PanelOption>
							<CgLogOut onClick={Logout} size='30px' />
						</PanelOption>
					</Fragment>
				) : (
					<Link href={"/Login"} passHref scroll>
						<PanelOption>
							<CgLogIn size='30px' />
						</PanelOption>
					</Link>
				)}
			</Panel>
		</Nav>
	);
}

const BasicOptions = styled.div`
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Nav = styled(BasicOptions)`
	width: 100vw;
	flex-direction: row;
	justify-content: space-evenly;
	color: ${(props) => props.theme.colors.main};
	flex-wrap: wrap;
	background-color: white;
	@media (max-width: 768px) {
		flex-direction: column;
		width: 100vw;
	}
`;

const Logo = styled(BasicOptions)`
	flex-direction: row;
	width: 200px;
	height: 80px;
	@media (max-width: 768px) {
		width: 100vw;
	}
`;
const Image = styled(BasicOptions)`
	flex-direction: row;
	margin: 5px;
	background-image: ${(props) => `url(${props.logo})`};
	background-repeat: no-repeat;
	background-position: center;
	background-size: contain;
	max-width: 100%;
	width: 100%;
	height: 80px;
`;

const Navigator = styled(BasicOptions)`
	font-size: 18px;
	font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Arial, sans-serif;
	flex-direction: row;
	flex-wrap: wrap;
	@media (max-width: 768px) {
		width: 100vw;
	}
`;

const NavOption = styled(BasicOptions)`
	flex-wrap: wrap;
	margin: 10px;
	padding: 10px;
	min-width: 100px;
	flex-direction: row;
	:hover {
		cursor: pointer;
		color: ${(props) => props.theme.colors.fourth};
	}
	@media (max-width: 768px) {
		min-width: 80px;
		font-size: 12px;
		margin: 5px;
	}
`;

const Panel = styled(BasicOptions)`
	flex-direction: row;
	flex-wrap: wrap;
`;

const Input = styled.input.attrs((props) => ({
	type: "text",
	placeholder: "Szukaj ...",
}))`
	margin: 5px;
	padding: 10px;
	box-sizing: border-box;
	border: unset;
	color: white;
	background-color: ${(props) => props.theme.colors.third};
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	border-radius: 200px;
	@media (max-width: 768px) {
		display: none;
	}
`;

const PanelOption = styled(BasicOptions)`
	margin: 5px;
	padding: 10px;
	flex-direction: row;
	:hover {
		cursor: pointer;
		color: ${(props) => props.theme.colors.fourth};
	}
`;
