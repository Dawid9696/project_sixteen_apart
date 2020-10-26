/** @format */

import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { IoIosArrowDropleftCircle } from "react-icons/io";
import { IoIosArrowDroprightCircle } from "react-icons/io";

function MySlider(props) {
	const [x, setX] = useState(0);

	const goLeft = () => {
		if (x === 0) {
			setX(-100 * (props.photos.length - 1));
		} else {
			setX(x + 100);
		}
	};

	const goRight = () => {
		if (x === -100 * (props.photos.length - 1)) {
			setX(0);
		} else {
			setX(x - 100);
		}
	};

	useEffect(() => {
		const Interval = setInterval(() => {
			goRight();
		}, 5000);
		return () => {
			clearInterval(Interval);
		};
	}, [goLeft, goRight]);

	return (
		<Slider Width={props.photoWidth} Height={props.photoHeight}>
			{props.photos.map((item, index) => {
				return <Slide key={index} distance={x} photo={item}></Slide>;
			})}
			<CursorOne>
				<IoIosArrowDropleftCircle size='40px' onClick={goLeft} />
			</CursorOne>
			<CursorTwo>
				<IoIosArrowDroprightCircle size='40px' onClick={goRight} />
			</CursorTwo>
			<Indicators>
				{props.photos.map((item, index) => {
					return <Pictures key={index} smallPhoto={item} onClick={() => setX(index * -100)} actualPhoto={x / -100} indexPhoto={index}></Pictures>;
				})}
			</Indicators>
		</Slider>
	);
}

export default MySlider;

const Slider = styled.div`
	position: relative;
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	width: 100vw;
	height: 60vh;
	display: flex;
	flex-direction: row;
	align-items: center;
	overflow: hidden;
`;

const Slide = styled.div`
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	min-width: 100%;
	height: 100%;
	transform: ${(props) => `translateX(${props.distance}%)`};
	background-image: ${(props) => `url(${props.photo})`};
	background-size: cover;
	background-position: center;
	transition: 1s;
`;

const CursorOne = styled.div`
	width: 30px;
	height: 30px;
	position: absolute;
	top: 50%;
	left: 20px;
	transition: 0.25s;
	:hover {
		transform: scale(1.1);
	}
	:active {
		transform: scale(0.9);
	}
`;

const CursorTwo = styled.div`
	width: 30px;
	height: 30px;
	position: absolute;
	top: 50%;
	right: 20px;
	transition: 0.25s;
	:hover {
		transform: scale(1.1);
	}
	:active {
		transform: scale(0.9);
	}
`;

const Indicators = styled.div`
	position: absolute;
	margin: 0px;
	padding: 0px;
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: center;
	bottom: 2%;
	left: calc(50% - 180px);
`;

const Pictures = styled.div`
	margin: 10px;
	padding: 0px;
	width: 100px;
	height: 100px;
	box-sizing: border-box;
	border: ${(props) => props.actualPhoto == props.indexPhoto && "1px solid black"};
	background-image: ${(props) => `url(${props.smallPhoto})`};
	background-size: cover;
	background-position: center;
	transition: 0.5s;
	:hover {
		transform: scale(1.05);
		cursor: pointer;
	}
`;
