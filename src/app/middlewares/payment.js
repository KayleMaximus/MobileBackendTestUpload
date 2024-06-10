
function handleExpiredDate(paymentType) {
    let currentDate = new Date();
    let newDate;
    if(paymentType === 'Monthly') {
        newDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    } else if(paymentType === 'Yearly') {
        newDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
    }

    return newDate;
}

function handlePayment(req, res, next) {
    const  {paymentType} = req.body;

    const expiredDate = handleExpiredDate(paymentType);
    const role = "Premium";

    req.expiredDate = expiredDate;
    req.role = role;

    next();
}

module.exports = handlePayment;