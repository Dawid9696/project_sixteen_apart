/** @format */

var excel = require("excel4node");
const createExcel = (array) => {
	var workbook = new excel.Workbook();
	var worksheet = workbook.addWorksheet("List of Products");
	var style = workbook.createStyle({
		font: {
			color: "#FF0800",
			size: 12,
		},
		numberFormat: "$#,##0.00; ($#,##0.00); -",
	});
	worksheet
		.cell(array.length + 1, 1)
		.string("Nazwa produktu")
		.style(style);
	worksheet
		.cell(array.length + 1, 2)
		.string("Cena produktu")
		.style(style);
	array.forEach((item, index) => {
		worksheet
			.cell(index + 1, 1)
			.string(item.productName)
			.style(style);
		worksheet
			.cell(index + 1, 2)
			.number(item.productPrice)
			.style(style);
	});
	workbook.write("Excel.xlsx");
};

module.exports = createExcel;
