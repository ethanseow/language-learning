const dataToBeRead = {
	reading: "1",
};

const setDataToBeRead = (newData) => {
	dataToBeRead.reading = newData;
};

const readDataToBeRead = () => {
	return dataToBeRead.reading;
};

export default {
	setDataToBeRead,
	readDataToBeRead,
};
