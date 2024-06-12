function convertTimestampToDate(unixTimestamp, nanoseconds) {
    // Chuyển đổi Unix timestamp sang mili giây (1 giây = 1000 mili giây)
    const milliseconds = (unixTimestamp * 1000) + Math.floor(nanoseconds / 1000000);

    // Tạo đối tượng Date từ mili giây
    const date = new Date(milliseconds);
    const dateString = formatDate(date);

    return dateString;
}

function formatDate(date) {
    // Get the day, month, and year from the date object
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-indexed
    const year = date.getFullYear();

    // Combine them into the desired format
    return `${day}-${month}-${year}`;
}


module.exports = convertTimestampToDate;